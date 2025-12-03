import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Lock } from "lucide-react";

interface ReadOnlyAccessDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userRole?: string;
}

export function ReadOnlyAccessDialog({
    open,
    onOpenChange,
    userRole = "Analyst",
}: ReadOnlyAccessDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                            <Lock className="h-8 w-8 text-orange-600" strokeWidth={2} />
                        </div>
                    </div>
                    <DialogTitle className="text-2xl font-bold text-[#0b2c75]">
                        Read-Only Access
                    </DialogTitle>
                    <DialogDescription className="text-base mt-4 space-y-2">
                        <p>
                            As an <span className="font-semibold text-orange-600">{userRole}</span>, you have view-only access to this data. You cannot create, edit, or delete records.
                        </p>
                        <p className="text-sm text-muted-foreground mt-3">
                            Contact an administrator for full access permissions.
                        </p>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}




