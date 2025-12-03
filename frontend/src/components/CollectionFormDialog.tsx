import { useState, useEffect } from "react";
import * as React from "react";
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
import { VersionMismatchDialog } from "@/components/VersionMismatchDialog";

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
  const [calendarOpen, setCalendarOpen] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [version, setVersion] = useState<number | undefined>(undefined);
  const [versionMismatchDialogOpen, setVersionMismatchDialogOpen] = useState(false);
  const [versionMismatchData, setVersionMismatchData] = useState<{
    clientVersion: number;
    serverVersion: number;
  } | null>(null);

  const isEditMode = !!initialData?._id;
  const isCasesCollection = collectionName.toLowerCase() === 'cases';

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
        
        // Store version for cases collection (optimistic locking)
        if (isCasesCollection && cleaned.version !== undefined) {
          setVersion(cleaned.version);
        } else {
          setVersion(undefined);
        }
      } else {
        // For new records, auto-fill openingDate with today's date for cases
        const newFormData: any = {};
        if (collectionName.toLowerCase() === 'cases') {
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          newFormData.openingDate = `${year}-${month}-${day}`;
        }
        setFormData(newFormData);
      }
      setError("");
      setFieldErrors({});
      setTouchedFields({});
      setSubmitAttempted(false);
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
    
    // Clear error for this field when user starts typing
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
    validateField(fieldName);
  };

  const validateField = (fieldName: string) => {
    const field = schemaFields.find((f) => f.name === fieldName);
    if (!field) return;

    const value = formData[fieldName];
    let error = "";

    if (field.required) {
      if (value === undefined || value === null || value === "" || 
          (Array.isArray(value) && value.length === 0)) {
        error = "This field is required";
      }
    }

    // Additional validation for specific field types
    if (field.type === "Number" && value !== "" && value !== null && value !== undefined) {
      if (isNaN(Number(value))) {
        error = "Please enter a valid number";
      }
    }

    setFieldErrors((prev) => {
      if (error) {
        return { ...prev, [fieldName]: error };
      } else {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      }
    });
  };

  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    schemaFields.forEach((field) => {
      if (field.required) {
        const value = formData[field.name];
        if (value === undefined || value === null || value === "" || 
            (Array.isArray(value) && value.length === 0)) {
          errors[field.name] = "This field is required";
          isValid = false;
        }
      }

      // Additional validation for specific field types
      if (field.type === "Number" && formData[field.name] !== "" && 
          formData[field.name] !== null && formData[field.name] !== undefined) {
        if (isNaN(Number(formData[field.name]))) {
          errors[field.name] = "Please enter a valid number";
          isValid = false;
        }
      }
    });

    setFieldErrors(errors);
    setSubmitAttempted(true);
    
    // Mark all fields as touched to show errors
    const allTouched: Record<string, boolean> = {};
    schemaFields.forEach((field) => {
      allTouched[field.name] = true;
    });
    setTouchedFields(allTouched);

    return isValid;
  };

  const handleSubmit = async () => {
    // Validate all fields before submission
    if (!validateAllFields()) {
      setError("Please fill in all required fields");
      return;
    }

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
        // Include version for cases collection (optimistic locking)
        if (isCasesCollection && version !== undefined) {
          cleanedData.version = version;
        }
        
        try {
          await API.put(`/dynamic/${collectionName}/${initialData._id}`, cleanedData);
          toast.success(`${getSingularTitle(title)} updated successfully!`);
          onSuccess();
          onOpenChange(false);
          setFormData({});
          setFieldErrors({});
          setTouchedFields({});
          setSubmitAttempted(false);
          setVersion(undefined);
        } catch (error: any) {
          // Handle version mismatch error
          if (error.response?.status === 409 && error.response?.data?.error === 'VersionMismatch') {
            const mismatchData = error.response.data;
            setVersionMismatchData({
              clientVersion: mismatchData.clientVersion || version || 1,
              serverVersion: mismatchData.serverVersion || 1
            });
            setVersionMismatchDialogOpen(true);
            setError("Version conflict: Another user has updated this case.");
            return; // Don't close dialog, let user decide what to do
          }
          throw error; // Re-throw other errors
        }
      } else {
        await API.post(`/dynamic/${collectionName}`, cleanedData);
        toast.success(`${getSingularTitle(title)} created successfully!`);
        onSuccess();
        onOpenChange(false);
        setFormData({});
        setFieldErrors({});
        setTouchedFields({});
        setSubmitAttempted(false);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.response?.data || error.message || "Failed to save";
      setError(errorMsg);
      toast.error(`Failed to save: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReloadLatestVersion = async () => {
    if (!initialData?._id) return;
    
    try {
      // Fetch latest version of the case
      const response = await API.get(`/dynamic/${collectionName.toLowerCase()}/${initialData._id}`);
      const latestData = response.data;
      
      // Update form with latest data
      const cleaned = { ...latestData };
      Object.keys(cleaned).forEach(key => {
        if (cleaned[key] instanceof Date) {
          cleaned[key] = cleaned[key].toISOString().split('T')[0];
        } else if (typeof cleaned[key] === 'string' && cleaned[key].match(/^\d{4}-\d{2}-\d{2}T/)) {
          cleaned[key] = cleaned[key].split('T')[0];
        }
      });
      setFormData(cleaned);
      
      // Update version
      if (isCasesCollection && cleaned.version !== undefined) {
        setVersion(cleaned.version);
      }
      
      setError("");
      toast.success("Latest version loaded. Please review changes before saving.");
    } catch (err: any) {
      toast.error("Failed to reload latest version");
      console.error("Reload error:", err);
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

              // Helper to check if field should show error
              const showError = (submitAttempted || touchedFields[field.name]) && fieldErrors[field.name];
              const hasError = !!fieldErrors[field.name];

              // Special handling for status field in cases collection
              if (field.name === "status" && collectionName.toLowerCase() === "cases") {
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && <span className="text-destructive">*</span>}
                    </Label>
                    <Select
                      value={fieldValue || ""}
                      onValueChange={(value) => handleChange(field.name, value)}
                      onOpenChange={(open) => {
                        if (!open) {
                          handleBlur(field.name);
                        }
                      }}
                    >
                      <SelectTrigger 
                        id={field.name} 
                        className={cn("w-full", hasError && "border-destructive focus:border-destructive focus:ring-destructive")}
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Handle Date type fields and fields with "date" in the name (like openingDate)
              if (field.type === "Date" || field.name.toLowerCase().includes("date")) {
                let dateValue: Date | undefined;
                try {
                  if (fieldValue) {
                    // Handle both Date objects and string dates (YYYY-MM-DD format)
                    if (fieldValue instanceof Date) {
                      dateValue = !isNaN(fieldValue.getTime()) ? fieldValue : undefined;
                    } else if (typeof fieldValue === 'string' && fieldValue.trim() !== '') {
                      // Handle YYYY-MM-DD format strings - parse in local time to avoid timezone issues
                      const dateParts = fieldValue.trim().split('-');
                      if (dateParts.length === 3) {
                        const year = parseInt(dateParts[0], 10);
                        const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
                        const day = parseInt(dateParts[2], 10);
                        const parsed = new Date(year, month, day);
                        dateValue = !isNaN(parsed.getTime()) ? parsed : undefined;
                      } else {
                        // Fallback to standard parsing
                        const parsed = new Date(fieldValue);
                        dateValue = !isNaN(parsed.getTime()) ? parsed : undefined;
                      }
                    }
                  }
                } catch (error) {
                  console.error("Error parsing date:", error);
                  dateValue = undefined;
                }
                const isValidDate = dateValue && !isNaN(dateValue.getTime());
                
                // Check if this is openingDate for a new case - make it read-only
                const isOpeningDateNewCase = field.name.toLowerCase() === 'openingdate' && 
                                             collectionName.toLowerCase() === 'cases' && 
                                             !isEditMode;
                
                // Check if this is dateOfBirth - restrict to past dates only
                const isDateOfBirth = field.name.toLowerCase() === 'dateofbirth' || 
                                      field.name.toLowerCase() === 'dob';
                
                // Helper to check if field should show error (redefined here for date fields)
                const showErrorDate = (submitAttempted || touchedFields[field.name]) && fieldErrors[field.name];
                const hasErrorDate = !!fieldErrors[field.name];
                
                // If openingDate for new case, show as read-only input
                if (isOpeningDateNewCase) {
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                      id={field.name}
                      type="text"
                      value={isValidDate ? format(dateValue, "PPP") : ""}
                      readOnly
                      disabled
                      className="bg-muted cursor-not-allowed"
                    />
                    {/* Hidden input for form validation */}
                    <input
                      type="hidden"
                      value={isValidDate ? dateValue.toISOString().split('T')[0] : ""}
                      required={field.required}
                    />
                    {showErrorDate && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }
                
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && <span className="text-destructive">*</span>}
                    </Label>
                    <Popover open={calendarOpen[field.name] || false} onOpenChange={(open) => {
                      setCalendarOpen({ ...calendarOpen, [field.name]: open });
                      if (!open) {
                        handleBlur(field.name);
                      }
                    }}>
                      <PopoverTrigger asChild>
                        <Button
                          id={field.name}
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !isValidDate && "text-muted-foreground",
                            hasErrorDate && "border-destructive focus:border-destructive focus:ring-destructive"
                          )}
                          disabled={isSubmitting}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {isValidDate ? format(dateValue, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-0 shadow-none bg-transparent" align="center" side="top" sideOffset={8}>
                        <Calendar
                          mode="single"
                          selected={isValidDate ? dateValue : undefined}
                          disabled={isDateOfBirth ? { after: new Date() } : undefined}
                          maxDate={isDateOfBirth ? new Date() : undefined}
                          disableFutureNavigation={isDateOfBirth}
                          onSelect={(date) => {
                            try {
                              if (date) {
                                // Store as YYYY-MM-DD string format in local time (not UTC)
                                // This prevents timezone issues where selecting a date might shift to previous day
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                const dateString = `${year}-${month}-${day}`;
                                handleChange(field.name, dateString);
                                setCalendarOpen({ ...calendarOpen, [field.name]: false });
                                handleBlur(field.name);
                              } else {
                                handleChange(field.name, null);
                                setCalendarOpen({ ...calendarOpen, [field.name]: false });
                                handleBlur(field.name);
                              }
                            } catch (error) {
                              console.error("Error handling date selection:", error);
                              toast.error("Failed to set date");
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
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
                      onBlur={() => handleBlur(field.name)}
                      required={field.required}
                      className={cn(hasError && "border-destructive focus:border-destructive focus:ring-destructive")}
                    />
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
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
                      onBlur={() => handleBlur(field.name)}
                      required={field.required}
                      rows={4}
                      className={cn(hasError && "border-destructive focus:border-destructive focus:ring-destructive")}
                    />
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
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
                    onBlur={() => handleBlur(field.name)}
                    required={field.required}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    className={cn(hasError && "border-destructive focus:border-destructive focus:ring-destructive")}
                  />
                  {showError && (
                    <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                  )}
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
      
      {/* Version Mismatch Dialog */}
      {versionMismatchData && (
        <VersionMismatchDialog
          open={versionMismatchDialogOpen}
          onOpenChange={setVersionMismatchDialogOpen}
          clientVersion={versionMismatchData.clientVersion}
          serverVersion={versionMismatchData.serverVersion}
          onReload={handleReloadLatestVersion}
          onCancel={() => {
            setVersionMismatchDialogOpen(false);
            setVersionMismatchData(null);
          }}
        />
      )}
    </Dialog>
  );
}

