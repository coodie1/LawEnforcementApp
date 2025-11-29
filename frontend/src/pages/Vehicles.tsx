import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, X, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import API from "@/api.ts";
import { aggregationAPI } from "@/api.ts";
import { CollectionFormDialog } from "@/components/CollectionFormDialog";
import { toast } from "sonner";

const Vehicles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  
  // Filter states
  const [makeModelFilter, setMakeModelFilter] = useState<string>("");
  const [licensePlateFilter, setLicensePlateFilter] = useState<string>("");
  const [caseIDFilter, setCaseIDFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, [makeModelFilter, licensePlateFilter, caseIDFilter]);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      
      const match: Record<string, any> = {};

      if (makeModelFilter) {
        match.$or = [
          { make: { $regex: makeModelFilter, $options: "i" } },
          { model: { $regex: makeModelFilter, $options: "i" } }
        ];
      }

      if (licensePlateFilter) {
        match.licensePlate = { $regex: licensePlateFilter, $options: "i" };
      }

      if (caseIDFilter) {
        match.caseID = { $regex: caseIDFilter, $options: "i" };
      }

      let response;
      if (Object.keys(match).length > 0) {
        response = await aggregationAPI.aggregate("vehicles", {
          match,
          limit: 500,
        });
        setVehicles(response.results);
      } else {
        response = await API.get('/dynamic/vehicles');
        setVehicles(response.data);
      }
      
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data || err.message || 'Failed to load vehicles';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      console.error('Error fetching vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (vehicle.vehicleID?.toLowerCase().includes(searchLower) || false) ||
      (vehicle.caseID?.toLowerCase().includes(searchLower) || false) ||
      (vehicle.make?.toLowerCase().includes(searchLower) || false) ||
      (vehicle.model?.toLowerCase().includes(searchLower) || false) ||
      (vehicle.licensePlate?.toLowerCase().includes(searchLower) || false)
    );
  });

  const clearFilters = () => {
    setMakeModelFilter("");
    setLicensePlateFilter("");
    setCaseIDFilter("");
    // useEffect will automatically trigger refetch when state changes
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-red-200/60">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Vehicles
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">Manage vehicle records</p>
        </div>
        <ShimmerButton 
          background="linear-gradient(to right, #dc2626, #ea580c)"
          shimmerColor="#ffffff"
          shimmerDuration="3s"
          borderRadius="8px"
          className="shadow-md"
          onClick={() => {
            setSelectedVehicle(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Vehicle
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
                  placeholder="Search by Vehicle ID, Case ID, Make, Model, or License Plate..."
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
                  {/* Make/Model Search */}
                  <Input
                    placeholder="Make or Model..."
                    value={makeModelFilter}
                    onChange={(e) => setMakeModelFilter(e.target.value)}
                    className="w-[160px] h-9 text-sm"
                  />

                  {/* License Plate Search */}
                  <Input
                    placeholder="License Plate..."
                    value={licensePlateFilter}
                    onChange={(e) => setLicensePlateFilter(e.target.value)}
                    className="w-[140px] h-9 text-sm"
                  />

                  {/* Case ID Search */}
                  <Input
                    placeholder="Case ID..."
                    value={caseIDFilter}
                    onChange={(e) => setCaseIDFilter(e.target.value)}
                    className="w-[140px] h-9 text-sm"
                  />

                  {/* Clear Filters Button */}
                  {(makeModelFilter || licensePlateFilter || caseIDFilter) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Active Filters Badges */}
                {(makeModelFilter || licensePlateFilter || caseIDFilter) && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                    {makeModelFilter && (
                      <Badge variant="secondary" className="text-xs">
                        Make/Model: {makeModelFilter}
                      </Badge>
                    )}
                    {licensePlateFilter && (
                      <Badge variant="secondary" className="text-xs">
                        License: {licensePlateFilter}
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
                <div className="p-6 text-center text-muted-foreground text-sm">Loading vehicles...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vehicle ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Case ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Make</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Model</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">License Plate</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-8">
                          No vehicles found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVehicles.map((vehicle) => (
                        <TableRow 
                          key={vehicle._id || vehicle.vehicleID}
                          className="h-11 border-b border-border/30 hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="font-medium text-sm py-2.5">{vehicle.vehicleID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{vehicle.caseID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5">{vehicle.make || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5">{vehicle.model || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{vehicle.licensePlate || 'N/A'}</TableCell>
                          <TableCell className="text-right py-2.5">
                            <div className="flex justify-end gap-1.5">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-muted"
                                onClick={() => {
                                  setSelectedVehicle(vehicle);
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
                                  if (window.confirm(`Are you sure you want to delete vehicle ${vehicle.vehicleID || vehicle._id}?`)) {
                                    try {
                                      await API.delete(`/dynamic/vehicles/${vehicle._id}`);
                                      toast.success("Vehicle deleted successfully!");
                                      fetchVehicles();
                                    } catch (err: any) {
                                      toast.error(err.response?.data || "Failed to delete vehicle");
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
        collectionName="vehicles"
        initialData={selectedVehicle}
        onSuccess={fetchVehicles}
        title="Vehicles"
      />
    </div>
  );
};

export default Vehicles;

