import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { mockOfficers } from "@/lib/mockData";

const Officers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOfficers = mockOfficers.filter((officer) =>
    officer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.badgeNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Officers</h2>
          <p className="text-muted-foreground">Manage law enforcement personnel</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Officer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Officers</CardTitle>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Officer ID</TableHead>
                    <TableHead>Badge Number</TableHead>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Department ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOfficers.map((officer) => (
                    <TableRow key={officer.officerID}>
                      <TableCell className="font-medium">{officer.officerID}</TableCell>
                      <TableCell>{officer.badgeNumber}</TableCell>
                      <TableCell>{officer.firstName}</TableCell>
                      <TableCell>{officer.lastName}</TableCell>
                      <TableCell>{officer.departmentID}</TableCell>
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

export default Officers;
