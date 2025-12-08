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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { authAPI } from "@/api.ts";
import { toast } from "sonner";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { user, updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dobOpen, setDobOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [mfaUrl, setMfaUrl] = useState<string | null>(null);
  const [mfaOtp, setMfaOtp] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: undefined as Date | undefined,
    bloodGroup: "",
    password: "",
    confirmPassword: "",
  });

  // Initialize form data when user changes or modal opens
  useEffect(() => {
    if (user && open) {
      // Parse dateOfBirth if it exists
      let dob: Date | undefined = undefined;
      if (user.dateOfBirth) {
        if (typeof user.dateOfBirth === 'string') {
          dob = new Date(user.dateOfBirth);
        } else if (user.dateOfBirth instanceof Date) {
          dob = user.dateOfBirth;
        }
      }
      
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        dateOfBirth: dob,
        bloodGroup: user.bloodGroup || "",
        password: "",
        confirmPassword: "",
      });
      setHasChanges(false);
      setError(null);
      setMfaSecret(null);
      setMfaUrl(null);
      setMfaOtp("");
      setMfaLoading(false);
    }
  }, [user, open]);

  // Track changes
  useEffect(() => {
    if (!user) return;
    
    // Compare dateOfBirth
    const userDob = user.dateOfBirth 
      ? (typeof user.dateOfBirth === 'string' ? new Date(user.dateOfBirth) : user.dateOfBirth)
      : undefined;
    const dobChanged = formData.dateOfBirth?.getTime() !== userDob?.getTime();
    
    const changed = 
      formData.firstName !== (user.firstName || "") ||
      formData.lastName !== (user.lastName || "") ||
      formData.bloodGroup !== (user.bloodGroup || "") ||
      dobChanged ||
      formData.password !== "";

    setHasChanges(changed);
  }, [formData, user]);

  const handleChange = (field: string, value: string | Date | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate date of birth - user must be at least 22 years old
    if (formData.dateOfBirth) {
      const today = new Date();
      const dob = new Date(formData.dateOfBirth);
      
      // Check if date is in the future (shouldn't happen but double-check)
      if (dob > today) {
        setError("Date of birth cannot be in the future");
        return;
      }
      
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const dayDiff = today.getDate() - dob.getDate();
      
      // Calculate exact age
      const exactAge = age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
      
      if (exactAge < 22) {
        setError("You must be at least 22 years old");
        return;
      }
    }
    
    // Validate password if provided
    if (formData.password) {
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const updateData: any = {
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        dateOfBirth: formData.dateOfBirth ? format(formData.dateOfBirth, 'yyyy-MM-dd') : undefined,
        bloodGroup: formData.bloodGroup || undefined,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await authAPI.updateProfile(updateData);
      const updatedUser = response.user;
      
      // If password was changed, temporaryPassword should now be false
      if (formData.password && user.temporaryPassword) {
        updatedUser.temporaryPassword = false;
      }
      
      // Update auth context
      updateUser(updatedUser);
      
      // Update localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      toast.success(formData.password && user.temporaryPassword 
        ? "Password changed successfully! Your account is now active." 
        : "Profile updated successfully!");
      onOpenChange(false);
      
      // Reset form
      const updatedDob = updatedUser.dateOfBirth 
        ? (typeof updatedUser.dateOfBirth === 'string' ? new Date(updatedUser.dateOfBirth) : updatedUser.dateOfBirth)
        : undefined;
      
      setFormData({
        firstName: updatedUser.firstName || "",
        lastName: updatedUser.lastName || "",
        dateOfBirth: updatedDob,
        bloodGroup: updatedUser.bloodGroup || "",
        password: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startMfaSetup = async () => {
    try {
      setMfaLoading(true);
      const data = await authAPI.mfaSetup();
      setMfaSecret(data.base32);
      setMfaUrl(data.otpauthUrl);
      toast.success("MFA secret generated. Scan the QR or enter the code, then verify.");
    } catch (err: any) {
      console.error("MFA setup error:", err);
      toast.error(err?.response?.data?.message || "Failed to start MFA setup");
    } finally {
      setMfaLoading(false);
    }
  };

  const verifyMfa = async () => {
    if (!mfaOtp) {
      toast.error("Enter the 6-digit code from your authenticator app.");
      return;
    }
    try {
      setMfaLoading(true);
      await authAPI.mfaVerify(mfaOtp);
      const updatedUser = { ...user, mfaEnabled: true };
      updateUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("MFA enabled. Use OTP at login.");
      setMfaOtp("");
    } catch (err: any) {
      console.error("MFA verify error:", err);
      toast.error(err?.response?.data?.message || "Failed to verify MFA");
    } finally {
      setMfaLoading(false);
    }
  };

  const disableMfa = async () => {
    try {
      setMfaLoading(true);
      await authAPI.mfaDisable();
      const updatedUser = { ...user, mfaEnabled: false, mfaSecret: undefined as any };
      updateUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setMfaSecret(null);
      setMfaUrl(null);
      setMfaOtp("");
      toast.success("MFA disabled.");
    } catch (err: any) {
      console.error("MFA disable error:", err);
      toast.error(err?.response?.data?.message || "Failed to disable MFA");
    } finally {
      setMfaLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Update your profile information. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="First name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Last name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Popover open={dobOpen} onOpenChange={setDobOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dateOfBirth && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dateOfBirth ? (
                        format(formData.dateOfBirth, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dateOfBirth}
                      onSelect={(date) => {
                        if (date) {
                          const today = new Date();
                          today.setHours(23, 59, 59, 999); // End of today
                          const dob = new Date(date);
                          dob.setHours(0, 0, 0, 0); // Start of selected date
                          
                          // Check if date is in the future
                          if (dob > today) {
                            setError("Date of birth cannot be in the future");
                            return;
                          }
                          
                          // Check if user is at least 22 years old
                          const age = today.getFullYear() - dob.getFullYear();
                          const monthDiff = today.getMonth() - dob.getMonth();
                          const dayDiff = today.getDate() - dob.getDate();
                          const exactAge = age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
                          
                          if (exactAge < 22) {
                            setError("You must be at least 22 years old");
                            return;
                          }
                        }
                        setError(null); // Clear error on valid selection
                        handleChange("dateOfBirth", date);
                        setDobOpen(false);
                      }}
                      maxDate={(() => {
                        // Maximum date is 22 years ago (user must be at least 22)
                        const today = new Date();
                        const maxDate = new Date(today);
                        maxDate.setFullYear(today.getFullYear() - 22);
                        return maxDate;
                      })()}
                      minDate={(() => {
                        // Minimum date is 100 years ago from today
                        const today = new Date();
                        const minDate = new Date(today);
                        minDate.setFullYear(today.getFullYear() - 100);
                        return minDate;
                      })()}
                      disableFutureNavigation={true}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select
                  value={formData.bloodGroup}
                  onValueChange={(value) => handleChange("bloodGroup", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password (leave blank to keep current)</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {formData.password && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3 rounded-md border border-muted p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Multi-Factor Authentication (TOTP)</p>
                  <p className="text-xs text-muted-foreground">
                    Protect your account with an authenticator app (Google Authenticator, Authy, etc.).
                  </p>
                </div>
                <span className={`text-xs font-semibold ${user.mfaEnabled ? "text-green-600" : "text-orange-600"}`}>
                  {user.mfaEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>

              {!user.mfaEnabled && (
                <div className="space-y-3">
                  <Button type="button" variant="outline" disabled={mfaLoading} onClick={startMfaSetup}>
                    {mfaLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mfaSecret ? "Regenerate Secret" : "Enable MFA"}
                  </Button>

                  {mfaSecret && (
                    <div className="space-y-3 rounded-md bg-muted/50 p-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Step 1: Add this account to your authenticator</p>
                        <p className="text-xs text-muted-foreground break-all">Secret: {mfaSecret}</p>
                        {mfaUrl && (
                          <div className="flex flex-col items-start gap-2">
                            <p className="text-xs text-muted-foreground">Scan the QR below:</p>
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(mfaUrl)}&size=180x180`}
                              alt="MFA QR"
                              className="rounded border bg-white"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mfaOtp">Step 2: Enter the 6-digit code from your app</Label>
                        <Input
                          id="mfaOtp"
                          value={mfaOtp}
                          onChange={(e) => setMfaOtp(e.target.value)}
                          placeholder="123456"
                          maxLength={6}
                          inputMode="numeric"
                        />
                        <Button type="button" onClick={verifyMfa} disabled={mfaLoading}>
                          {mfaLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Verify & Enable
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {user.mfaEnabled && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    MFA is active. Use your authenticator code when logging in.
                  </p>
                  <Button type="button" variant="outline" onClick={disableMfa} disabled={mfaLoading}>
                    {mfaLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Disable MFA
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !hasChanges}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

