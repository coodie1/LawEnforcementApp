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

const Incidents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  
  // Filter states
  const [crimeTypeFilter, setCrimeTypeFilter] = useState<string>("all");
  const [incidentDate, setIncidentDate] = useState<Date | undefined>(undefined);
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [officerFilter, setOfficerFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter options
  const [crimeTypes, setCrimeTypes] = useState<string[]>([]);
  const [cities, setCities] = useState<Array<{ id: string; city: string }>>([]);
  const [states, setStates] = useState<string[]>([]);
  const [officers, setOfficers] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    fetchIncidents();
    fetchFilterOptions();
  }, [crimeTypeFilter, incidentDate, cityFilter, stateFilter, officerFilter]);

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

      // Fetch locations
      const locationsResponse = await API.get('/dynamic/locations');
      const cityOptions = locationsResponse.data
        .filter((loc: any) => loc.city)
        .map((loc: any) => ({
          id: loc.locationID,
          city: loc.city,
        }))
        .filter((v: any, i: number, a: any[]) => a.findIndex((t: any) => t.city === v.city) === i)
        .sort((a: any, b: any) => a.city.localeCompare(b.city));
      setCities(cityOptions);

      const stateOptions = locationsResponse.data
        .filter((loc: any) => loc.state)
        .map((loc: any) => loc.state)
        .filter((v: any, i: number, a: any[]) => a.indexOf(v) === i)
        .sort();
      setStates(stateOptions);

      // Fetch officers
      const officersResponse = await API.get('/dynamic/officers');
      const officerOptions = officersResponse.data
        .map((officer: any) => ({
          id: officer.officerID,
          name: `${officer.firstName || ''} ${officer.lastName || ''}`.trim() || officer.officerID,
        }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
      setOfficers(officerOptions);
    } catch (err) {
      console.error("Error fetching filter options:", err);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const fetchIncidents = async () => {
    try {
      setIsLoading(true);
      
      const match: Record<string, any> = {};
      const lookup: any[] = [];

      // Crime type filter
      if (crimeTypeFilter !== "all") {
        match.crimeType = crimeTypeFilter;
      }

      // Incident date filter
      if (incidentDate) {
        const dateStr = `${incidentDate.getFullYear()}-${String(incidentDate.getMonth() + 1).padStart(2, '0')}-${String(incidentDate.getDate()).padStart(2, '0')}`;
        match.date = dateStr;
      }

      // City/State filter (via location lookup)
      if (cityFilter !== "all" || stateFilter !== "all") {
        lookup.push({
          from: "locations",
          localField: "locationID",
          foreignField: "locationID",
          as: "location"
        });
        if (cityFilter !== "all") {
          match["location.city"] = cities.find(c => c.id === cityFilter)?.city;
        }
        if (stateFilter !== "all") {
          match["location.state"] = stateFilter;
        }
      }

      // Officer filter (via case lookup)
      if (officerFilter !== "all") {
        lookup.push({
          from: "cases",
          localField: "incidentID",
          foreignField: "incidentID",
          as: "case"
        });
        match["case.leadOfficerID"] = officerFilter;
      }

      let response;
      if (Object.keys(match).length > 0 || lookup.length > 0) {
        response = await aggregationAPI.aggregate("incidents", {
          match,
          lookup,
          limit: 500,
        });
        setIncidents(response.results);
      } else {
        response = await API.get('/dynamic/incidents');
        setIncidents(response.data);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to load incidents');
      console.error('Error fetching incidents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredIncidents = incidents.filter((incident) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (incident.incidentID?.toLowerCase().includes(searchLower) || false) ||
      (incident.title?.toLowerCase().includes(searchLower) || false) ||
      (incident.crimeType?.toLowerCase().includes(searchLower) || false) ||
      (incident.locationID?.toLowerCase().includes(searchLower) || false)
    );
  });

  const clearFilters = () => {
    setCrimeTypeFilter("all");
    setIncidentDate(undefined);
    setCityFilter("all");
    setStateFilter("all");
    setOfficerFilter("all");
    // useEffect will automatically trigger refetch when state changes
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Incidents
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">Track and manage all incidents</p>
        </div>
        <ShimmerButton 
          background="linear-gradient(to right, #d97706, #ea580c)"
          shimmerColor="#ffffff"
          shimmerDuration="3s"
          borderRadius="8px"
          className="shadow-md"
          onClick={() => {
            setSelectedIncident(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Incident
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
                  placeholder="Search by Incident ID, Title, Crime Type..."
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

                  {/* Incident Date */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[180px] h-9 justify-start text-left font-normal text-sm">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {incidentDate ? format(incidentDate, "MMM d, yyyy") : "Incident Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" side="bottom" align="start">
                      <Calendar mode="single" selected={incidentDate} onSelect={setIncidentDate} />
                    </PopoverContent>
                  </Popover>

                  {/* City Filter */}
                  <Select value={cityFilter} onValueChange={setCityFilter} disabled={isLoadingOptions}>
                    <SelectTrigger className="w-[160px] h-9 text-sm">
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* State Filter */}
                  <Select value={stateFilter} onValueChange={setStateFilter} disabled={isLoadingOptions}>
                    <SelectTrigger className="w-[140px] h-9 text-sm">
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Officer Filter */}
                  <Select value={officerFilter} onValueChange={setOfficerFilter} disabled={isLoadingOptions}>
                    <SelectTrigger className="w-[180px] h-9 text-sm">
                      <SelectValue placeholder="Officer Involved" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Officers</SelectItem>
                      {officers.map((officer) => (
                        <SelectItem key={officer.id} value={officer.id}>
                          {officer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Clear Filters Button */}
                  {(crimeTypeFilter !== "all" || incidentDate || cityFilter !== "all" || stateFilter !== "all" || officerFilter !== "all") && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Active Filters Badges */}
                {(crimeTypeFilter !== "all" || incidentDate || cityFilter !== "all" || stateFilter !== "all" || officerFilter !== "all") && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                    {crimeTypeFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Crime: {crimeTypeFilter}
                      </Badge>
                    )}
                    {incidentDate && (
                      <Badge variant="secondary" className="text-xs">
                        Incident Date: {format(incidentDate, "MMM d, yyyy")}
                      </Badge>
                    )}
                    {cityFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        City: {cities.find(c => c.id === cityFilter)?.city || cityFilter}
                      </Badge>
                    )}
                    {stateFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        State: {stateFilter}
                      </Badge>
                    )}
                    {officerFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Officer: {officers.find(o => o.id === officerFilter)?.name || officerFilter}
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
                <div className="p-6 text-center text-muted-foreground text-sm">Loading incidents...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Incident ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Crime Type</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncidents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-8">
                          No incidents found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredIncidents.map((incident) => (
                        <TableRow 
                          key={incident._id || incident.incidentID}
                          className="h-11 border-b border-border/30 hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="font-medium text-sm py-2.5">{incident.incidentID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5">{incident.title || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{incident.crimeType || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">
                            {incident.date ? new Date(incident.date).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">
                            {incident.location?.city || incident.locationID || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right py-2.5">
                            <div className="flex justify-end gap-1.5">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-muted"
                                onClick={() => {
                                  setSelectedIncident(incident);
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
                                  if (window.confirm(`Are you sure you want to delete incident ${incident.incidentID || incident._id}?`)) {
                                    try {
                                      await API.delete(`/dynamic/incidents/${incident._id}`);
                                      toast.success("Incident deleted successfully!");
                                      fetchIncidents();
                                    } catch (err: any) {
                                      toast.error(err.response?.data || "Failed to delete incident");
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
        collectionName="incidents"
        initialData={selectedIncident}
        onSuccess={fetchIncidents}
        title="Incidents"
      />
    </div>
  );
};

export default Incidents;
