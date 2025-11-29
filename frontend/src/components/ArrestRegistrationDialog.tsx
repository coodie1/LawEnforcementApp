import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2, CheckCircle2, XCircle } from "lucide-react";
import API from "@/api.ts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ArrestRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: any; // For editing existing arrests
}

type Step = "arrestee" | "charge" | "case" | "completed";

export function ArrestRegistrationDialog({ open, onOpenChange, onSuccess, initialData }: ArrestRegistrationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>("arrestee");
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [personID, setPersonID] = useState("");
  const [caseID, setCaseID] = useState("");
  const [arrestDate, setArrestDate] = useState<Date>(new Date());
  const [locationID, setLocationID] = useState("");
  const [chargeDescription, setChargeDescription] = useState("");
  const [statuteCode, setStatuteCode] = useState("");
  const [isConvicted, setIsConvicted] = useState(false);

  // Options
  const [people, setPeople] = useState<Array<{ personID: string; firstName: string; lastName: string }>>([]);
  const [openCases, setOpenCases] = useState<Array<{ caseID: string; incidentID: string }>>([]);
  const [locations, setLocations] = useState<Array<{ locationID: string; address: string; city: string; state: string }>>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    if (open) {
      fetchOptions();
      // Reset or populate form based on initialData
      if (initialData) {
        // Editing mode - populate with existing data
        setPersonID(initialData.personID || "");
        setCaseID(initialData.caseID || "");
        setArrestDate(initialData.date ? new Date(initialData.date) : new Date());
        setLocationID(initialData.locationID || "");
        // Note: Charge data would need to be fetched separately if editing
        setChargeDescription("");
        setStatuteCode("");
        setIsConvicted(false);
      } else {
        // New arrest - reset form
        setPersonID("");
        setCaseID("");
        setArrestDate(new Date());
        setLocationID("");
        setChargeDescription("");
        setStatuteCode("");
        setIsConvicted(false);
      }
      setCurrentStep("arrestee");
      setError(null);
    }
  }, [open, initialData]);

  const fetchOptions = async () => {
    try {
      setIsLoadingOptions(true);
      
      // Fetch people
      const peopleResponse = await API.get('/dynamic/people');
      setPeople(peopleResponse.data.map((p: any) => ({
        personID: p.personID,
        firstName: p.firstName,
        lastName: p.lastName
      })));

      // Fetch open cases
      const casesResponse = await API.get('/dynamic/cases');
      const open = casesResponse.data.filter((c: any) => 
        c.status && c.status.toLowerCase() === 'open'
      );
      setOpenCases(open.map((c: any) => ({
        caseID: c.caseID,
        incidentID: c.incidentID
      })));

      // Fetch locations
      const locationsResponse = await API.get('/dynamic/locations');
      setLocations(locationsResponse.data.map((loc: any) => ({
        locationID: loc.locationID,
        address: loc.address || '',
        city: loc.city || '',
        state: loc.state || ''
      })));
    } catch (err) {
      console.error("Error fetching options:", err);
      toast.error("Failed to load form options");
    } finally {
      setIsLoadingOptions(false);
    }
  };


  const handleSubmit = async () => {
    // Validate
    if (!personID || !caseID || !arrestDate || !locationID || !chargeDescription || !statuteCode) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setCurrentStep("arrestee");

    try {
      // Simulate step progress
      setTimeout(() => setCurrentStep("charge"), 300);
      setTimeout(() => setCurrentStep("case"), 600);
      
      const response = await API.post('/arrest/register', {
        personID,
        caseID,
        arrestDate: format(arrestDate, 'yyyy-MM-dd'),
        locationID,
        chargeDescription,
        statuteCode,
        isConvicted
      });

      if (response.data.success) {
        setCurrentStep("completed");
        setTimeout(() => {
          onSuccess();
          onOpenChange(false);
          toast.success("Arrest successfully registered!");
        }, 1000);
      } else {
        throw new Error(response.data.error || "Registration failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Transaction failed, no data saved");
      setCurrentStep("arrestee");
      toast.error("Transaction failed, no data saved");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLocation = locations.find(l => l.locationID === locationID);
  const selectedCase = openCases.find(c => c.caseID === caseID);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Arrest</DialogTitle>
          <DialogDescription>
            Fill in the details below to register a new arrest. All fields are required.
          </DialogDescription>
        </DialogHeader>

        {/* Step Progress Indicator */}
        {isSubmitting && (
          <div className="flex items-center justify-center gap-2 py-4 border-b">
            <div className={cn(
              "flex items-center gap-2 text-sm",
              currentStep === "arrestee" ? "text-primary font-semibold" : "text-muted-foreground"
            )}>
              {currentStep === "completed" ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : currentStep === "arrestee" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
              <span>Arrestee Added</span>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              currentStep === "charge" ? "text-primary font-semibold" : "text-muted-foreground"
            )}>
              {currentStep === "completed" || currentStep === "case" ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : currentStep === "charge" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span>Charge Recorded</span>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              currentStep === "case" ? "text-primary font-semibold" : "text-muted-foreground"
            )}>
              {currentStep === "completed" ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : currentStep === "case" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span>Case Updated</span>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              currentStep === "completed" ? "text-primary font-semibold" : "text-muted-foreground"
            )}>
              {currentStep === "completed" ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span>Completed!</span>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Processing transaction...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 py-4">
          {/* Person Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="person">Person <span className="text-destructive">*</span></Label>
            <Select value={personID} onValueChange={setPersonID} disabled={isLoadingOptions}>
              <SelectTrigger>
                <SelectValue placeholder="Select a person..." />
              </SelectTrigger>
              <SelectContent>
                {people.map((person) => (
                  <SelectItem key={person.personID} value={person.personID}>
                    {person.firstName} {person.lastName} ({person.personID})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Case Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="case">Case <span className="text-destructive">*</span></Label>
            <Select value={caseID} onValueChange={setCaseID} disabled={isLoadingOptions}>
              <SelectTrigger>
                <SelectValue placeholder="Select an open case..." />
              </SelectTrigger>
              <SelectContent>
                {openCases.map((caseItem) => (
                  <SelectItem key={caseItem.caseID} value={caseItem.caseID}>
                    {caseItem.caseID} {caseItem.incidentID && `(Incident: ${caseItem.incidentID})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Arrest Date */}
          <div className="space-y-2">
            <Label htmlFor="arrestDate">Arrest Date <span className="text-destructive">*</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !arrestDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {arrestDate ? format(arrestDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" side="bottom" align="start">
                <Calendar mode="single" selected={arrestDate} onSelect={(date) => date && setArrestDate(date)} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Location Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="location">Location <span className="text-destructive">*</span></Label>
            <Select value={locationID} onValueChange={setLocationID} disabled={isLoadingOptions}>
              <SelectTrigger>
                <SelectValue placeholder="Select a location..." />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.locationID} value={loc.locationID}>
                    {loc.address || `${loc.city || ''}${loc.city && loc.state ? ', ' : ''}${loc.state || ''}`.trim() || loc.locationID}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Charge Description */}
          <div className="space-y-2">
            <Label htmlFor="chargeDescription">Charge Description <span className="text-destructive">*</span></Label>
            <Textarea
              id="chargeDescription"
              placeholder="Enter charge description..."
              value={chargeDescription}
              onChange={(e) => setChargeDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Statute Code */}
          <div className="space-y-2">
            <Label htmlFor="statuteCode">Statute Code <span className="text-destructive">*</span></Label>
            <Input
              id="statuteCode"
              placeholder="Enter statute code..."
              value={statuteCode}
              onChange={(e) => setStatuteCode(e.target.value)}
            />
          </div>

          {/* Convicted Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isConvicted"
              checked={isConvicted}
              onCheckedChange={(checked) => setIsConvicted(checked === true)}
            />
            <Label htmlFor="isConvicted" className="cursor-pointer">
              Convicted?
            </Label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isLoadingOptions}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

