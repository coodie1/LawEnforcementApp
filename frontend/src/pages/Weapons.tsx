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

const Weapons = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [weapons, setWeapons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState<any>(null);
  
  // Filter states
  const [weaponTypeFilter, setWeaponTypeFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [incidentIDFilter, setIncidentIDFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter options
  const [weaponTypes, setWeaponTypes] = useState<string[]>([]);
  const [people, setPeople] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    fetchWeapons();
    fetchFilterOptions();
  }, [weaponTypeFilter, ownerFilter, incidentIDFilter]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      setIsLoadingOptions(true);
      
      // Fetch unique weapon types
      const weaponsResponse = await API.post('/dynamic/weapons/aggregate', {
        groupBy: ['type'],
        limit: 100,
      });
      setWeaponTypes(
        weaponsResponse.data.results
          .map((r: any) => r._id)
          .filter((v: any) => v !== null && v !== undefined)
      );

      // Fetch people for owner filter
      const peopleResponse = await API.get('/dynamic/people');
      const peopleOptions = peopleResponse.data
        .map((person: any) => ({
          id: person.personID,
          name: `${person.firstName || ''} ${person.lastName || ''}`.trim() || person.personID,
        }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
      setPeople(peopleOptions);
    } catch (err) {
      console.error("Error fetching filter options:", err);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const fetchWeapons = async () => {
    try {
      setIsLoading(true);
      
      const match: Record<string, any> = {};
      const lookup: any[] = [];

      if (weaponTypeFilter !== "all") {
        match.type = weaponTypeFilter;
      }

      if (incidentIDFilter) {
        match.incidentID = { $regex: incidentIDFilter, $options: "i" };
      }

      // Owner filter (via person lookup)
      if (ownerFilter !== "all") {
        lookup.push({
          from: "people",
          localField: "ownerID",
          foreignField: "personID",
          as: "owner"
        });
        match["owner.personID"] = ownerFilter;
      }

      let response;
      if (Object.keys(match).length > 0 || lookup.length > 0) {
        response = await aggregationAPI.aggregate("weapons", {
          match,
          lookup,
          limit: 500,
        });
        setWeapons(response.results);
      } else {
        response = await API.get('/dynamic/weapons');
        setWeapons(response.data);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to load weapons');
      console.error('Error fetching weapons:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredWeapons = weapons.filter((weapon) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (weapon.weaponID?.toLowerCase().includes(searchLower) || false) ||
      (weapon.incidentID?.toLowerCase().includes(searchLower) || false) ||
      (weapon.ownerID?.toLowerCase().includes(searchLower) || false) ||
      (weapon.type?.toLowerCase().includes(searchLower) || false) ||
      (weapon.owner?.firstName?.toLowerCase().includes(searchLower) || false) ||
      (weapon.owner?.lastName?.toLowerCase().includes(searchLower) || false)
    );
  });

  const clearFilters = () => {
    setWeaponTypeFilter("all");
    setOwnerFilter("all");
    setIncidentIDFilter("");
    // useEffect will automatically trigger refetch when state changes
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-red-200/60">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            Weapons
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">Manage weapon records</p>
        </div>
        <ShimmerButton 
          background="linear-gradient(to right, #dc2626, #e11d48)"
          shimmerColor="#ffffff"
          shimmerDuration="3s"
          borderRadius="8px"
          className="shadow-md"
          onClick={() => {
            setSelectedWeapon(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Weapon
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
                  placeholder="Search by Weapon ID, Incident ID, Owner, or Type..."
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
                  {/* Weapon Type Filter */}
                  <Select value={weaponTypeFilter} onValueChange={setWeaponTypeFilter} disabled={isLoadingOptions}>
                    <SelectTrigger className="w-[160px] h-9 text-sm">
                      <SelectValue placeholder="Weapon Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {weaponTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Owner Filter */}
                  <Select value={ownerFilter} onValueChange={setOwnerFilter} disabled={isLoadingOptions}>
                    <SelectTrigger className="w-[180px] h-9 text-sm">
                      <SelectValue placeholder="Owner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Owners</SelectItem>
                      {people.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Incident ID Search */}
                  <Input
                    placeholder="Incident ID..."
                    value={incidentIDFilter}
                    onChange={(e) => setIncidentIDFilter(e.target.value)}
                    className="w-[140px] h-9 text-sm"
                  />

                  {/* Clear Filters Button */}
                  {(weaponTypeFilter !== "all" || ownerFilter !== "all" || incidentIDFilter) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Active Filters Badges */}
                {(weaponTypeFilter !== "all" || ownerFilter !== "all" || incidentIDFilter) && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                    {weaponTypeFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Type: {weaponTypeFilter}
                      </Badge>
                    )}
                    {ownerFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Owner: {people.find(p => p.id === ownerFilter)?.name || ownerFilter}
                      </Badge>
                    )}
                    {incidentIDFilter && (
                      <Badge variant="secondary" className="text-xs">
                        Incident: {incidentIDFilter}
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
                <div className="p-6 text-center text-muted-foreground text-sm">Loading weapons...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weapon ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Incident ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Owner</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWeapons.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground text-sm py-8">
                          No weapons found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredWeapons.map((weapon) => (
                        <TableRow 
                          key={weapon._id || weapon.weaponID}
                          className="h-11 border-b border-border/30 hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="font-medium text-sm py-2.5">{weapon.weaponID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{weapon.incidentID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">
                            {weapon.owner ? `${weapon.owner.firstName || ''} ${weapon.owner.lastName || ''}`.trim() : weapon.ownerID || 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{weapon.type || 'N/A'}</TableCell>
                          <TableCell className="text-right py-2.5">
                            <div className="flex justify-end gap-1.5">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-muted"
                                onClick={() => {
                                  setSelectedWeapon(weapon);
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
                                  if (window.confirm(`Are you sure you want to delete weapon ${weapon.weaponID || weapon._id}?`)) {
                                    try {
                                      await API.delete(`/dynamic/weapons/${weapon._id}`);
                                      toast.success("Weapon deleted successfully!");
                                      fetchWeapons();
                                    } catch (err: any) {
                                      toast.error(err.response?.data || "Failed to delete weapon");
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
        collectionName="weapons"
        initialData={selectedWeapon}
        onSuccess={fetchWeapons}
        title="Weapons"
      />
    </div>
  );
};

export default Weapons;

