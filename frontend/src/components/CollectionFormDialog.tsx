import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import API from "@/api.ts";
import { toast } from "sonner";

interface Field {
  name: string;
  type: string;
  required: boolean;
}

interface CollectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionName: string;
  initialData?: any;
  onSuccess: () => void;
  title: string;
}

export function CollectionFormDialog({
  open,
  onOpenChange,
  collectionName,
  initialData,
  onSuccess,
  title,
}: CollectionFormDialogProps) {
  const [formData, setFormData] = useState<any>({});
  const [schemaFields, setSchemaFields] = useState<Field[]>([]);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const isEditMode = !!initialData?._id;

  useEffect(() => {
    if (open && collectionName) {
      fetchSchema();
      if (initialData) {
        // Clean initial data - convert dates to input format
        const cleaned = { ...initialData };
        Object.keys(cleaned).forEach(key => {
          if (cleaned[key] instanceof Date) {
            cleaned[key] = cleaned[key].toISOString().split('T')[0];
          } else if (typeof cleaned[key] === 'string' && cleaned[key].match(/^\d{4}-\d{2}-\d{2}T/)) {
            cleaned[key] = cleaned[key].split('T')[0];
          }
        });
        setFormData(cleaned);
      } else {
        setFormData({});
      }
      setError("");
    }
  }, [open, collectionName, initialData]);

  const fetchSchema = async () => {
    try {
      setIsLoadingSchema(true);
      const response = await API.get(`/dynamic/${collectionName.toLowerCase()}/schema`);
      setSchemaFields(response.data);
    } catch (err: any) {
      console.error("Schema fetch error:", err);
      setError("Could not load form fields.");
    } finally {
      setIsLoadingSchema(false);
    }
  };

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError("");

      // Clean up data
      const cleanedData = { ...formData };
      schemaFields.forEach(field => {
        if (cleanedData[field.name] === "" && (field.type === "Date" || field.type === "Number")) {
          cleanedData[field.name] = null;
        }
        // Remove _id, __v, createdAt, updatedAt for new records
        if (!isEditMode) {
          delete cleanedData._id;
          delete cleanedData.__v;
          delete cleanedData.createdAt;
          delete cleanedData.updatedAt;
        }
      });

      if (isEditMode) {
        await API.put(`/dynamic/${collectionName}/${initialData._id}`, cleanedData);
        toast.success(`${getSingularTitle(title)} updated successfully!`);
      } else {
        await API.post(`/dynamic/${collectionName}`, cleanedData);
        toast.success(`${getSingularTitle(title)} created successfully!`);
      }

      onSuccess();
      onOpenChange(false);
      setFormData({});
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data || error.message || "Failed to save";
      setError(errorMsg);
      toast.error(`Failed to save: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateForInput = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  // Helper function to convert plural title to singular
  const getSingularTitle = (pluralTitle: string): string => {
    const specialCases: { [key: string]: string } = {
      'People': 'Person',
      'Cases': 'Case',
      'Arrests': 'Arrest',
      'Officers': 'Officer',
      'Departments': 'Department',
      'Incidents': 'Incident',
      'Charges': 'Charge',
      'Locations': 'Location',
      'Evidence': 'Evidence',
      'Forensics': 'Forensic',
      'Reports': 'Report',
      'Prisons': 'Prison',
      'Sentences': 'Sentence',
      'Vehicles': 'Vehicle',
      'Weapons': 'Weapon',
    };
    
    if (specialCases[pluralTitle]) {
      return specialCases[pluralTitle];
    }
    
    return pluralTitle.slice(0, -1);
  };

  const formatLabel = (fieldName: string): string => {
    // Handle acronyms like ID, URL, etc. - keep consecutive capitals together
    // Add space between lowercase and uppercase, but keep consecutive capitals together
    return fieldName
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase and uppercase (e.g., "arrestID" → "arrest ID")
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // Add space between consecutive capitals when followed by lowercase (e.g., "XMLHttp" → "XML Http")
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? `Edit ${getSingularTitle(title)}` : `Create New ${getSingularTitle(title)}`}</DialogTitle>
          <DialogDescription>
            {isEditMode ? `Update the ${getSingularTitle(title).toLowerCase()} information` : `Fill in the details to create a new ${getSingularTitle(title).toLowerCase()}`}
          </DialogDescription>
        </DialogHeader>

        {isLoadingSchema ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading form fields...</div>
          </div>
        ) : error ? (
          <div className="text-destructive text-sm p-4 bg-destructive/10 rounded-md">{error}</div>
        ) : (
          <div className="grid gap-4 py-4">
            {schemaFields.map((field) => {
              const fieldValue = formData[field.name] || "";
              const label = formatLabel(field.name);

              if (field.type === "Date") {
                const dateValue = fieldValue ? new Date(fieldValue) : undefined;
                const isValidDate = dateValue && !isNaN(dateValue.getTime());
                
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && <span className="text-destructive">*</span>}
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id={field.name}
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !isValidDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {isValidDate ? format(dateValue, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={isValidDate ? dateValue : undefined}
                          onSelect={(date) => {
                            if (date) {
                              handleChange(field.name, date.toISOString().split('T')[0]);
                            } else {
                              handleChange(field.name, null);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {/* Hidden input for form validation */}
                    <input
                      type="hidden"
                      value={isValidDate ? dateValue.toISOString().split('T')[0] : ""}
                      required={field.required}
                    />
                  </div>
                );
              }

              if (field.type === "Number") {
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                      id={field.name}
                      type="number"
                      value={fieldValue}
                      onChange={(e) => handleChange(field.name, e.target.value ? Number(e.target.value) : null)}
                      required={field.required}
                    />
                  </div>
                );
              }

              if (field.type === "Boolean") {
                return (
                  <div key={field.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.name}
                      checked={!!fieldValue}
                      onCheckedChange={(checked) => handleChange(field.name, checked)}
                    />
                    <Label htmlFor={field.name} className="cursor-pointer">
                      {label} {field.required && <span className="text-destructive">*</span>}
                    </Label>
                  </div>
                );
              }

              // String fields - check if it's a long text field
              if (field.name.toLowerCase().includes("description") || 
                  field.name.toLowerCase().includes("content") ||
                  field.name.toLowerCase().includes("notes")) {
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && <span className="text-destructive">*</span>}
                    </Label>
                    <Textarea
                      id={field.name}
                      value={fieldValue}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                      rows={4}
                    />
                  </div>
                );
              }

              // Regular text input
              return (
                <div key={field.name} className="grid gap-2">
                  <Label htmlFor={field.name}>
                    {label} {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id={field.name}
                    type="text"
                    value={fieldValue}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isLoadingSchema}>
            {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

