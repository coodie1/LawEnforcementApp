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

const Cases = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [crimeTypeFilter, setCrimeTypeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [openingDate, setOpeningDate] = useState<Date | undefined>(undefined);
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [crimeTypes, setCrimeTypes] = useState<string[]>([]);
  const [locations, setLocations] = useState<Array<{ id: string; address: string }>>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCases();
    fetchFilterOptions();
  }, [statusFilter, crimeTypeFilter, locationFilter, openingDate]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      setIsLoadingOptions(true);
      // Fetch unique crime types
      const crimeTypesResponse = await API.post('/dynamic/incidents/aggregate', {
        groupBy: ['crimeType'],
        limit: 100,
      });
      setCrimeTypes(
        crimeTypesResponse.data.results
          .map((r: any) => r._id)
          .filter((v: any) => v !== null && v !== undefined)
      );

      // Fetch locations with addresses
      const locationsResponse = await API.get('/dynamic/locations');
      const locationOptions = locationsResponse.data
        .filter((loc: any) => loc.address || loc.city || loc.state)
        .map((loc: any) => ({
          id: loc.locationID,
          address: loc.address || `${loc.city || ''}${loc.city && loc.state ? ', ' : ''}${loc.state || ''}`.trim() || loc.locationID,
        }))
        .sort((a: any, b: any) => a.address.localeCompare(b.address));
      setLocations(locationOptions);
    } catch (err) {
      console.error("Error fetching filter options:", err);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      
      // Build match conditions
      const match: Record<string, any> = {};
      
      if (statusFilter !== "all") {
        match.status = { $regex: statusFilter, $options: "i" };
      }
      
      if (openingDate) {
        // Convert date to YYYY-MM-DD format string to match database format
        const year = openingDate.getFullYear();
        const month = String(openingDate.getMonth() + 1).padStart(2, '0');
        const day = String(openingDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        // Use regex to match the date string (handles different date formats)
        // This will match dates like "2024-01-15", "2024-1-15", "2024/01/15", etc.
        match.openingDate = { $regex: dateString, $options: 'i' };
        console.log('Filtering by openingDate:', dateString);
      }

      // Build lookup stages for joining with incidents
      const lookup = [
        {
          from: "incidents",
          localField: "incidentID",
          foreignField: "incidentID",
          as: "incident",
        },
      ];

      // If crime type or location filter is active, filter by incident
      if (crimeTypeFilter !== "all" || locationFilter !== "all") {
        if (crimeTypeFilter !== "all") {
          match["incident.crimeType"] = crimeTypeFilter;
        }
        if (locationFilter !== "all") {
          match["incident.locationID"] = locationFilter;
        }
      }

      // Use aggregation if filters are active, otherwise use regular GET
      if (Object.keys(match).length > 0 || lookup.length > 0) {
        const response = await aggregationAPI.aggregate("cases", {
          match,
          lookup,
          limit: 200,
        });
        setCases(response.results);
      } else {
      const response = await API.get('/dynamic/cases');
      setCases(response.data);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data || 'Failed to load cases');
      console.error('Error fetching cases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCases = cases.filter((caseItem) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (caseItem.caseID?.toLowerCase().includes(searchLower) || false) ||
      (caseItem.incidentID?.toLowerCase().includes(searchLower) || false)
    );
  });

  const clearFilters = () => {
    setStatusFilter("all");
    setCrimeTypeFilter("all");
    setLocationFilter("all");
    setOpeningDate(undefined);
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case "open":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "closed":
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
      case "under_investigation":
      case "under investigation":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "pending":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-blue-200/60">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Cases
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">Manage and track all case files</p>
        </div>
        <ShimmerButton 
          background="linear-gradient(to right, #2563eb, #4f46e5)"
          shimmerColor="#ffffff"
          shimmerDuration="3s"
          borderRadius="8px"
          className="shadow-md"
          onClick={() => {
            setSelectedCase(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Case
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
                  placeholder="Search by Case ID, Incident ID, Person Name, or Officer Name..."
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

            {/* Filters Panel - Shown when showFilters is true */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showFilters
                  ? "max-h-[500px] opacity-100 translate-y-0"
                  : "max-h-0 opacity-0 -translate-y-2"
              }`}
            >
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] h-9 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              {/* Crime Type Filter */}
              <Select value={crimeTypeFilter} onValueChange={setCrimeTypeFilter} disabled={isLoadingOptions}>
                <SelectTrigger className="w-[160px] h-9 text-sm">
                  <SelectValue placeholder="Crime Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crime Types</SelectItem>
                  {crimeTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Location Filter - Shows Address */}
              <Select value={locationFilter} onValueChange={setLocationFilter} disabled={isLoadingOptions}>
                <SelectTrigger className="w-[200px] h-9 text-sm">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Opening Date Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[180px] h-9 justify-start text-left font-normal text-sm">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {openingDate ? format(openingDate, "PPP") : "Opening Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" side="bottom" align="start">
                  <Calendar mode="single" selected={openingDate} onSelect={setOpeningDate} />
                </PopoverContent>
              </Popover>

                  {/* Clear Filters Button */}
                  {(statusFilter !== "all" || crimeTypeFilter !== "all" || locationFilter !== "all" || openingDate) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Active Filters Badges */}
                {(statusFilter !== "all" || crimeTypeFilter !== "all" || locationFilter !== "all" || openingDate) && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                    {statusFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Status: {statusFilter}
                      </Badge>
                    )}
                    {crimeTypeFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Crime: {crimeTypeFilter}
                      </Badge>
                    )}
                    {locationFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Location: {locations.find(l => l.id === locationFilter)?.address || locationFilter}
                      </Badge>
                    )}
                    {openingDate && (
                      <Badge variant="secondary" className="text-xs">
                        Opening Date: {format(openingDate, "MMM d")}
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
                <div className="p-6 text-center text-muted-foreground text-sm">Loading cases...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Case ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Incident ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Opening Date</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground text-sm py-8">
                          No cases found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCases.map((caseItem) => (
                        <TableRow 
                          key={caseItem._id || caseItem.caseID}
                          className="h-11 border-b border-border/30 hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="font-medium text-sm py-2.5">{caseItem.caseID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{caseItem.incidentID || 'N/A'}</TableCell>
                          <TableCell className="py-2.5">
                            <Badge variant="outline" className={`${getStatusColor(caseItem.status || 'pending')} rounded-md px-2 py-0.5 text-xs font-medium`}>
                              {caseItem.status || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">
                            {caseItem.openingDate ? new Date(caseItem.openingDate).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right py-2.5">
                            <div className="flex justify-end gap-1.5">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-muted"
                                onClick={() => {
                                  setSelectedCase(caseItem);
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
                                  if (window.confirm(`Are you sure you want to delete case ${caseItem.caseID || caseItem._id}?`)) {
                                    try {
                                      await API.delete(`/dynamic/cases/${caseItem._id}`);
                                      toast.success("Case deleted successfully!");
                                      fetchCases();
                                    } catch (err: any) {
                                      toast.error(err.response?.data || "Failed to delete case");
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
        collectionName="cases"
        initialData={selectedCase}
        onSuccess={fetchCases}
        title="Cases"
      />
    </div>
  );
};

export default Cases;
