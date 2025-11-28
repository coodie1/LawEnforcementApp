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

  // Helper function to convert Tailwind gradient classes to background color
  const getBackgroundFromGradient = (gradientClass: string): string => {
    const colorMap: { [key: string]: string } = {
      "from-cyan-600": "#0891b2",
      "to-blue-600": "#2563eb",
      "from-amber-600": "#d97706",
      "to-orange-600": "#ea580c",
      "from-rose-600": "#e11d48",
      "to-pink-600": "#db2777",
      "from-teal-600": "#0d9488",
      "from-violet-600": "#7c3aed",
      "to-purple-600": "#9333ea",
      "from-indigo-600": "#4f46e5",
      "from-sky-600": "#0284c7",
      "from-slate-600": "#475569",
      "to-gray-600": "#4b5563",
      "from-fuchsia-600": "#c026d3",
      "from-emerald-600": "#059669",
      "to-red-600": "#dc2626",
    };
    
    const parts = gradientClass.split(' ');
    const fromColor = parts.find(p => p.startsWith('from-'))?.replace('from-', '');
    const toColor = parts.find(p => p.startsWith('to-'))?.replace('to-', '');
    
    // Convert Tailwind color names to hex
    const tailwindToHex: { [key: string]: string } = {
      'cyan-600': '#0891b2',
      'blue-600': '#2563eb',
      'indigo-600': '#4f46e5',
      'amber-600': '#d97706',
      'orange-600': '#ea580c',
      'rose-600': '#e11d48',
      'pink-600': '#db2777',
      'teal-600': '#0d9488',
      'violet-600': '#7c3aed',
      'purple-600': '#9333ea',
      'sky-600': '#0284c7',
      'slate-600': '#475569',
      'gray-600': '#4b5563',
      'fuchsia-600': '#c026d3',
      'emerald-600': '#059669',
      'red-600': '#dc2626',
    };
    
    const from = fromColor ? tailwindToHex[fromColor] || '#2563eb' : '#2563eb';
    const to = toColor ? tailwindToHex[toColor] || '#4f46e5' : '#4f46e5';
    
    return `linear-gradient(to right, ${from}, ${to})`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: `${borderColor}60` }}>
        <div>
          <h2 className={`text-2xl font-semibold tracking-tight bg-gradient-to-r ${colorGradient} bg-clip-text text-transparent`}>
            {title}
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">{description}</p>
        </div>
        <ShimmerButton 
          background={getBackgroundFromGradient(colorGradient)}
          shimmerColor="#ffffff"
          shimmerDuration="3s"
          borderRadius="8px"
          className="shadow-md"
          onClick={() => {
            setSelectedItem(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New {title.slice(0, -1)}
        </ShimmerButton>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`Search ${title.toLowerCase()}...`}
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
                <div className="p-6 text-center text-muted-foreground text-sm">Loading {title.toLowerCase()}...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                      {headers.map((header) => (
                        <TableHead key={header} className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {header === '_id' ? 'ID' : header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1')}
                        </TableHead>
                      ))}
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={headers.length + 1} className="text-center text-muted-foreground text-sm py-8">
                          No {title.toLowerCase()} found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((item) => (
                        <TableRow 
                          key={item._id || item[headers[0]]}
                          className="h-11 border-b border-border/30 hover:bg-muted/20 transition-colors"
                        >
                          {headers.map((header, index) => (
                            <TableCell 
                              key={header} 
                              className={`text-sm py-2.5 ${(header === '_id' || header.toLowerCase().includes('id')) && index === 0 ? 'font-medium' : 'text-muted-foreground'}`}
                            >
                              {typeof item[header] === 'object' && item[header] !== null 
                                ? JSON.stringify(item[header]) 
                                : item[header] || 'N/A'}
                            </TableCell>
                          ))}
                          <TableCell className="text-right py-2.5">
                            <div className="flex justify-end gap-1.5">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-muted"
                                onClick={() => {
                                  setSelectedItem(item);
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
        collectionName={collectionName}
        initialData={selectedItem}
        onSuccess={fetchData}
        title={title}
      />
    </div>
  );
};

export default CollectionPage;

