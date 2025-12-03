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
  const [incidentOptions, setIncidentOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [officerOptions, setOfficerOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [locationOptions, setLocationOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [crimeTypeOptions, setCrimeTypeOptions] = useState<string[]>([]);
  const [arrestOptions, setArrestOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [caseOptions, setCaseOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [evidenceOptions, setEvidenceOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [personOptions, setPersonOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [loadingOptions, setLoadingOptions] = useState({ 
    incidents: false, 
    officers: false, 
    locations: false, 
    crimeTypes: false,
    arrests: false,
    cases: false,
    evidence: false,
    people: false
  });

  const isEditMode = !!initialData?._id;
  const isCasesCollection = collectionName.toLowerCase() === 'cases';
  const isDepartmentsCollection = collectionName.toLowerCase() === 'departments';
  const isPeopleCollection = collectionName.toLowerCase() === 'people';
  const isIncidentsCollection = collectionName.toLowerCase() === 'incidents';
  const isChargesCollection = collectionName.toLowerCase() === 'charges';
  const isEvidenceCollection = collectionName.toLowerCase() === 'evidence';
  const isForensicsCollection = collectionName.toLowerCase() === 'forensics';
  const isReportsCollection = collectionName.toLowerCase() === 'reports';
  const isPrisonsCollection = collectionName.toLowerCase() === 'prisons';
  const isVehiclesCollection = collectionName.toLowerCase() === 'vehicles';
  const isWeaponsCollection = collectionName.toLowerCase() === 'weapons';
  
  // Available role options for person roles field
  const PERSON_ROLES = ['suspect', 'witness', 'victim', 'complainant', 'informant', 'other'];
  
  // Predefined evidence types
  const EVIDENCE_TYPES = [
    'Physical',
    'Digital',
    'Documentary',
    'Biological',
    'Chemical',
    'Firearm',
    'Tool Mark',
    'Trace',
    'Other'
  ];
  
  // Predefined forensic analysis types
  const FORENSIC_ANALYSIS_TYPES = [
    'DNA Analysis',
    'Fingerprint Analysis',
    'Ballistics',
    'Toxicology',
    'Serology',
    'Trace Evidence',
    'Digital Forensics',
    'Document Examination',
    'Handwriting Analysis',
    'Blood Alcohol Content',
    'Drug Analysis',
    'Fire Debris Analysis',
    'Other'
  ];
  
  // Predefined report types
  const REPORT_TYPES = [
    'Incident Report',
    'Arrest Report',
    'Investigation Report',
    'Forensic Report',
    'Evidence Report',
    'Case Summary',
    'Court Report',
    'Witness Statement',
    'Officer Statement',
    'Medical Report',
    'Other'
  ];
  
  // Predefined security levels for prisons
  const SECURITY_LEVELS = [
    'Minimum',
    'Medium',
    'Maximum'
  ];
  
  // Predefined weapon types
  const WEAPON_TYPES = [
    'Handgun',
    'Rifle',
    'Shotgun',
    'Knife',
    'Blade',
    'Blunt Object',
    'Explosive',
    'Chemical',
    'Other'
  ];
  
  // Map of logical primary keys for each collection (fields that should be auto-generated and disabled)
  const PRIMARY_KEY_FIELDS: Record<string, string> = {
    cases: 'caseID',
    incidents: 'incidentID',
    arrests: 'arrestID',
    officers: 'officerID',
    departments: 'departmentID',
    people: 'personID',
    locations: 'locationID',
    charges: 'chargeID',
    evidence: 'evidenceID',
    forensics: 'forensicsID',
    reports: 'reportID',
    prisons: 'prisonID',
    vehicles: 'vehicleID',
    weapons: 'weaponID',
    sentences: 'sentenceID',
  };
  
  const primaryKeyField = PRIMARY_KEY_FIELDS[collectionName.toLowerCase()];

  // Fetch foreign key options for cases, departments, incidents, charges, evidence, forensics, reports, prisons, vehicles, and weapons collections
  const fetchForeignKeyOptions = async () => {
    const isCases = collectionName.toLowerCase() === 'cases';
    const isDepartments = collectionName.toLowerCase() === 'departments';
    const isIncidents = collectionName.toLowerCase() === 'incidents';
    const isCharges = collectionName.toLowerCase() === 'charges';
    const isEvidence = collectionName.toLowerCase() === 'evidence';
    const isForensics = collectionName.toLowerCase() === 'forensics';
    const isReports = collectionName.toLowerCase() === 'reports';
    const isPrisons = collectionName.toLowerCase() === 'prisons';
    const isVehicles = collectionName.toLowerCase() === 'vehicles';
    const isWeapons = collectionName.toLowerCase() === 'weapons';
    
    if (!isCases && !isDepartments && !isIncidents && !isCharges && !isEvidence && !isForensics && !isReports && !isPrisons && !isVehicles && !isWeapons) {
      return; // Only fetch for supported collections
    }

    try {
      // Set initial loading states
      setLoadingOptions({ 
        incidents: (isCases || isWeapons), 
        officers: (isCases || isDepartments || isReports), 
        locations: (isDepartments || isIncidents || isPrisons),
        crimeTypes: isIncidents,
        arrests: isCharges,
        cases: (isEvidence || isForensics || isReports || isVehicles),
        evidence: isForensics,
        people: isWeapons
      });

      // Fetch incidents (for cases and weapons)
      if (isCases || isWeapons) {
        const incidentsResponse = await API.get('/dynamic/incidents');
        const incidents = incidentsResponse.data || [];
        const incidentOpts = incidents.map((incident: any) => {
          const id = incident.incidentID || incident._id;
          const label = incident.title 
            ? `${id} - ${incident.title}` 
            : id;
          return { id, label };
        }).sort((a: any, b: any) => a.label.localeCompare(b.label));
        setIncidentOptions(incidentOpts);
      }

      // Fetch officers (for cases, departments, and reports)
      if (isCases || isDepartments || isReports) {
        const officersResponse = await API.get('/dynamic/officers');
        const officers = officersResponse.data || [];
        const officerOpts = officers.map((officer: any) => {
          const id = officer.officerID || officer._id;
          const badgeNumber = officer.badgeNumber || '';
          const name = `${officer.firstName || ''} ${officer.lastName || ''}`.trim();
          const label = badgeNumber 
            ? `${badgeNumber}${name ? ` - ${name}` : ''}` 
            : (name || id);
          return { id, label };
        }).sort((a: any, b: any) => a.label.localeCompare(b.label));
        setOfficerOptions(officerOpts);
      }

      // Fetch locations (for departments, incidents, and prisons)
      if (isDepartments || isIncidents || isPrisons) {
        const locationsResponse = await API.get('/dynamic/locations');
        const locations = locationsResponse.data || [];
        const locationOpts = locations.map((location: any) => {
          const id = location.locationID || location._id;
          const parts = [location.address, location.city, location.state].filter(Boolean);
          const label = parts.length > 0 
            ? `${id} - ${parts.join(', ')}` 
            : id;
          return { id, label };
        }).sort((a: any, b: any) => a.label.localeCompare(b.label));
        setLocationOptions(locationOpts);
      }

      // Fetch unique crime types (for incidents only)
      if (isIncidents) {
        try {
          const crimeTypesResponse = await API.post('/dynamic/incidents/aggregate', {
            groupBy: ['crimeType'],
            limit: 100,
          });
          const crimeTypes = (crimeTypesResponse.data?.results || [])
            .map((r: any) => String(r._id || ''))
            .filter((v: string) => v !== null && v !== undefined && v !== '')
            .sort();
          setCrimeTypeOptions(crimeTypes);
        } catch (err) {
          console.error('Error fetching crime types:', err);
          // If aggregation fails, try to get from all incidents
          try {
            const incidentsResponse = await API.get('/dynamic/incidents');
            const incidents = incidentsResponse.data || [];
            const uniqueCrimeTypes = Array.from(
              new Set(incidents.map((inc: any) => String(inc.crimeType || '')).filter(Boolean))
            ).sort() as string[];
            setCrimeTypeOptions(uniqueCrimeTypes);
          } catch (fallbackErr) {
            console.error('Error fetching crime types fallback:', fallbackErr);
            setCrimeTypeOptions([]);
          }
        }
      }

      // Fetch arrests (for charges collection)
      if (isCharges) {
        const arrestsResponse = await API.get('/dynamic/arrests');
        const arrests = arrestsResponse.data || [];
        const arrestOpts = arrests.map((arrest: any) => {
          const id = arrest.arrestID || arrest._id;
          const label = id; // Just show the arrestID
          return { id, label };
        }).sort((a: any, b: any) => a.label.localeCompare(b.label));
        setArrestOptions(arrestOpts);
      }

      // Fetch cases (for evidence, forensics, reports, and vehicles collections)
      if (isEvidence || isForensics || isReports || isVehicles) {
        const casesResponse = await API.get('/dynamic/cases');
        const cases = casesResponse.data || [];
        const caseOpts = cases.map((caseItem: any) => {
          const id = caseItem.caseID || caseItem._id;
          const label = id; // Just show the caseID
          return { id, label };
        }).sort((a: any, b: any) => a.label.localeCompare(b.label));
        setCaseOptions(caseOpts);
      }

      // Fetch evidence (for forensics collection)
      if (isForensics) {
        const evidenceResponse = await API.get('/dynamic/evidence');
        const evidence = evidenceResponse.data || [];
        const evidenceOpts = evidence.map((evidenceItem: any) => {
          const id = evidenceItem.evidenceID || evidenceItem._id;
          const label = id; // Just show the evidenceID
          return { id, label };
        }).sort((a: any, b: any) => a.label.localeCompare(b.label));
        setEvidenceOptions(evidenceOpts);
      }

      // Fetch people (for weapons collection)
      if (isWeapons) {
        const peopleResponse = await API.get('/dynamic/people');
        const people = peopleResponse.data || [];
        const personOpts = people.map((person: any) => {
          const id = person.personID || person._id;
          const firstName = person.firstName || '';
          const lastName = person.lastName || '';
          const name = `${firstName} ${lastName}`.trim();
          const label = name 
            ? `${id} - ${name}` 
            : id;
          return { id, label };
        }).sort((a: any, b: any) => a.label.localeCompare(b.label));
        setPersonOptions(personOpts);
      }
    } catch (err) {
      console.error('Error fetching foreign key options:', err);
      toast.error('Failed to load dropdown options');
    } finally {
      setLoadingOptions({ 
        incidents: false, 
        officers: false, 
        locations: false, 
        crimeTypes: false,
        arrests: false,
        cases: false,
        evidence: false,
        people: false
      });
    }
  };

  useEffect(() => {
    if (open && collectionName) {
      fetchSchema();
      if (isCasesCollection || isDepartmentsCollection || isIncidentsCollection || isChargesCollection || isEvidenceCollection || isForensicsCollection || isReportsCollection || isPrisonsCollection || isVehiclesCollection || isWeaponsCollection) {
        fetchForeignKeyOptions();
      }
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
        // Default to 1 if version is not present (for cases created before version field was added)
        if (isCasesCollection) {
          // Ensure we capture the version from initialData
          const versionValue = initialData.version !== undefined 
            ? initialData.version 
            : (cleaned.version !== undefined ? cleaned.version : 1);
          setVersion(versionValue);
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
      // Filter out version field - it's auto-managed by the system
      const filteredFields = response.data.filter((field: Field) => field.name !== 'version');
      setSchemaFields(filteredFields);
    } catch (err: any) {
      console.error("Schema fetch error:", err);
      setError("Could not load form fields.");
    } finally {
      setIsLoadingSchema(false);
    }
  };

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [fieldName]: value }));
    
    // Clear error for this field when value changes
    // For array fields (like roles), clear error if at least one item is selected
    const shouldClearError = Array.isArray(value) 
      ? value.length > 0 
      : (value !== undefined && value !== null && value !== "");
    
    if (fieldErrors[fieldName] && shouldClearError) {
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

    // Skip validation for primary key fields when creating new records (they're auto-generated)
    if (!isEditMode && fieldName === primaryKeyField) {
      return;
    }

    const value = formData[fieldName];
    let error = "";

    if (field.required) {
      // For array fields (like roles), check if array is empty
      if (Array.isArray(value)) {
        if (value.length === 0) {
          error = "This field is required";
        }
      } else if (value === undefined || value === null || value === "") {
        error = "This field is required";
      }
    }

    // Additional validation for specific field types
    if (field.type === "Number" && value !== "" && value !== null && value !== undefined) {
      if (isNaN(Number(value))) {
        error = "Please enter a valid number";
      }
    }

    // Age validation for dateOfBirth in people collection (must be at least 10 years old)
    if (field.name.toLowerCase() === 'dateofbirth' || field.name.toLowerCase() === 'dob') {
      if (isPeopleCollection && !isEditMode && value) {
        try {
          // Parse the date value (could be string in YYYY-MM-DD format)
          let birthDate: Date;
          if (typeof value === 'string') {
            const dateParts = value.split('-');
            if (dateParts.length === 3) {
              birthDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
            } else {
              birthDate = new Date(value);
            }
          } else if (value instanceof Date) {
            birthDate = value;
          } else {
            return; // Invalid date format, skip age validation
          }

          if (!isNaN(birthDate.getTime())) {
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const dayDiff = today.getDate() - birthDate.getDate();
            
            // Calculate exact age
            let exactAge = age;
            if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
              exactAge--;
            }

            if (exactAge < 10) {
              error = "Person must be at least 10 years old";
            }
          }
        } catch (err) {
          // If date parsing fails, skip age validation (required validation will catch it)
        }
      }
    }

    // Future date validation for incidents collection (date field cannot be in future)
    if (field.name.toLowerCase() === 'date' && isIncidentsCollection && !isEditMode && value) {
      try {
        // Parse the date value (could be string in YYYY-MM-DD format)
        let selectedDate: Date;
        if (typeof value === 'string') {
          const dateParts = value.split('-');
          if (dateParts.length === 3) {
            selectedDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
          } else {
            selectedDate = new Date(value);
          }
        } else if (value instanceof Date) {
          selectedDate = value;
        } else {
          return; // Invalid date format, skip validation
        }

        if (!isNaN(selectedDate.getTime())) {
          const today = new Date();
          // Reset time to midnight for accurate date comparison
          today.setHours(0, 0, 0, 0);
          const compareDate = new Date(selectedDate);
          compareDate.setHours(0, 0, 0, 0);

          if (compareDate > today) {
            error = "Date cannot be in future";
          }
        }
      } catch (err) {
        // If date parsing fails, skip validation (required validation will catch it)
      }
    }

    // License plate pattern validation for vehicles collection (3 letters followed by 3 numbers)
    if (field.name.toLowerCase() === 'licenseplate' && isVehiclesCollection && value) {
      const licensePlatePattern = /^[A-Za-z]{3}[0-9]{3}$/;
      if (typeof value === 'string' && value.trim() !== '') {
        if (!licensePlatePattern.test(value.trim())) {
          error = "License plate must be 3 letters followed by 3 numbers (e.g., ABC123)";
        }
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
      // Skip validation for primary key fields when creating new records (they're auto-generated)
      if (!isEditMode && field.name === primaryKeyField) {
        return;
      }

      if (field.required) {
        const value = formData[field.name];
        // For array fields (like roles), check if array is empty
        if (Array.isArray(value)) {
          if (value.length === 0) {
            errors[field.name] = "This field is required";
            isValid = false;
          }
        } else if (value === undefined || value === null || value === "") {
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

      // License plate pattern validation for vehicles collection (3 letters followed by 3 numbers)
      if (field.name.toLowerCase() === 'licenseplate' && isVehiclesCollection && formData[field.name]) {
        const licensePlatePattern = /^[A-Za-z]{3}[0-9]{3}$/;
        const value = formData[field.name];
        if (typeof value === 'string' && value.trim() !== '') {
          if (!licensePlatePattern.test(value.trim())) {
            errors[field.name] = "License plate must be 3 letters followed by 3 numbers (e.g., ABC123)";
            isValid = false;
          }
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

  // Check if all required fields are filled (for disabling Create button)
  const areAllRequiredFieldsFilled = (): boolean => {
    if (isEditMode) {
      // For edit mode, allow submission even if some fields are empty (they might be optional)
      return true;
    }

    for (const field of schemaFields) {
      // Skip validation for primary key fields when creating new records (they're auto-generated)
      if (field.name === primaryKeyField) {
        continue;
      }

      if (field.required) {
        const value = formData[field.name];
        if (value === undefined || value === null || value === "" || 
            (Array.isArray(value) && value.length === 0)) {
          return false;
        }
      }
    }
    return true;
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
        // Remove _id, __v, createdAt, updatedAt, version for new records
        if (!isEditMode) {
          delete cleanedData._id;
          delete cleanedData.__v;
          delete cleanedData.createdAt;
          delete cleanedData.updatedAt;
          delete cleanedData.version; // Version is auto-created, don't send it for new cases
          // Remove primary key field - it will be auto-generated by backend
          if (primaryKeyField && cleanedData[primaryKeyField]) {
            delete cleanedData[primaryKeyField];
          }
        }
      });

      if (isEditMode) {
        // Check if data has actually changed
        const originalData = { ...initialData };
        // Remove metadata fields for comparison
        delete originalData._id;
        delete originalData.__v;
        delete originalData.createdAt;
        delete originalData.updatedAt;
        delete originalData.version;
        
        // Remove metadata from cleanedData for comparison
        const dataToCompare = { ...cleanedData };
        delete dataToCompare._id;
        delete dataToCompare.__v;
        delete dataToCompare.createdAt;
        delete dataToCompare.updatedAt;
        
        // Compare objects (simple deep comparison)
        const hasChanges = JSON.stringify(originalData) !== JSON.stringify(dataToCompare);
        
        if (!hasChanges) {
          // No changes made, just close the dialog without making any API call
          // Version remains unchanged in database
          toast.info("No changes to save");
          setVersion(undefined); // Reset version state
          onOpenChange(false);
          setIsSubmitting(false);
          return;
        }
        
        // Include version for cases collection (optimistic locking)
        // Always send version for cases to enable optimistic locking
        if (isCasesCollection) {
          // Ensure version is set - use stored version or get from initialData
          const versionToSend = version !== undefined ? version : (initialData?.version !== undefined ? initialData.version : 1);
          cleanedData.version = versionToSend;
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
              clientVersion: mismatchData.clientVersion || version || initialData?.version || 1,
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
      
      // Update version (default to 1 if not present)
      if (isCasesCollection) {
        setVersion(cleaned.version !== undefined ? cleaned.version : 1);
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

  // Handle dialog close - ensure no save happens if user closes without clicking Update
  const handleDialogClose = (shouldClose: boolean) => {
    if (shouldClose && isSubmitting) {
      // Don't allow closing while submitting
      return;
    }
    // Reset version state when closing without saving
    if (shouldClose && !isSubmitting) {
      setVersion(undefined);
      setVersionMismatchData(null);
      setVersionMismatchDialogOpen(false);
    }
    onOpenChange(shouldClose);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
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
              
              // Check if this is a logical primary key field (should be disabled/auto-generated)
              const isPrimaryKey = field.name === primaryKeyField;

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

              // Special handling for incidentID dropdown in cases collection
              if (field.name === "incidentID" && isCasesCollection) {
                const isLoading = loadingOptions.incidents;
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
                    </Label>
                    <Select
                      value={fieldValue || ""}
                      onValueChange={(value) => handleChange(field.name, value)}
                      onOpenChange={(open) => {
                        if (!open) {
                          handleBlur(field.name);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger 
                        id={field.name} 
                        className={cn(
                          "w-full",
                          hasError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={isLoading ? "Loading incidents..." : `Select ${label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {incidentOptions.length === 0 && !isLoading && (
                          <SelectItem value="" disabled>No incidents available</SelectItem>
                        )}
                        {incidentOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Special handling for leadOfficerID dropdown in cases collection
              if (field.name === "leadOfficerID" && isCasesCollection) {
                const isLoading = loadingOptions.officers;
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
                    </Label>
                    <Select
                      value={fieldValue || ""}
                      onValueChange={(value) => handleChange(field.name, value)}
                      onOpenChange={(open) => {
                        if (!open) {
                          handleBlur(field.name);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger 
                        id={field.name} 
                        className={cn(
                          "w-full",
                          hasError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={isLoading ? "Loading officers..." : `Select ${label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {officerOptions.length === 0 && !isLoading && (
                          <SelectItem value="" disabled>No officers available</SelectItem>
                        )}
                        {officerOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Special handling for headOfficerID dropdown in departments collection
              if (field.name === "headOfficerID" && isDepartmentsCollection) {
                const isLoading = loadingOptions.officers;
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
                    </Label>
                    <Select
                      value={fieldValue || ""}
                      onValueChange={(value) => handleChange(field.name, value)}
                      onOpenChange={(open) => {
                        if (!open) {
                          handleBlur(field.name);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger 
                        id={field.name} 
                        className={cn(
                          "w-full",
                          hasError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={isLoading ? "Loading officers..." : `Select ${label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {officerOptions.length === 0 && !isLoading && (
                          <SelectItem value="" disabled>No officers available</SelectItem>
                        )}
                        {officerOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Special handling for locationID dropdown in departments collection
              if (field.name === "locationID" && isDepartmentsCollection) {
                const isLoading = loadingOptions.locations;
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
                    </Label>
                    <Select
                      value={fieldValue || ""}
                      onValueChange={(value) => handleChange(field.name, value)}
                      onOpenChange={(open) => {
                        if (!open) {
                          handleBlur(field.name);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger 
                        id={field.name} 
                        className={cn(
                          "w-full",
                          hasError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={isLoading ? "Loading locations..." : `Select ${label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {locationOptions.length === 0 && !isLoading && (
                          <SelectItem value="" disabled>No locations available</SelectItem>
                        )}
                        {locationOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Special handling for locationID dropdown in incidents collection
              if (field.name === "locationID" && isIncidentsCollection) {
                const isLoading = loadingOptions.locations;
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
                    </Label>
                    <Select
                      value={fieldValue || ""}
                      onValueChange={(value) => handleChange(field.name, value)}
                      onOpenChange={(open) => {
                        if (!open) {
                          handleBlur(field.name);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger 
                        id={field.name} 
                        className={cn(
                          "w-full",
                          hasError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={isLoading ? "Loading locations..." : `Select ${label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {locationOptions.length === 0 && !isLoading && (
                          <SelectItem value="" disabled>No locations available</SelectItem>
                        )}
                        {locationOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Special handling for crimeType dropdown in incidents collection
              if (field.name === "crimeType" && isIncidentsCollection) {
                const isLoading = loadingOptions.crimeTypes;
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
                    </Label>
                    <Select
                      value={fieldValue || ""}
                      onValueChange={(value) => handleChange(field.name, value)}
                      onOpenChange={(open) => {
                        if (!open) {
                          handleBlur(field.name);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger 
                        id={field.name} 
                        className={cn(
                          "w-full",
                          hasError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={isLoading ? "Loading crime types..." : `Select ${label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {crimeTypeOptions.length === 0 && !isLoading && (
                          <SelectItem value="" disabled>No crime types available</SelectItem>
                        )}
                        {crimeTypeOptions.map((crimeType) => (
                          <SelectItem key={crimeType} value={crimeType}>
                            {crimeType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Special handling for arrestID dropdown in charges collection
              if (field.name === "arrestID" && isChargesCollection) {
                const isLoading = loadingOptions.arrests;
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
                    </Label>
                    <Select
                      value={fieldValue || ""}
                      onValueChange={(value) => handleChange(field.name, value)}
                      onOpenChange={(open) => {
                        if (!open) {
                          handleBlur(field.name);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger 
                        id={field.name} 
                        className={cn(
                          "w-full",
                          hasError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={isLoading ? "Loading arrests..." : `Select ${label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {arrestOptions.length === 0 && !isLoading && (
                          <SelectItem value="" disabled>No arrests available</SelectItem>
                        )}
                        {arrestOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Special handling for caseID dropdown in evidence collection
              if (field.name === "caseID" && isEvidenceCollection) {
                const isLoading = loadingOptions.cases;
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
                    </Label>
                    <Select
                      value={fieldValue || ""}
                      onValueChange={(value) => handleChange(field.name, value)}
                      onOpenChange={(open) => {
                        if (!open) {
                          handleBlur(field.name);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger 
                        id={field.name} 
                        className={cn(
                          "w-full",
                          hasError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={isLoading ? "Loading cases..." : `Select ${label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {caseOptions.length === 0 && !isLoading && (
                          <SelectItem value="" disabled>No cases available</SelectItem>
                        )}
                        {caseOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Special handling for type dropdown in evidence collection
              if (field.name === "type" && isEvidenceCollection) {
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
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
                        className={cn(
                          "w-full",
                          hasError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {EVIDENCE_TYPES.map((evidenceType) => (
                          <SelectItem key={evidenceType} value={evidenceType}>
                            {evidenceType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Special handling for caseID dropdown in forensics collection
              if (field.name === "caseID" && isForensicsCollection) {
                const isLoading = loadingOptions.cases;
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
                    </Label>
                    <Select
                      value={fieldValue || ""}
                      onValueChange={(value) => handleChange(field.name, value)}
                      onOpenChange={(open) => {
                        if (!open) {
                          handleBlur(field.name);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger 
                        id={field.name} 
                        className={cn(
                          "w-full",
                          hasError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={isLoading ? "Loading cases..." : `Select ${label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {caseOptions.length === 0 && !isLoading && (
                          <SelectItem value="" disabled>No cases available</SelectItem>
                        )}
                        {caseOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Special handling for evidenceID dropdown in forensics collection
              if (field.name === "evidenceID" && isForensicsCollection) {
                const isLoading = loadingOptions.evidence;
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
                    </Label>
                    <Select
                      value={fieldValue || ""}
                      onValueChange={(value) => handleChange(field.name, value)}
                      onOpenChange={(open) => {
                        if (!open) {
                          handleBlur(field.name);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger 
                        id={field.name} 
                        className={cn(
                          "w-full",
                          hasError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={isLoading ? "Loading evidence..." : `Select ${label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {evidenceOptions.length === 0 && !isLoading && (
                          <SelectItem value="" disabled>No evidence available</SelectItem>
                        )}
                        {evidenceOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Special handling for analysisType dropdown in forensics collection
              if (field.name === "analysisType" && isForensicsCollection) {
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
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
                        className={cn(
                          "w-full",
                          hasError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {FORENSIC_ANALYSIS_TYPES.map((analysisType) => (
                          <SelectItem key={analysisType} value={analysisType}>
                            {analysisType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Special handling for caseID dropdown in reports collection
              if (field.name === "caseID" && isReportsCollection) {
                const isLoading = loadingOptions.cases;
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
                    </Label>
                    <Select
                      value={fieldValue || ""}
                      onValueChange={(value) => handleChange(field.name, value)}
                      onOpenChange={(open) => {
                        if (!open) {
                          handleBlur(field.name);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger 
                        id={field.name} 
                        className={cn(
                          "w-full",
                          hasError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={isLoading ? "Loading cases..." : `Select ${label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {caseOptions.length === 0 && !isLoading && (
                          <SelectItem value="" disabled>No cases available</SelectItem>
                        )}
                        {caseOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Special handling for authorID dropdown in reports collection
              if (field.name === "authorID" && isReportsCollection) {
                const isLoading = loadingOptions.officers;
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
                    </Label>
                    <Select
                      value={fieldValue || ""}
                      onValueChange={(value) => handleChange(field.name, value)}
                      onOpenChange={(open) => {
                        if (!open) {
                          handleBlur(field.name);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger 
                        id={field.name} 
                        className={cn(
                          "w-full",
                          hasError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={isLoading ? "Loading officers..." : `Select ${label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {officerOptions.length === 0 && !isLoading && (
                          <SelectItem value="" disabled>No officers available</SelectItem>
                        )}
                        {officerOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Special handling for reportType dropdown in reports collection
              if (field.name === "reportType" && isReportsCollection) {
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
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
                        className={cn(
                          "w-full",
                          hasError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {REPORT_TYPES.map((reportType) => (
                          <SelectItem key={reportType} value={reportType}>
                            {reportType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Special handling for securityLevel dropdown in prisons collection
              if (field.name === "securityLevel" && isPrisonsCollection) {
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
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
                        className={cn(
                          "w-full",
                          hasError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {SECURITY_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Special handling for locationID dropdown in prisons collection
              if (field.name === "locationID" && isPrisonsCollection) {
                const isLoading = loadingOptions.locations;
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
                    </Label>
                    <Select
                      value={fieldValue || ""}
                      onValueChange={(value) => handleChange(field.name, value)}
                      onOpenChange={(open) => {
                        if (!open) {
                          handleBlur(field.name);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger 
                        id={field.name} 
                        className={cn(
                          "w-full",
                          hasError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={isLoading ? "Loading locations..." : `Select ${label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {locationOptions.length === 0 && !isLoading && (
                          <SelectItem value="" disabled>No locations available</SelectItem>
                        )}
                        {locationOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Special handling for caseID dropdown in vehicles collection
              if (field.name === "caseID" && isVehiclesCollection) {
                const isLoading = loadingOptions.cases;
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
                    </Label>
                    <Select
                      value={fieldValue || ""}
                      onValueChange={(value) => handleChange(field.name, value)}
                      onOpenChange={(open) => {
                        if (!open) {
                          handleBlur(field.name);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger 
                        id={field.name} 
                        className={cn(
                          "w-full",
                          hasError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={isLoading ? "Loading cases..." : `Select ${label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {caseOptions.length === 0 && !isLoading && (
                          <SelectItem value="" disabled>No cases available</SelectItem>
                        )}
                        {caseOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Special handling for incidentID dropdown in weapons collection
              if (field.name === "incidentID" && isWeaponsCollection) {
                const isLoading = loadingOptions.incidents;
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
                    </Label>
                    <Select
                      value={fieldValue || ""}
                      onValueChange={(value) => handleChange(field.name, value)}
                      onOpenChange={(open) => {
                        if (!open) {
                          handleBlur(field.name);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger 
                        id={field.name} 
                        className={cn(
                          "w-full",
                          hasError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={isLoading ? "Loading incidents..." : `Select ${label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {incidentOptions.length === 0 && !isLoading && (
                          <SelectItem value="" disabled>No incidents available</SelectItem>
                        )}
                        {incidentOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Special handling for ownerID dropdown in weapons collection
              if (field.name === "ownerID" && isWeaponsCollection) {
                const isLoading = loadingOptions.people;
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
                    </Label>
                    <Select
                      value={fieldValue || ""}
                      onValueChange={(value) => handleChange(field.name, value)}
                      onOpenChange={(open) => {
                        if (!open) {
                          handleBlur(field.name);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger 
                        id={field.name} 
                        className={cn(
                          "w-full",
                          hasError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={isLoading ? "Loading people..." : `Select ${label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {personOptions.length === 0 && !isLoading && (
                          <SelectItem value="" disabled>No people available</SelectItem>
                        )}
                        {personOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Special handling for type dropdown in weapons collection
              if (field.name === "type" && isWeaponsCollection) {
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
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
                        className={cn(
                          "w-full",
                          hasError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {WEAPON_TYPES.map((weaponType) => (
                          <SelectItem key={weaponType} value={weaponType}>
                            {weaponType}
                          </SelectItem>
                        ))}
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
                
                // Check if this is date field for incidents - restrict to past dates only
                const isIncidentDate = field.name.toLowerCase() === 'date' && 
                                       isIncidentsCollection && 
                                       !isEditMode;
                
                // Calculate maximum date for dateOfBirth (10 years ago for people collection when creating new person)
                let maxDateForDateOfBirth: Date;
                if (isDateOfBirth && isPeopleCollection && !isEditMode) {
                  const today = new Date();
                  maxDateForDateOfBirth = new Date();
                  maxDateForDateOfBirth.setFullYear(today.getFullYear() - 10);
                } else {
                  maxDateForDateOfBirth = new Date(); // For other cases, just restrict to today
                }
                
                // Calculate maximum date for incident date (today - cannot be in future)
                const maxDateForIncident = isIncidentDate ? new Date() : undefined;
                
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
                          disabled={
                            isDateOfBirth 
                              ? { after: maxDateForDateOfBirth } 
                              : undefined // Don't visually disable incident dates - show error on click instead
                          }
                          maxDate={isDateOfBirth ? maxDateForDateOfBirth : undefined} // Don't set maxDate for incidents - allow selection but validate
                          disableFutureNavigation={
                            (isDateOfBirth && !(isPeopleCollection && !isEditMode))
                            // Don't disable future navigation for incidents - allow clicking but show error
                          }
                          onSelect={(date) => {
                            try {
                              if (date) {
                                // Store as YYYY-MM-DD string format in local time (not UTC)
                                // This prevents timezone issues where selecting a date might shift to previous day
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                const dateString = `${year}-${month}-${day}`;
                                
                                // For incident dates, validate immediately on selection
                                if (isIncidentDate) {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  const selectedDate = new Date(date);
                                  selectedDate.setHours(0, 0, 0, 0);
                                  
                                  if (selectedDate > today) {
                                    // Future date selected - show error but don't close calendar
                                    setFieldErrors((prev) => ({
                                      ...prev,
                                      [field.name]: "Date cannot be in future"
                                    }));
                                    setTouchedFields((prev) => ({ ...prev, [field.name]: true }));
                                    toast.error("Date cannot be in future");
                                    return; // Don't update the form data or close calendar
                                  }
                                }
                                
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
                      disabled={isPrimaryKey}
                      className={cn(
                        hasError && "border-destructive focus:border-destructive focus:ring-destructive",
                        isPrimaryKey && "bg-muted cursor-not-allowed"
                      )}
                    />
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              if (field.type === "Boolean") {
                return (
                  <div key={field.name} className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={field.name}
                        checked={!!fieldValue}
                        onCheckedChange={(checked) => {
                          handleChange(field.name, checked);
                          handleBlur(field.name);
                        }}
                      />
                      <Label htmlFor={field.name} className="cursor-pointer">
                        {label} {field.required && <span className="text-destructive">*</span>}
                      </Label>
                    </div>
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
                  </div>
                );
              }

              // Special handling for roles field in people collection (multi-select)
              if (field.name === "roles" && isPeopleCollection) {
                const selectedRoles = Array.isArray(fieldValue) ? fieldValue : (fieldValue ? [fieldValue] : []);
                
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
                    </Label>
                    <div className={cn(
                      "border rounded-md p-3 space-y-2 min-h-[100px] max-h-[200px] overflow-y-auto",
                      hasError && "border-destructive"
                    )}>
                      {PERSON_ROLES.map((role) => {
                        const isSelected = selectedRoles.includes(role);
                        return (
                          <div key={role} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${field.name}-${role}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                let newRoles: string[];
                                if (checked) {
                                  // Add role if not already selected
                                  newRoles = [...selectedRoles, role];
                                } else {
                                  // Remove role
                                  newRoles = selectedRoles.filter((r) => r !== role);
                                }
                                handleChange(field.name, newRoles);
                                // Only validate on blur if roles array becomes empty
                                // If at least one role is selected, clear error immediately
                                if (newRoles.length > 0) {
                                  // Clear error immediately when at least one role is selected
                                  setFieldErrors((prev) => {
                                    const newErrors = { ...prev };
                                    delete newErrors[field.name];
                                    return newErrors;
                                  });
                                } else {
                                  // Validate only if array becomes empty
                                  handleBlur(field.name);
                                }
                              }}
                            />
                            <Label 
                              htmlFor={`${field.name}-${role}`} 
                              className="cursor-pointer font-normal capitalize"
                            >
                              {role}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                    {selectedRoles.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Selected: {selectedRoles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}
                      </div>
                    )}
                    {showError && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors[field.name]}</p>
                    )}
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
                      disabled={isPrimaryKey}
                      rows={4}
                      className={cn(
                        hasError && "border-destructive focus:border-destructive focus:ring-destructive",
                        isPrimaryKey && "bg-muted cursor-not-allowed"
                      )}
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
                    {label} {field.required && !isPrimaryKey && <span className="text-destructive">*</span>}
                    {isPrimaryKey && !isEditMode && (
                      <span className="text-xs text-muted-foreground ml-2">(Auto-generated)</span>
                    )}
                  </Label>
                  <Input
                    id={field.name}
                    type="text"
                    value={fieldValue}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    onBlur={() => handleBlur(field.name)}
                    required={field.required && !isPrimaryKey}
                    disabled={isPrimaryKey}
                    placeholder={isPrimaryKey && !isEditMode ? "Will be auto-generated" : `Enter ${label.toLowerCase()}`}
                    className={cn(
                      hasError && "border-destructive focus:border-destructive focus:ring-destructive",
                      isPrimaryKey && "bg-muted cursor-not-allowed"
                    )}
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
          <Button variant="outline" onClick={() => handleDialogClose(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || isLoadingSchema || !areAllRequiredFieldsFilled()}
          >
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

