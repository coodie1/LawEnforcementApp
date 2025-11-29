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

const People = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [people, setPeople] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  
  // Filter states
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [ageMin, setAgeMin] = useState<string>("");
  const [ageMax, setAgeMax] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter options
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    fetchPeople();
    fetchFilterOptions();
  }, [roleFilter, ageMin, ageMax]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      setIsLoadingOptions(true);
      
      // Fetch unique roles
      const peopleResponse = await API.get('/dynamic/people');
      const roleOptions = peopleResponse.data
        .flatMap((person: any) => person.roles || [])
        .filter((v: any, i: number, a: any[]) => a.indexOf(v) === i)
        .sort();
      setRoles(roleOptions);
    } catch (err) {
      console.error("Error fetching filter options:", err);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const calculateAge = (dateOfBirth: string): number | null => {
    if (!dateOfBirth) return null;
    try {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  const fetchPeople = async () => {
    try {
      setIsLoading(true);
      
      const match: Record<string, any> = {};

      // Role filter
      if (roleFilter !== "all") {
        match.roles = roleFilter;
      }

      let response;
      if (Object.keys(match).length > 0) {
        response = await aggregationAPI.aggregate("people", {
          match,
          limit: 500,
        });
        setPeople(response.results);
      } else {
        response = await API.get('/dynamic/people');
        setPeople(response.data);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to load people');
      console.error('Error fetching people:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPeople = people.filter((person) => {
    // Name search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        (person.personID?.toLowerCase().includes(searchLower) || false) ||
        (person.firstName?.toLowerCase().includes(searchLower) || false) ||
        (person.lastName?.toLowerCase().includes(searchLower) || false)
      );
      if (!matchesSearch) return false;
    }

    // Age range filter
    if (ageMin || ageMax) {
      const age = calculateAge(person.dateOfBirth);
      if (age === null) return false;
      if (ageMin && age < parseInt(ageMin)) return false;
      if (ageMax && age > parseInt(ageMax)) return false;
    }

    return true;
  });

  const clearFilters = () => {
    setRoleFilter("all");
    setAgeMin("");
    setAgeMax("");
    // useEffect will automatically trigger refetch when state changes
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-cyan-200/60">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            People
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">Manage all people records</p>
        </div>
        <ShimmerButton 
          background="linear-gradient(to right, #0891b2, #2563eb)"
          shimmerColor="#ffffff"
          shimmerDuration="3s"
          borderRadius="8px"
          className="shadow-md"
          onClick={() => {
            setSelectedPerson(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Person
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
                  placeholder="Search by Person ID, First Name, or Last Name..."
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
                  {/* Role Filter */}
                  <Select value={roleFilter} onValueChange={setRoleFilter} disabled={isLoadingOptions}>
                    <SelectTrigger className="w-[160px] h-9 text-sm">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Age Range */}
                  <Input
                    type="number"
                    placeholder="Min Age"
                    value={ageMin}
                    onChange={(e) => setAgeMin(e.target.value)}
                    className="w-[100px] h-9 text-sm"
                    min="0"
                  />
                  <Input
                    type="number"
                    placeholder="Max Age"
                    value={ageMax}
                    onChange={(e) => setAgeMax(e.target.value)}
                    className="w-[100px] h-9 text-sm"
                    min="0"
                  />

                  {/* Clear Filters Button */}
                  {(roleFilter !== "all" || ageMin || ageMax) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Active Filters Badges */}
                {(roleFilter !== "all" || ageMin || ageMax) && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                    {roleFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Role: {roleFilter}
                      </Badge>
                    )}
                    {(ageMin || ageMax) && (
                      <Badge variant="secondary" className="text-xs">
                        Age: {ageMin || "0"} - {ageMax || "∞"}
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
                <div className="p-6 text-center text-muted-foreground text-sm">Loading people...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Person ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">First Name</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Name</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date of Birth</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Age</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Roles</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPeople.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground text-sm py-8">
                          No people found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPeople.map((person) => {
                        const age = calculateAge(person.dateOfBirth);
                        return (
                          <TableRow 
                            key={person._id || person.personID}
                            className="h-11 border-b border-border/30 hover:bg-muted/20 transition-colors"
                          >
                            <TableCell className="font-medium text-sm py-2.5">{person.personID || 'N/A'}</TableCell>
                            <TableCell className="text-sm py-2.5">{person.firstName || 'N/A'}</TableCell>
                            <TableCell className="text-sm py-2.5">{person.lastName || 'N/A'}</TableCell>
                            <TableCell className="text-sm py-2.5 text-muted-foreground">
                              {person.dateOfBirth ? new Date(person.dateOfBirth).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell className="text-sm py-2.5 text-muted-foreground">
                              {age !== null ? age : 'N/A'}
                            </TableCell>
                            <TableCell className="text-sm py-2.5">
                              <div className="flex flex-wrap gap-1">
                                {(person.roles || []).map((role: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {role}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-right py-2.5">
                              <div className="flex justify-end gap-1.5">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-muted"
                                  onClick={() => {
                                    setSelectedPerson(person);
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
                                    if (window.confirm(`Are you sure you want to delete person ${person.personID || person._id}?`)) {
                                      try {
                                        await API.delete(`/dynamic/people/${person._id}`);
                                        toast.success("Person deleted successfully!");
                                        fetchPeople();
                                      } catch (err: any) {
                                        toast.error(err.response?.data || "Failed to delete person");
                                      }
                                    }
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
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
        collectionName="people"
        initialData={selectedPerson}
        onSuccess={fetchPeople}
        title="People"
      />
    </div>
  );
};

export default People;

