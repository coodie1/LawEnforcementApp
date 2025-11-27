import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { mockArrests } from "@/lib/mockData";

const Arrests = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredArrests = mockArrests.filter((arrest) =>
    arrest.arrestID.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Arrests</h2>
          <p className="text-muted-foreground">Track all arrest records</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Arrest
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Arrests</CardTitle>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Arrest ID</TableHead>
                    <TableHead>Person ID</TableHead>
                    <TableHead>Case ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArrests.map((arrest) => (
                    <TableRow key={arrest.arrestID}>
                      <TableCell className="font-medium">{arrest.arrestID}</TableCell>
                      <TableCell>{arrest.personID}</TableCell>
                      <TableCell>{arrest.caseID}</TableCell>
                      <TableCell>{new Date(arrest.date).toLocaleDateString()}</TableCell>
                      <TableCell>{arrest.locationID}</TableCell>
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Arrests;
