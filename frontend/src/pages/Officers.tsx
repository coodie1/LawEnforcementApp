import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import API from "@/api.ts";

const Officers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [officers, setOfficers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      setIsLoading(true);
      const response = await API.get('/dynamic/officers');
      setOfficers(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to load officers');
      console.error('Error fetching officers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOfficers = officers.filter((officer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (officer.officerID?.toLowerCase().includes(searchLower) || '') ||
      (officer.badgeNumber?.toLowerCase().includes(searchLower) || '') ||
      (officer.personID?.toLowerCase().includes(searchLower) || '')
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b-2 border-green-200">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Officers
          </h2>
          <p className="text-muted-foreground mt-1">Manage law enforcement personnel</p>
        </div>
        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md">
          <Plus className="h-4 w-4 mr-2" />
          New Officer
        </Button>
      </div>

      <Card className="border-t-4 border-t-green-500">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="text-green-900">All Officers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search officers..."
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
                <div className="p-8 text-center text-muted-foreground">Loading officers...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Officer ID</TableHead>
                      <TableHead>Badge Number</TableHead>
                      <TableHead>Person ID</TableHead>
                      <TableHead>Department ID</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOfficers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No officers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOfficers.map((officer) => (
                        <TableRow key={officer._id || officer.officerID}>
                          <TableCell className="font-medium">{officer.officerID || 'N/A'}</TableCell>
                          <TableCell>{officer.badgeNumber || 'N/A'}</TableCell>
                          <TableCell>{officer.personID || 'N/A'}</TableCell>
                          <TableCell>{officer.departmentID || 'N/A'}</TableCell>
                          <TableCell>{officer.rank || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
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
    </div>
  );
};

export default Officers;
