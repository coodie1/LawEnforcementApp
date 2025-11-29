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

const Officers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [officers, setOfficers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<any>(null);
  
  // Filter states
  const [badgeNumberFilter, setBadgeNumberFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter options
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    fetchOfficers();
    fetchFilterOptions();
  }, [badgeNumberFilter, departmentFilter]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      setIsLoadingOptions(true);
      
      // Fetch all departments and officers
      const [departmentsResponse, officersResponse] = await Promise.all([
        API.get('/dynamic/departments'),
        API.get('/dynamic/officers')
      ]);
      
      // Get unique departmentIDs that have at least one officer
      const departmentIDsWithOfficers = new Set(
        officersResponse.data
          .map((officer: any) => officer.departmentID)
          .filter((id: any) => id !== null && id !== undefined)
      );
      
      // Filter departments to only include those with officers
      const departmentOptions = departmentsResponse.data
        .filter((dept: any) => departmentIDsWithOfficers.has(dept.departmentID))
        .map((dept: any) => ({
          id: dept.departmentID,
          name: dept.name || dept.departmentID,
        }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
      
      setDepartments(departmentOptions);
    } catch (err) {
      console.error("Error fetching filter options:", err);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      setIsLoading(true);
      
      const match: Record<string, any> = {};
      const lookup: any[] = [];

      // Badge number filter
      if (badgeNumberFilter) {
        match.badgeNumber = { $regex: badgeNumberFilter, $options: "i" };
      }

      // Department filter - match directly on departmentID (more efficient)
      if (departmentFilter !== "all") {
        // Use exact match for departmentID
        match.departmentID = departmentFilter;
      }

      // Always do lookup to get department name for display
      lookup.push({
        from: "departments",
        localField: "departmentID",
        foreignField: "departmentID",
        as: "department"
      });

      // Always use aggregation to get department names via lookup
      const response = await aggregationAPI.aggregate("officers", {
        match,
        lookup,
        limit: 500,
      });
      
      // Ensure we have results array
      const results = response.results || [];
      setOfficers(results);
      
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data || err.message || 'Failed to load officers';
      setError(errorMessage);
      console.error('Error fetching officers:', err);
      // Set empty array on error to prevent showing stale data
      setOfficers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOfficers = officers.filter((officer) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (officer.officerID?.toLowerCase().includes(searchLower) || false) ||
      (officer.badgeNumber?.toLowerCase().includes(searchLower) || false) ||
      (officer.firstName?.toLowerCase().includes(searchLower) || false) ||
      (officer.lastName?.toLowerCase().includes(searchLower) || false) ||
      (officer.departmentID?.toLowerCase().includes(searchLower) || false) ||
      (officer.department?.name?.toLowerCase().includes(searchLower) || false)
    );
  });

  const clearFilters = () => {
    setBadgeNumberFilter("");
    setDepartmentFilter("all");
    // useEffect will automatically trigger refetch when state changes
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
            Officers
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">Manage law enforcement personnel</p>
        </div>
        <ShimmerButton 
          background="linear-gradient(to right, #475569, #1e293b)"
          shimmerColor="#ffffff"
          shimmerDuration="3s"
          borderRadius="8px"
          className="shadow-md"
          onClick={() => {
            setSelectedOfficer(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Officer
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
                  placeholder="Search by Officer ID, Name, or Badge Number..."
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
                  {/* Badge Number Filter */}
                  <Input
                    placeholder="Badge Number..."
                    value={badgeNumberFilter}
                    onChange={(e) => setBadgeNumberFilter(e.target.value)}
                    className="w-[160px] h-9 text-sm"
                  />

                  {/* Department Filter */}
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter} disabled={isLoadingOptions}>
                    <SelectTrigger className="w-[200px] h-9 text-sm">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Clear Filters Button */}
                  {(badgeNumberFilter || departmentFilter !== "all") && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Active Filters Badges */}
                {(badgeNumberFilter || departmentFilter !== "all") && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                    {badgeNumberFilter && (
                      <Badge variant="secondary" className="text-xs">
                        Badge: {badgeNumberFilter}
                      </Badge>
                    )}
                    {departmentFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Department: {departments.find(d => d.id === departmentFilter)?.name || departmentFilter}
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
                <div className="p-6 text-center text-muted-foreground text-sm">Loading officers...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Officer ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Badge Number</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">First Name</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Name</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOfficers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-8">
                          No officers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOfficers.map((officer) => (
                        <TableRow 
                          key={officer._id || officer.officerID}
                          className="h-11 border-b border-border/30 hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="font-medium text-sm py-2.5">{officer.officerID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{officer.badgeNumber || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5">{officer.firstName || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5">{officer.lastName || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">
                            {officer.department?.name || officer.departmentID || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right py-2.5">
                            <div className="flex justify-end gap-1.5">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-muted"
                                onClick={() => {
                                  setSelectedOfficer(officer);
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
                                  if (window.confirm(`Are you sure you want to delete officer ${officer.officerID || officer._id}?`)) {
                                    try {
                                      await API.delete(`/dynamic/officers/${officer._id}`);
                                      toast.success("Officer deleted successfully!");
                                      fetchOfficers();
                                    } catch (err: any) {
                                      toast.error(err.response?.data || "Failed to delete officer");
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
        collectionName="officers"
        initialData={selectedOfficer}
        onSuccess={fetchOfficers}
        title="Officers"
      />
    </div>
  );
};

export default Officers;
