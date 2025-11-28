import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import API from "@/api.ts";
import { CollectionFormDialog } from "@/components/CollectionFormDialog";
import { toast } from "sonner";

const Arrests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [arrests, setArrests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedArrest, setSelectedArrest] = useState<any>(null);

  useEffect(() => {
    fetchArrests();
  }, []);

  const fetchArrests = async () => {
    try {
      setIsLoading(true);
      const response = await API.get('/dynamic/arrests');
      setArrests(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to load arrests');
      console.error('Error fetching arrests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArrests = arrests.filter((arrest) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (arrest.arrestID?.toLowerCase().includes(searchLower) || '') ||
      (arrest.personID?.toLowerCase().includes(searchLower) || '') ||
      (arrest.caseID?.toLowerCase().includes(searchLower) || '') ||
      (arrest.locationID?.toLowerCase().includes(searchLower) || '')
    );
  });

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
          onClick={() => {
            setSelectedArrest(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Arrest
        </ShimmerButton>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search arrests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 text-sm"
              />
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

      <CollectionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        collectionName="arrests"
        initialData={selectedArrest}
        onSuccess={fetchArrests}
        title="Arrests"
      />
    </div>
  );
};

export default Arrests;
