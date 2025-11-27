import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      (arrest.incidentID?.toLowerCase().includes(searchLower) || '')
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b-2 border-red-200">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Arrests
          </h2>
          <p className="text-muted-foreground mt-1">Track all arrest records</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-md"
          onClick={() => {
            setSelectedArrest(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Arrest
        </Button>
      </div>

      <Card className="border-t-4 border-t-red-500">
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
          <CardTitle className="text-red-900">All Arrests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search arrests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Table */}
            <div className="rounded-md border">
              {error && (
                <div className="p-4 text-destructive text-sm">{error}</div>
              )}
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading arrests...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Arrest ID</TableHead>
                      <TableHead>Person ID</TableHead>
                      <TableHead>Incident ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Charges</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArrests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No arrests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredArrests.map((arrest) => (
                        <TableRow key={arrest._id || arrest.arrestID}>
                          <TableCell className="font-medium">{arrest.arrestID || 'N/A'}</TableCell>
                          <TableCell>{arrest.personID || 'N/A'}</TableCell>
                          <TableCell>{arrest.incidentID || 'N/A'}</TableCell>
                          <TableCell>
                            {arrest.date ? new Date(arrest.date).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>{arrest.charges || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedArrest(arrest);
                                  setDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
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
                                <Trash2 className="h-4 w-4" />
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
