import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, X, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import API from "@/api.ts";
import { aggregationAPI } from "@/api.ts";
import { CollectionFormDialog } from "@/components/CollectionFormDialog";
import { toast } from "sonner";

const Sentences = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sentences, setSentences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSentence, setSelectedSentence] = useState<any>(null);
  
  // Filter states
  const [sentenceTypeFilter, setSentenceTypeFilter] = useState<string>("all");
  const [durationMin, setDurationMin] = useState<string>("");
  const [durationMax, setDurationMax] = useState<string>("");
  const [caseIDFilter, setCaseIDFilter] = useState<string>("");
  const [personNameFilter, setPersonNameFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter options
  const [sentenceTypes, setSentenceTypes] = useState<string[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    fetchSentences();
    fetchFilterOptions();
  }, [sentenceTypeFilter, durationMin, durationMax, caseIDFilter, personNameFilter]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      setIsLoadingOptions(true);
      
      // Fetch unique sentence types
      const sentencesResponse = await API.post('/dynamic/sentences/aggregate', {
        groupBy: ['type'],
        limit: 100,
      });
      setSentenceTypes(
        sentencesResponse.data.results
          .map((r: any) => r._id)
          .filter((v: any) => v !== null && v !== undefined)
      );
    } catch (err) {
      console.error("Error fetching filter options:", err);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const parseDuration = (duration: string): number | null => {
    if (!duration) return null;
    // Try to extract number from duration string (e.g., "5 years" -> 5, "10 months" -> 10)
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  const fetchSentences = async () => {
    try {
      setIsLoading(true);
      
      const match: Record<string, any> = {};
      const lookup: any[] = [];

      if (sentenceTypeFilter !== "all") {
        match.type = sentenceTypeFilter;
      }

      if (caseIDFilter) {
        match.caseID = { $regex: caseIDFilter, $options: "i" };
      }

      // Person name filter (via person lookup)
      if (personNameFilter) {
        lookup.push({
          from: "people",
          localField: "personID",
          foreignField: "personID",
          as: "person"
        });
        match["person.firstName"] = { $regex: personNameFilter, $options: "i" };
      }

      let response;
      if (Object.keys(match).length > 0 || lookup.length > 0) {
        response = await aggregationAPI.aggregate("sentences", {
          match,
          lookup,
          limit: 500,
        });
        setSentences(response.results);
      } else {
        response = await API.get('/dynamic/sentences');
        setSentences(response.data);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to load sentences');
      console.error('Error fetching sentences:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSentences = sentences.filter((sentence) => {
    // Duration range filter (client-side since duration is a string)
    if (durationMin || durationMax) {
      const duration = parseDuration(sentence.duration);
      if (duration === null) return false;
      if (durationMin && duration < parseInt(durationMin)) return false;
      if (durationMax && duration > parseInt(durationMax)) return false;
    }

    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        (sentence.sentenceID?.toLowerCase().includes(searchLower) || false) ||
        (sentence.caseID?.toLowerCase().includes(searchLower) || false) ||
        (sentence.personID?.toLowerCase().includes(searchLower) || false) ||
        (sentence.type?.toLowerCase().includes(searchLower) || false) ||
        (sentence.duration?.toLowerCase().includes(searchLower) || false) ||
        (sentence.person?.firstName?.toLowerCase().includes(searchLower) || false) ||
        (sentence.person?.lastName?.toLowerCase().includes(searchLower) || false)
      );
      if (!matchesSearch) return false;
    }

    return true;
  });

  const clearFilters = () => {
    setSentenceTypeFilter("all");
    setDurationMin("");
    setDurationMax("");
    setCaseIDFilter("");
    setPersonNameFilter("");
    // useEffect will automatically trigger refetch when state changes
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-fuchsia-200/60">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
            Sentences
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">Manage sentencing records</p>
        </div>
        <ShimmerButton 
          background="linear-gradient(to right, #c026d3, #db2777)"
          shimmerColor="#ffffff"
          shimmerDuration="3s"
          borderRadius="8px"
          className="shadow-md"
          onClick={() => {
            setSelectedSentence(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Sentence
        </ShimmerButton>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Search and Filter Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by Sentence ID, Case ID, Person ID, Type, or Person Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9 text-sm"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-9 gap-2 transition-all duration-200 ${
                  showFilters 
                    ? "bg-primary/10 border-primary/50" 
                    : ""
                }`}
              >
                <Filter className={`h-4 w-4 transition-transform duration-200 ${
                  showFilters ? "rotate-180" : ""
                }`} />
                Filters
              </Button>
            </div>

            {/* Filters Panel */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showFilters
                  ? "max-h-[500px] opacity-100 translate-y-0"
                  : "max-h-0 opacity-0 -translate-y-2"
              }`}
            >
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Sentence Type Filter */}
                  <Select value={sentenceTypeFilter} onValueChange={setSentenceTypeFilter} disabled={isLoadingOptions}>
                    <SelectTrigger className="w-[160px] h-9 text-sm">
                      <SelectValue placeholder="Sentence Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {sentenceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Duration Range */}
                  <Input
                    type="number"
                    placeholder="Min Duration"
                    value={durationMin}
                    onChange={(e) => setDurationMin(e.target.value)}
                    className="w-[120px] h-9 text-sm"
                    min="0"
                  />
                  <Input
                    type="number"
                    placeholder="Max Duration"
                    value={durationMax}
                    onChange={(e) => setDurationMax(e.target.value)}
                    className="w-[120px] h-9 text-sm"
                    min="0"
                  />

                  {/* Case ID Search */}
                  <Input
                    placeholder="Case ID..."
                    value={caseIDFilter}
                    onChange={(e) => setCaseIDFilter(e.target.value)}
                    className="w-[140px] h-9 text-sm"
                  />

                  {/* Person Name Search */}
                  <Input
                    placeholder="Person Name..."
                    value={personNameFilter}
                    onChange={(e) => setPersonNameFilter(e.target.value)}
                    className="w-[160px] h-9 text-sm"
                  />

                  {/* Clear Filters Button */}
                  {(sentenceTypeFilter !== "all" || durationMin || durationMax || caseIDFilter || personNameFilter) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Active Filters Badges */}
                {(sentenceTypeFilter !== "all" || durationMin || durationMax || caseIDFilter || personNameFilter) && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                    {sentenceTypeFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Type: {sentenceTypeFilter}
                      </Badge>
                    )}
                    {(durationMin || durationMax) && (
                      <Badge variant="secondary" className="text-xs">
                        Duration: {durationMin || "0"} - {durationMax || "∞"}
                      </Badge>
                    )}
                    {caseIDFilter && (
                      <Badge variant="secondary" className="text-xs">
                        Case: {caseIDFilter}
                      </Badge>
                    )}
                    {personNameFilter && (
                      <Badge variant="secondary" className="text-xs">
                        Person: {personNameFilter}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border/50 overflow-hidden shadow-sm">
              {error && (
                <div className="p-3 text-destructive text-sm bg-destructive/10">{error}</div>
              )}
              {isLoading ? (
                <div className="p-6 text-center text-muted-foreground text-sm">Loading sentences...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sentence ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Case ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Person</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSentences.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-8">
                          No sentences found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSentences.map((sentence) => (
                        <TableRow 
                          key={sentence._id || sentence.sentenceID}
                          className="h-11 border-b border-border/30 hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="font-medium text-sm py-2.5">{sentence.sentenceID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{sentence.caseID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">
                            {sentence.person ? `${sentence.person.firstName || ''} ${sentence.person.lastName || ''}`.trim() : sentence.personID || 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{sentence.type || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{sentence.duration || 'N/A'}</TableCell>
                          <TableCell className="text-right py-2.5">
                            <div className="flex justify-end gap-1.5">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-muted"
                                onClick={() => {
                                  setSelectedSentence(sentence);
                                  setDialogOpen(true);
                                }}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                onClick={async () => {
                                  if (window.confirm(`Are you sure you want to delete sentence ${sentence.sentenceID || sentence._id}?`)) {
                                    try {
                                      await API.delete(`/dynamic/sentences/${sentence._id}`);
                                      toast.success("Sentence deleted successfully!");
                                      fetchSentences();
                                    } catch (err: any) {
                                      toast.error(err.response?.data || "Failed to delete sentence");
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <CollectionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        collectionName="sentences"
        initialData={selectedSentence}
        onSuccess={fetchSentences}
        title="Sentences"
      />
    </div>
  );
};

export default Sentences;

