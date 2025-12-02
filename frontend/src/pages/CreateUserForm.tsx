import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { usersAPI } from "@/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CreateUserForm() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"admin" | "officer" | "analyst" | "clerk">("officer");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const navigate = useNavigate();

    const validateField = (fieldName: string, value: string): string => {
        switch (fieldName) {
            case "firstName":
                return !value.trim() ? "This field is required" : "";
            case "lastName":
                return !value.trim() ? "This field is required" : "";
            case "email":
                if (!value.trim()) return "This field is required";
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return "Please enter a valid email address";
                return "";
            default:
                return "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields
        const errors: Record<string, string> = {};
        errors.firstName = validateField("firstName", firstName);
        errors.lastName = validateField("lastName", lastName);
        errors.email = validateField("email", email);

        const hasErrors = Object.values(errors).some((error) => error !== "");
        if (hasErrors) {
            setFieldErrors(errors);
            toast.error("Please fill in all required fields correctly");
            return;
        }

        setIsSubmitting(true);
        setFieldErrors({});

        try {
            const response = await usersAPI.create({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                role,
            });

            if (response.emailSent) {
                toast.success(
                    `User created successfully! Temporary password has been sent to ${email}`
                );
            } else {
                toast.warning(
                    `User created but email notification failed. Please contact the user manually.`
                );
            }

            navigate("/admin/users");
        } catch (error: any) {
            const errorMsg =
                error.response?.data?.message || "Failed to create user. Please try again.";
            toast.error(errorMsg);

            // Set field-specific errors if available
            if (error.response?.data?.field) {
                setFieldErrors({ [error.response.data.field]: errorMsg });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBlur = (fieldName: string, value: string) => {
        const error = validateField(fieldName, value);
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

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin/users")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
                    <p className="text-muted-foreground">
                        Add a new user to the system. A temporary password will be sent via email.
                    </p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>
                        Fill in the details below. The user will receive a temporary password via
                        email.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">
                                    First Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => {
                                        setFirstName(e.target.value);
                                        if (fieldErrors.firstName) {
                                            handleBlur("firstName", e.target.value);
                                        }
                                    }}
                                    onBlur={(e) => handleBlur("firstName", e.target.value)}
                                    className={cn(
                                        fieldErrors.firstName &&
                                            "border-destructive focus:border-destructive focus:ring-destructive"
                                    )}
                                    placeholder="John"
                                />
                                {fieldErrors.firstName && (
                                    <p className="text-sm text-destructive">{fieldErrors.firstName}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName">
                                    Last Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => {
                                        setLastName(e.target.value);
                                        if (fieldErrors.lastName) {
                                            handleBlur("lastName", e.target.value);
                                        }
                                    }}
                                    onBlur={(e) => handleBlur("lastName", e.target.value)}
                                    className={cn(
                                        fieldErrors.lastName &&
                                            "border-destructive focus:border-destructive focus:ring-destructive"
                                    )}
                                    placeholder="Doe"
                                />
                                {fieldErrors.lastName && (
                                    <p className="text-sm text-destructive">{fieldErrors.lastName}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (fieldErrors.email) {
                                        handleBlur("email", e.target.value);
                                    }
                                }}
                                onBlur={(e) => handleBlur("email", e.target.value)}
                                className={cn(
                                    fieldErrors.email &&
                                        "border-destructive focus:border-destructive focus:ring-destructive"
                                )}
                                placeholder="john.doe@example.com"
                            />
                            {fieldErrors.email && (
                                <p className="text-sm text-destructive">{fieldErrors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">
                                Role <span className="text-destructive">*</span>
                            </Label>
                            <Select value={role} onValueChange={(value: any) => setRole(value)}>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="officer">Officer</SelectItem>
                                    <SelectItem value="analyst">Analyst</SelectItem>
                                    <SelectItem value="clerk">Clerk</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">
                                Admin: Full access | Officer: Case/Arrest/Evidence access | Analyst:
                                Dashboard only | Clerk: Limited access
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/admin/users")}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create User"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

