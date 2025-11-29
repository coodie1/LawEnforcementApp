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

const Locations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  
  // Filter states
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter options
  const [cities, setCities] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    fetchLocations();
    fetchFilterOptions();
  }, [cityFilter, stateFilter]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      setIsLoadingOptions(true);
      
      const locationsResponse = await API.get('/dynamic/locations');
      const cityOptions = locationsResponse.data
        .filter((loc: any) => loc.city)
        .map((loc: any) => loc.city)
        .filter((v: any, i: number, a: any[]) => a.indexOf(v) === i)
        .sort();
      setCities(cityOptions);

      const stateOptions = locationsResponse.data
        .filter((loc: any) => loc.state)
        .map((loc: any) => loc.state)
        .filter((v: any, i: number, a: any[]) => a.indexOf(v) === i)
        .sort();
      setStates(stateOptions);
    } catch (err) {
      console.error("Error fetching filter options:", err);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      
      const match: Record<string, any> = {};

      if (cityFilter !== "all") {
        match.city = cityFilter;
      }

      if (stateFilter !== "all") {
        match.state = stateFilter;
      }

      let response;
      if (Object.keys(match).length > 0) {
        response = await aggregationAPI.aggregate("locations", {
          match,
          limit: 500,
        });
        setLocations(response.results);
      } else {
        response = await API.get('/dynamic/locations');
        setLocations(response.data);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to load locations');
      console.error('Error fetching locations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLocations = locations.filter((location) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (location.locationID?.toLowerCase().includes(searchLower) || false) ||
      (location.address?.toLowerCase().includes(searchLower) || false) ||
      (location.city?.toLowerCase().includes(searchLower) || false) ||
      (location.state?.toLowerCase().includes(searchLower) || false)
    );
  });

  const clearFilters = () => {
    setCityFilter("all");
    setStateFilter("all");
    // useEffect will automatically trigger refetch when state changes
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
            Locations
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">Manage location records</p>
        </div>
        <ShimmerButton 
          background="linear-gradient(to right, #b45309, #c2410c)"
          shimmerColor="#ffffff"
          shimmerDuration="3s"
          borderRadius="8px"
          className="shadow-md"
          onClick={() => {
            setSelectedLocation(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Location
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
                  placeholder="Search by Location ID, Address, City, or State..."
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
                  {/* City Filter */}
                  <Select value={cityFilter} onValueChange={setCityFilter} disabled={isLoadingOptions}>
                    <SelectTrigger className="w-[180px] h-9 text-sm">
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
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

                  {/* Clear Filters Button */}
                  {(cityFilter !== "all" || stateFilter !== "all") && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Active Filters Badges */}
                {(cityFilter !== "all" || stateFilter !== "all") && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                    {cityFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        City: {cityFilter}
                      </Badge>
                    )}
                    {stateFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        State: {stateFilter}
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
                <div className="p-6 text-center text-muted-foreground text-sm">Loading locations...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">City</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">State</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLocations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground text-sm py-8">
                          No locations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLocations.map((location) => (
                        <TableRow 
                          key={location._id || location.locationID}
                          className="h-11 border-b border-border/30 hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="font-medium text-sm py-2.5">{location.locationID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5">{location.address || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{location.city || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{location.state || 'N/A'}</TableCell>
                          <TableCell className="text-right py-2.5">
                            <div className="flex justify-end gap-1.5">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-muted"
                                onClick={() => {
                                  setSelectedLocation(location);
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
                                  if (window.confirm(`Are you sure you want to delete location ${location.locationID || location._id}?`)) {
                                    try {
                                      await API.delete(`/dynamic/locations/${location._id}`);
                                      toast.success("Location deleted successfully!");
                                      fetchLocations();
                                    } catch (err: any) {
                                      toast.error(err.response?.data || "Failed to delete location");
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
        collectionName="locations"
        initialData={selectedLocation}
        onSuccess={fetchLocations}
        title="Locations"
      />
    </div>
  );
};

export default Locations;

