import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import API from "@/api.ts";
import { CollectionFormDialog } from "@/components/CollectionFormDialog";
import { toast } from "sonner";

interface CollectionPageProps {
  collectionName: string;
  title: string;
  description: string;
  colorGradient: string;
  borderColor: string;
  headerGradient: string;
  titleColor: string;
}

const CollectionPage = ({ 
  collectionName, 
  title, 
  description,
  colorGradient,
  borderColor,
  headerGradient,
  titleColor
}: CollectionPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [collectionName]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await API.get(`/dynamic/${collectionName.toLowerCase()}`);
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data || `Failed to load ${title.toLowerCase()}`);
      console.error(`Error fetching ${collectionName}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = data.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return Object.values(item).some(value => 
      value !== null && 
      value !== undefined && 
      value.toString().toLowerCase().includes(searchLower)
    );
  });

  // Get table headers from first item
  const getHeaders = () => {
    if (filteredData.length === 0) return [];
    const firstItem = filteredData[0];
    return Object.keys(firstItem).filter(key => 
      key !== '__v' && 
      (typeof firstItem[key] !== 'object' || firstItem[key] === null)
    );
  };

  const headers = getHeaders();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b-2" style={{ borderColor: borderColor }}>
        <div>
          <h2 className={`text-3xl font-bold tracking-tight bg-gradient-to-r ${colorGradient} bg-clip-text text-transparent`}>
            {title}
          </h2>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        <Button 
          className={`bg-gradient-to-r ${colorGradient} text-white shadow-md hover:opacity-90`}
          onClick={() => {
            setSelectedItem(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New {title.slice(0, -1)}
        </Button>
      </div>

      <Card className={`border-t-4`} style={{ borderTopColor: borderColor }}>
        <CardHeader className={headerGradient}>
          <CardTitle className={titleColor}>All {title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`Search ${title.toLowerCase()}...`}
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
                <div className="p-8 text-center text-muted-foreground">Loading {title.toLowerCase()}...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHead key={header}>
                          {header === '_id' ? 'ID' : header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1')}
                        </TableHead>
                      ))}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={headers.length + 1} className="text-center text-muted-foreground">
                          No {title.toLowerCase()} found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((item) => (
                        <TableRow key={item._id || item[headers[0]]}>
                          {headers.map((header) => (
                            <TableCell key={header}>
                              {typeof item[header] === 'object' && item[header] !== null 
                                ? JSON.stringify(item[header]) 
                                : item[header] || 'N/A'}
                            </TableCell>
                          ))}
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={async () => {
                                  const itemId = item[headers.find(h => h.includes('ID') || h === '_id') || '_id'] || item._id;
                                  if (window.confirm(`Are you sure you want to delete this ${title.slice(0, -1).toLowerCase()}?`)) {
                                    try {
                                      await API.delete(`/dynamic/${collectionName}/${item._id}`);
                                      toast.success(`${title.slice(0, -1)} deleted successfully!`);
                                      fetchData();
                                    } catch (err: any) {
                                      toast.error(err.response?.data || `Failed to delete ${title.slice(0, -1).toLowerCase()}`);
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
        collectionName={collectionName}
        initialData={selectedItem}
        onSuccess={fetchData}
        title={title}
      />
    </div>
  );
};

export default CollectionPage;

