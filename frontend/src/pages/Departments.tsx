import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import API from "@/api.ts";

const Departments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await API.get('/dynamic/departments');
      setDepartments(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to load departments');
      console.error('Error fetching departments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDepartments = departments.filter((dept) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (dept.departmentID?.toLowerCase().includes(searchLower) || '') ||
      (dept.name?.toLowerCase().includes(searchLower) || '') ||
      (dept.locationID?.toLowerCase().includes(searchLower) || '')
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b-2 border-purple-200">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Departments
          </h2>
          <p className="text-muted-foreground mt-1">Manage department information</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md">
          <Plus className="h-4 w-4 mr-2" />
          New Department
        </Button>
      </div>

      <Card className="border-t-4 border-t-purple-500">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="text-purple-900">All Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
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
                <div className="p-8 text-center text-muted-foreground">Loading departments...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Location ID</TableHead>
                      <TableHead>Head Officer ID</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDepartments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No departments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDepartments.map((dept) => (
                        <TableRow key={dept._id || dept.departmentID}>
                          <TableCell className="font-medium">{dept.departmentID || 'N/A'}</TableCell>
                          <TableCell>{dept.name || 'N/A'}</TableCell>
                          <TableCell>{dept.locationID || 'N/A'}</TableCell>
                          <TableCell>{dept.headOfficerID || 'N/A'}</TableCell>
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

export default Departments;
