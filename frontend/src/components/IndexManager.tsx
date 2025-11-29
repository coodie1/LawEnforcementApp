import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, Plus, Trash2, RefreshCw } from "lucide-react";
import { aggregationAPI } from "@/api.ts";
import { toast } from "sonner";

interface IndexManagerProps {
  collectionName: string;
  schemaFields: Array<{ name: string; type: string; required: boolean }>;
}

export function IndexManager({ collectionName, schemaFields }: IndexManagerProps) {
  const [indexes, setIndexes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingIndexes, setIsLoadingIndexes] = useState(false);
  const [newIndexFields, setNewIndexFields] = useState<string[]>([]);
  const [indexOptions, setIndexOptions] = useState({ unique: false, sparse: false });

  useEffect(() => {
    fetchIndexes();
  }, [collectionName]);

  const fetchIndexes = async () => {
    try {
      setIsLoadingIndexes(true);
      const response = await aggregationAPI.getIndexes(collectionName);
      setIndexes(response.indexes || []);
    } catch (error: any) {
      console.error("Error fetching indexes:", error);
      toast.error("Failed to fetch indexes");
    } finally {
      setIsLoadingIndexes(false);
    }
  };

  const addIndexField = () => {
    setNewIndexFields([...newIndexFields, ""]);
  };

  const removeIndexField = (index: number) => {
    setNewIndexFields(newIndexFields.filter((_, i) => i !== index));
  };

  const updateIndexField = (index: number, value: string) => {
    const updated = [...newIndexFields];
    updated[index] = value;
    setNewIndexFields(updated);
  };

  const createIndex = async () => {
    const validFields = newIndexFields.filter((f) => f);
    if (validFields.length === 0) {
      toast.error("Please select at least one field for the index");
      return;
    }

    try {
      setIsLoading(true);
      const options: any = {};
      if (indexOptions.unique) options.unique = true;
      if (indexOptions.sparse) options.sparse = true;

      await aggregationAPI.createIndex(collectionName, validFields, options);
      toast.success("Index created successfully!");
      setNewIndexFields([]);
      setIndexOptions({ unique: false, sparse: false });
      fetchIndexes();
    } catch (error: any) {
      console.error("Error creating index:", error);
      toast.error(error.response?.data?.error || "Failed to create index");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Index Management
        </CardTitle>
        <CardDescription>Create and manage database indexes to improve query performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Indexes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Existing Indexes</Label>
            <Button variant="outline" size="sm" onClick={fetchIndexes} disabled={isLoadingIndexes} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoadingIndexes ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          {isLoadingIndexes ? (
            <div className="text-sm text-muted-foreground">Loading indexes...</div>
          ) : indexes.length === 0 ? (
            <div className="text-sm text-muted-foreground">No indexes found</div>
          ) : (
            <div className="space-y-2">
              {indexes.map((index, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{index.name || "_id_"}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {JSON.stringify(index.key)}
                    </span>
                    {index.unique && <Badge variant="secondary">Unique</Badge>}
                    {index.sparse && <Badge variant="secondary">Sparse</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create New Index */}
        <div className="space-y-4 border-t pt-4">
          <Label>Create New Index</Label>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Index Fields</Label>
              <Button variant="outline" size="sm" onClick={addIndexField} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Field
              </Button>
            </div>
            {newIndexFields.map((field, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Select value={field} onValueChange={(value) => updateIndexField(index, value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {schemaFields.map((f) => (
                      <SelectItem key={f.name} value={f.name}>
                        {f.name} ({f.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => removeIndexField(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Index Options</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={indexOptions.unique}
                  onChange={(e) => setIndexOptions({ ...indexOptions, unique: e.target.checked })}
                />
                <span className="text-sm">Unique</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={indexOptions.sparse}
                  onChange={(e) => setIndexOptions({ ...indexOptions, sparse: e.target.checked })}
                />
                <span className="text-sm">Sparse</span>
              </label>
            </div>
          </div>

          <Button onClick={createIndex} disabled={isLoading || newIndexFields.length === 0} className="w-full">
            {isLoading ? "Creating..." : "Create Index"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

