import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import API from "@/api.ts";

const Cases = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      const response = await API.get('/dynamic/cases');
      setCases(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to load cases');
      console.error('Error fetching cases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch =
      (caseItem.caseID?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (caseItem.incidentID?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
    const matchesStatus = statusFilter === "all" || caseItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-success/10 text-success border-success/20";
      case "closed":
        return "bg-muted text-muted-foreground border-border";
      case "under_investigation":
        return "bg-warning/10 text-warning border-warning/20";
      case "pending":
        return "bg-info/10 text-info border-info/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cases</h2>
          <p className="text-muted-foreground">Manage and track all case files</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Case
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="under_investigation">Under Investigation</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              {error && (
                <div className="p-4 text-destructive text-sm">{error}</div>
              )}
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading cases...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case ID</TableHead>
                      <TableHead>Incident ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No cases found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCases.map((caseItem) => (
                        <TableRow key={caseItem._id || caseItem.caseID}>
                          <TableCell className="font-medium">{caseItem.caseID || 'N/A'}</TableCell>
                          <TableCell>{caseItem.incidentID || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(caseItem.status || 'pending')}>
                              {(caseItem.status || 'pending').replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {caseItem.startDate ? new Date(caseItem.startDate).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {caseItem.endDate ? new Date(caseItem.endDate).toLocaleDateString() : 'N/A'}
                          </TableCell>
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

export default Cases;
