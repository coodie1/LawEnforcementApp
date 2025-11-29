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

const Charges = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [charges, setCharges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<any>(null);
  
  // Filter states
  const [convictionStatusFilter, setConvictionStatusFilter] = useState<string>("all");
  const [descriptionSearch, setDescriptionSearch] = useState<string>("");
  const [statuteCodeSearch, setStatuteCodeSearch] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCharges();
  }, [convictionStatusFilter, descriptionSearch, statuteCodeSearch]);

  const fetchCharges = async () => {
    try {
      setIsLoading(true);
      
      const match: Record<string, any> = {};

      // Conviction status filter
      if (convictionStatusFilter !== "all") {
        match.isConvicted = convictionStatusFilter === "true";
      }

      // Description keyword search
      if (descriptionSearch) {
        match.description = { $regex: descriptionSearch, $options: "i" };
      }

      // Statute code search
      if (statuteCodeSearch) {
        match.statuteCode = { $regex: statuteCodeSearch, $options: "i" };
      }

      let response;
      if (Object.keys(match).length > 0) {
        response = await aggregationAPI.aggregate("charges", {
          match,
          limit: 500,
        });
        setCharges(response.results);
      } else {
        response = await API.get('/dynamic/charges');
        setCharges(response.data);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to load charges');
      console.error('Error fetching charges:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCharges = charges.filter((charge) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (charge.chargeID?.toLowerCase().includes(searchLower) || false) ||
      (charge.arrestID?.toLowerCase().includes(searchLower) || false) ||
      (charge.description?.toLowerCase().includes(searchLower) || false) ||
      (charge.statuteCode?.toLowerCase().includes(searchLower) || false)
    );
  });

  const clearFilters = () => {
    setConvictionStatusFilter("all");
    setDescriptionSearch("");
    setStatuteCodeSearch("");
    // useEffect will automatically trigger refetch when state changes
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-rose-200/60">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Charges
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">Manage all criminal charges</p>
        </div>
        <ShimmerButton 
          background="linear-gradient(to right, #e11d48, #db2777)"
          shimmerColor="#ffffff"
          shimmerDuration="3s"
          borderRadius="8px"
          className="shadow-md"
          onClick={() => {
            setSelectedCharge(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Charge
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
                  placeholder="Search by Charge ID, Arrest ID, Description, or Statute Code..."
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
                  {/* Conviction Status Filter */}
                  <Select value={convictionStatusFilter} onValueChange={setConvictionStatusFilter}>
                    <SelectTrigger className="w-[180px] h-9 text-sm">
                      <SelectValue placeholder="Conviction Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="true">Convicted</SelectItem>
                      <SelectItem value="false">Not Convicted</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Description Search */}
                  <Input
                    placeholder="Description keyword..."
                    value={descriptionSearch}
                    onChange={(e) => setDescriptionSearch(e.target.value)}
                    className="w-[200px] h-9 text-sm"
                  />

                  {/* Statute Code Search */}
                  <Input
                    placeholder="Statute code..."
                    value={statuteCodeSearch}
                    onChange={(e) => setStatuteCodeSearch(e.target.value)}
                    className="w-[160px] h-9 text-sm"
                  />

                  {/* Clear Filters Button */}
                  {(convictionStatusFilter !== "all" || descriptionSearch || statuteCodeSearch) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Active Filters Badges */}
                {(convictionStatusFilter !== "all" || descriptionSearch || statuteCodeSearch) && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                    {convictionStatusFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Status: {convictionStatusFilter === "true" ? "Convicted" : "Not Convicted"}
                      </Badge>
                    )}
                    {descriptionSearch && (
                      <Badge variant="secondary" className="text-xs">
                        Description: {descriptionSearch}
                      </Badge>
                    )}
                    {statuteCodeSearch && (
                      <Badge variant="secondary" className="text-xs">
                        Statute: {statuteCodeSearch}
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
                <div className="p-6 text-center text-muted-foreground text-sm">Loading charges...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Charge ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Arrest ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statute Code</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Convicted</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCharges.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-8">
                          No charges found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCharges.map((charge) => (
                        <TableRow 
                          key={charge._id || charge.chargeID}
                          className="h-11 border-b border-border/30 hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="font-medium text-sm py-2.5">{charge.chargeID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{charge.arrestID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5">{charge.description || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{charge.statuteCode || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5">
                            <Badge 
                              variant={charge.isConvicted ? "destructive" : "secondary"} 
                              className="text-xs"
                            >
                              {charge.isConvicted ? "Convicted" : "Not Convicted"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right py-2.5">
                            <div className="flex justify-end gap-1.5">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-muted"
                                onClick={() => {
                                  setSelectedCharge(charge);
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
                                  if (window.confirm(`Are you sure you want to delete charge ${charge.chargeID || charge._id}?`)) {
                                    try {
                                      await API.delete(`/dynamic/charges/${charge._id}`);
                                      toast.success("Charge deleted successfully!");
                                      fetchCharges();
                                    } catch (err: any) {
                                      toast.error(err.response?.data || "Failed to delete charge");
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
        collectionName="charges"
        initialData={selectedCharge}
        onSuccess={fetchCharges}
        title="Charges"
      />
    </div>
  );
};

export default Charges;
