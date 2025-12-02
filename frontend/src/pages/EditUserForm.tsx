import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import type { User } from "@/types";

export default function EditUserForm() {
    const { id } = useParams<{ id: string }>();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"admin" | "officer" | "analyst" | "clerk">("officer");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            fetchUser();
        }
    }, [id]);

    const fetchUser = async () => {
        try {
            setIsLoading(true);
            const users = await usersAPI.getAll();
            const user = users.find((u: User) => u.id.toString() === id);
            
            if (!user) {
                toast.error("User not found");
                navigate("/admin/users");
                return;
            }

            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
            setEmail(user.email || "");
            setRole(user.role || "officer");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to fetch user");
            navigate("/admin/users");
        } finally {
            setIsLoading(false);
        }
    };

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

        if (!id) {
            toast.error("User ID is missing");
            return;
        }

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
            await usersAPI.update(id, {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                role,
            });

            toast.success("User updated successfully!");
            navigate("/admin/users");
        } catch (error: any) {
            const errorMsg =
                error.response?.data?.message || "Failed to update user. Please try again.";
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">Loading user...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin/users")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
                    <p className="text-muted-foreground">Update user information and role.</p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>Update the user's details below.</CardDescription>
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
                                        Updating...
                                    </>
                                ) : (
                                    "Update User"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

