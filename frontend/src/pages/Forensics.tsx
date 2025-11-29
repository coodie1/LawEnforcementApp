import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, CalendarIcon, X, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import API from "@/api.ts";
import { aggregationAPI } from "@/api.ts";
import { CollectionFormDialog } from "@/components/CollectionFormDialog";
import { toast } from "sonner";

const Forensics = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [forensics, setForensics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedForensic, setSelectedForensic] = useState<any>(null);
  
  // Filter states
  const [analysisTypeFilter, setAnalysisTypeFilter] = useState<string>("all");
  const [caseIDFilter, setCaseIDFilter] = useState<string>("");
  const [dateAnalyzed, setDateAnalyzed] = useState<Date | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter options
  const [analysisTypes, setAnalysisTypes] = useState<string[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    fetchForensics();
    fetchFilterOptions();
  }, [analysisTypeFilter, caseIDFilter, dateAnalyzed]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      setIsLoadingOptions(true);
      
      const forensicsResponse = await API.post('/dynamic/forensics/aggregate', {
        groupBy: ['analysisType'],
        limit: 100,
      });
      setAnalysisTypes(
        forensicsResponse.data.results
          .map((r: any) => r._id)
          .filter((v: any) => v !== null && v !== undefined)
      );
    } catch (err) {
      console.error("Error fetching filter options:", err);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const fetchForensics = async () => {
    try {
      setIsLoading(true);
      
      const match: Record<string, any> = {};

      if (analysisTypeFilter !== "all") {
        match.analysisType = analysisTypeFilter;
      }

      if (caseIDFilter) {
        match.caseID = { $regex: caseIDFilter, $options: "i" };
      }

      // Date analyzed filter
      if (dateAnalyzed) {
        const dateStr = `${dateAnalyzed.getFullYear()}-${String(dateAnalyzed.getMonth() + 1).padStart(2, '0')}-${String(dateAnalyzed.getDate()).padStart(2, '0')}`;
        match.dateAnalyzed = dateStr;
      }

      let response;
      if (Object.keys(match).length > 0) {
        response = await aggregationAPI.aggregate("forensics", {
          match,
          limit: 500,
        });
        setForensics(response.results);
      } else {
        response = await API.get('/dynamic/forensics');
        setForensics(response.data);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to load forensics');
      console.error('Error fetching forensics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredForensics = forensics.filter((forensic) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (forensic.forensicsID?.toLowerCase().includes(searchLower) || false) ||
      (forensic.evidenceID?.toLowerCase().includes(searchLower) || false) ||
      (forensic.caseID?.toLowerCase().includes(searchLower) || false) ||
      (forensic.analysisType?.toLowerCase().includes(searchLower) || false)
    );
  });

  const clearFilters = () => {
    setAnalysisTypeFilter("all");
    setCaseIDFilter("");
    setDateAnalyzed(undefined);
    // useEffect will automatically trigger refetch when state changes
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-cyan-200/60">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
            Forensics
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">Manage forensic analysis records</p>
        </div>
        <ShimmerButton 
          background="linear-gradient(to right, #0891b2, #0d9488)"
          shimmerColor="#ffffff"
          shimmerDuration="3s"
          borderRadius="8px"
          className="shadow-md"
          onClick={() => {
            setSelectedForensic(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Forensic
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
                  placeholder="Search by Forensics ID, Evidence ID, Case ID, or Analysis Type..."
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
                  {/* Analysis Type Filter */}
                  <Select value={analysisTypeFilter} onValueChange={setAnalysisTypeFilter} disabled={isLoadingOptions}>
                    <SelectTrigger className="w-[180px] h-9 text-sm">
                      <SelectValue placeholder="Analysis Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {analysisTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Case ID Search */}
                  <Input
                    placeholder="Case ID..."
                    value={caseIDFilter}
                    onChange={(e) => setCaseIDFilter(e.target.value)}
                    className="w-[140px] h-9 text-sm"
                  />

                  {/* Date Analyzed */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[180px] h-9 justify-start text-left font-normal text-sm">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateAnalyzed ? format(dateAnalyzed, "MMM d, yyyy") : "Date Analyzed"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" side="bottom" align="start">
                      <Calendar mode="single" selected={dateAnalyzed} onSelect={setDateAnalyzed} />
                    </PopoverContent>
                  </Popover>

                  {/* Clear Filters Button */}
                  {(analysisTypeFilter !== "all" || caseIDFilter || dateAnalyzed) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Active Filters Badges */}
                {(analysisTypeFilter !== "all" || caseIDFilter || dateAnalyzed) && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                    {analysisTypeFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Type: {analysisTypeFilter}
                      </Badge>
                    )}
                    {caseIDFilter && (
                      <Badge variant="secondary" className="text-xs">
                        Case: {caseIDFilter}
                      </Badge>
                    )}
                    {dateAnalyzed && (
                      <Badge variant="secondary" className="text-xs">
                        Date Analyzed: {format(dateAnalyzed, "MMM d, yyyy")}
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
                <div className="p-6 text-center text-muted-foreground text-sm">Loading forensics...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Forensics ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Evidence ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Case ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Analysis Type</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date Analyzed</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredForensics.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-8">
                          No forensics found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredForensics.map((forensic) => (
                        <TableRow 
                          key={forensic._id || forensic.forensicsID}
                          className="h-11 border-b border-border/30 hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="font-medium text-sm py-2.5">{forensic.forensicsID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{forensic.evidenceID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{forensic.caseID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{forensic.analysisType || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">
                            {forensic.dateAnalyzed ? new Date(forensic.dateAnalyzed).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right py-2.5">
                            <div className="flex justify-end gap-1.5">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-muted"
                                onClick={() => {
                                  setSelectedForensic(forensic);
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
                                  if (window.confirm(`Are you sure you want to delete forensic ${forensic.forensicsID || forensic._id}?`)) {
                                    try {
                                      await API.delete(`/dynamic/forensics/${forensic._id}`);
                                      toast.success("Forensic deleted successfully!");
                                      fetchForensics();
                                    } catch (err: any) {
                                      toast.error(err.response?.data || "Failed to delete forensic");
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
        collectionName="forensics"
        initialData={selectedForensic}
        onSuccess={fetchForensics}
        title="Forensics"
      />
    </div>
  );
};

export default Forensics;

