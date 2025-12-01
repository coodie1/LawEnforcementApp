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
import { ArrestRegistrationDialog } from "@/components/ArrestRegistrationDialog";
import { toast } from "sonner";

const Arrests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [arrests, setArrests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedArrest, setSelectedArrest] = useState<any>(null);
  
  // Filter states
  const [arrestDate, setArrestDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [officerFilter, setOfficerFilter] = useState<string>("all");
  const [personNameFilter, setPersonNameFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter options
  const [cities, setCities] = useState<Array<{ id: string; city: string }>>([]);
  const [officers, setOfficers] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    fetchArrests();
    fetchFilterOptions();
  }, [arrestDate, cityFilter, officerFilter, personNameFilter]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      setIsLoadingOptions(true);
      
      // Fetch cities from locations
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

  const fetchArrests = async () => {
    try {
      setIsLoading(true);
      
      const match: Record<string, any> = {};
      const lookup: any[] = [];

      // Arrest date filter
      if (arrestDate) {
        const dateStr = `${arrestDate.getFullYear()}-${String(arrestDate.getMonth() + 1).padStart(2, '0')}-${String(arrestDate.getDate()).padStart(2, '0')}`;
        match.date = dateStr;
      }

      // City filter (via location lookup)
      if (cityFilter !== "all") {
        lookup.push({
          from: "locations",
          localField: "locationID",
          foreignField: "locationID",
          as: "location"
        });
      }

      // Officer filter (via case lookup)
      if (officerFilter !== "all" || personNameFilter) {
        lookup.push({
          from: "cases",
          localField: "caseID",
          foreignField: "caseID",
          as: "case"
        });
      }

      // Person name filter (via person lookup)
      if (personNameFilter) {
        lookup.push({
          from: "people",
          localField: "personID",
          foreignField: "personID",
          as: "person"
        });
      }

      let response;
      if (Object.keys(match).length > 0 || lookup.length > 0 || cityFilter !== "all" || officerFilter !== "all" || personNameFilter) {
        // Use aggregation for filtered queries
        if (cityFilter !== "all") {
          match["location.city"] = cities.find(c => c.id === cityFilter)?.city;
        }
        if (officerFilter !== "all") {
          match["case.leadOfficerID"] = officerFilter;
        }
        if (personNameFilter) {
          match["person.firstName"] = { $regex: personNameFilter, $options: "i" };
        }

        response = await aggregationAPI.aggregate("arrests", {
          match,
          lookup,
          limit: 500,
        });
        setArrests(response.results);
      } else {
        response = await API.get('/dynamic/arrests');
      setArrests(response.data);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to load arrests');
      console.error('Error fetching arrests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArrests = arrests.filter((arrest) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (arrest.arrestID?.toLowerCase().includes(searchLower) || false) ||
      (arrest.personID?.toLowerCase().includes(searchLower) || false) ||
      (arrest.caseID?.toLowerCase().includes(searchLower) || false) ||
      (arrest.locationID?.toLowerCase().includes(searchLower) || false) ||
      (arrest.person?.firstName?.toLowerCase().includes(searchLower) || false) ||
      (arrest.person?.lastName?.toLowerCase().includes(searchLower) || false)
    );
  });

  const clearFilters = () => {
    setArrestDate(undefined);
    setCityFilter("all");
    setOfficerFilter("all");
    setPersonNameFilter("");
    // useEffect will automatically trigger refetch when state changes
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-red-200/60">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Arrests
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">Track all arrest records</p>
        </div>
        <ShimmerButton 
          background="linear-gradient(to right, #dc2626, #ea580c)"
          shimmerColor="#ffffff"
          shimmerDuration="3s"
          borderRadius="8px"
          className="shadow-md"
          onClick={() => setRegisterDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Arrest
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
                  placeholder="Search by Arrest ID, Person ID, Case ID, or Person Name..."
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
                  {/* Arrest Date */}
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[180px] h-9 justify-start text-left font-normal text-sm">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {arrestDate ? format(arrestDate, "MMM d, yyyy") : "Arrest Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" side="bottom" align="start">
                      <Calendar mode="single" selected={arrestDate} onSelect={(date) => { setArrestDate(date); setCalendarOpen(false); }} />
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

                  {/* Officer Filter */}
                  <Select value={officerFilter} onValueChange={setOfficerFilter} disabled={isLoadingOptions}>
                    <SelectTrigger className="w-[180px] h-9 text-sm">
                      <SelectValue placeholder="Arresting Officer" />
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

                  {/* Person Name Search */}
                  <Input
                    placeholder="Person Name..."
                    value={personNameFilter}
                    onChange={(e) => setPersonNameFilter(e.target.value)}
                    className="w-[160px] h-9 text-sm"
                  />

                  {/* Clear Filters Button */}
                  {(arrestDate || cityFilter !== "all" || officerFilter !== "all" || personNameFilter) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Active Filters Badges */}
                {(arrestDate || cityFilter !== "all" || officerFilter !== "all" || personNameFilter) && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                    {arrestDate && (
                      <Badge variant="secondary" className="text-xs">
                        Arrest Date: {format(arrestDate, "MMM d, yyyy")}
                      </Badge>
                    )}
                    {cityFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        City: {cities.find(c => c.id === cityFilter)?.city || cityFilter}
                      </Badge>
                    )}
                    {officerFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Officer: {officers.find(o => o.id === officerFilter)?.name || officerFilter}
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
                <div className="p-6 text-center text-muted-foreground text-sm">Loading arrests...</div>
              ) : (
              <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Arrest ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Person ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Case ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredArrests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-8">
                          No arrests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredArrests.map((arrest) => (
                        <TableRow 
                          key={arrest._id || arrest.arrestID}
                          className="h-11 border-b border-border/30 hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="font-medium text-sm py-2.5">{arrest.arrestID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{arrest.personID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{arrest.caseID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">
                            {arrest.date ? new Date(arrest.date).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{arrest.locationID || 'N/A'}</TableCell>
                          <TableCell className="text-right py-2.5">
                            <div className="flex justify-end gap-1.5">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-muted"
                                onClick={() => {
                                  setSelectedArrest(arrest);
                                  setRegisterDialogOpen(true);
                                }}
                              >
                                <Edit className="h-3.5 w-3.5" />
                          </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                onClick={async () => {
                                  if (window.confirm(`Are you sure you want to delete arrest ${arrest.arrestID || arrest._id}?`)) {
                                    try {
                                      await API.delete(`/dynamic/arrests/${arrest._id}`);
                                      toast.success("Arrest deleted successfully!");
                                      fetchArrests();
                                    } catch (err: any) {
                                      toast.error(err.response?.data || "Failed to delete arrest");
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

      <ArrestRegistrationDialog
        open={registerDialogOpen}
        onOpenChange={(open) => {
          setRegisterDialogOpen(open);
          if (!open) {
            setSelectedArrest(null);
          }
        }}
        onSuccess={fetchArrests}
        initialData={selectedArrest}
      />
    </div>
  );
};

export default Arrests;
