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

const Evidence = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [evidence, setEvidence] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [storageLocationFilter, setStorageLocationFilter] = useState<string>("");
  const [caseIDFilter, setCaseIDFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter options
  const [evidenceTypes, setEvidenceTypes] = useState<string[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    fetchEvidence();
    fetchFilterOptions();
  }, [typeFilter, storageLocationFilter, caseIDFilter]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      setIsLoadingOptions(true);
      
      const evidenceResponse = await API.post('/dynamic/evidence/aggregate', {
        groupBy: ['type'],
        limit: 100,
      });
      setEvidenceTypes(
        evidenceResponse.data.results
          .map((r: any) => r._id)
          .filter((v: any) => v !== null && v !== undefined)
      );
    } catch (err) {
      console.error("Error fetching filter options:", err);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const fetchEvidence = async () => {
    try {
      setIsLoading(true);
      
      const match: Record<string, any> = {};

      if (typeFilter !== "all") {
        match.type = typeFilter;
      }

      if (storageLocationFilter) {
        match.storageLocation = { $regex: storageLocationFilter, $options: "i" };
      }

      if (caseIDFilter) {
        match.caseID = { $regex: caseIDFilter, $options: "i" };
      }

      let response;
      if (Object.keys(match).length > 0) {
        response = await aggregationAPI.aggregate("evidence", {
          match,
          limit: 500,
        });
        setEvidence(response.results);
      } else {
        response = await API.get('/dynamic/evidence');
        setEvidence(response.data);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to load evidence');
      console.error('Error fetching evidence:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvidence = evidence.filter((item) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.evidenceID?.toLowerCase().includes(searchLower) || false) ||
      (item.caseID?.toLowerCase().includes(searchLower) || false) ||
      (item.description?.toLowerCase().includes(searchLower) || false) ||
      (item.type?.toLowerCase().includes(searchLower) || false) ||
      (item.storageLocation?.toLowerCase().includes(searchLower) || false)
    );
  });

  const clearFilters = () => {
    setTypeFilter("all");
    setStorageLocationFilter("");
    setCaseIDFilter("");
    // useEffect will automatically trigger refetch when state changes
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-orange-200/60">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Evidence
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">Manage evidence records</p>
        </div>
        <ShimmerButton 
          background="linear-gradient(to right, #ea580c, #f59e0b)"
          shimmerColor="#ffffff"
          shimmerDuration="3s"
          borderRadius="8px"
          className="shadow-md"
          onClick={() => {
            setSelectedEvidence(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Evidence
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
                  placeholder="Search by Evidence ID, Case ID, Description, Type..."
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
                  {/* Evidence Type Filter */}
                  <Select value={typeFilter} onValueChange={setTypeFilter} disabled={isLoadingOptions}>
                    <SelectTrigger className="w-[160px] h-9 text-sm">
                      <SelectValue placeholder="Evidence Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {evidenceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Storage Location Search */}
                  <Input
                    placeholder="Storage Location..."
                    value={storageLocationFilter}
                    onChange={(e) => setStorageLocationFilter(e.target.value)}
                    className="w-[180px] h-9 text-sm"
                  />

                  {/* Case ID Search */}
                  <Input
                    placeholder="Case ID..."
                    value={caseIDFilter}
                    onChange={(e) => setCaseIDFilter(e.target.value)}
                    className="w-[140px] h-9 text-sm"
                  />

                  {/* Clear Filters Button */}
                  {(typeFilter !== "all" || storageLocationFilter || caseIDFilter) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Active Filters Badges */}
                {(typeFilter !== "all" || storageLocationFilter || caseIDFilter) && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                    {typeFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Type: {typeFilter}
                      </Badge>
                    )}
                    {storageLocationFilter && (
                      <Badge variant="secondary" className="text-xs">
                        Storage: {storageLocationFilter}
                      </Badge>
                    )}
                    {caseIDFilter && (
                      <Badge variant="secondary" className="text-xs">
                        Case: {caseIDFilter}
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
                <div className="p-6 text-center text-muted-foreground text-sm">Loading evidence...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Evidence ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Case ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Storage Location</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvidence.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-8">
                          No evidence found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEvidence.map((item) => (
                        <TableRow 
                          key={item._id || item.evidenceID}
                          className="h-11 border-b border-border/30 hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="font-medium text-sm py-2.5">{item.evidenceID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{item.caseID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5">{item.description || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{item.type || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{item.storageLocation || 'N/A'}</TableCell>
                          <TableCell className="text-right py-2.5">
                            <div className="flex justify-end gap-1.5">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-muted"
                                onClick={() => {
                                  setSelectedEvidence(item);
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
                                  if (window.confirm(`Are you sure you want to delete evidence ${item.evidenceID || item._id}?`)) {
                                    try {
                                      await API.delete(`/dynamic/evidence/${item._id}`);
                                      toast.success("Evidence deleted successfully!");
                                      fetchEvidence();
                                    } catch (err: any) {
                                      toast.error(err.response?.data || "Failed to delete evidence");
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
        collectionName="evidence"
        initialData={selectedEvidence}
        onSuccess={fetchEvidence}
        title="Evidence"
      />
    </div>
  );
};

export default Evidence;

