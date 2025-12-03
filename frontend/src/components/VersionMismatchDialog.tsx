import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, X } from "lucide-react";

interface VersionMismatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientVersion: number;
  serverVersion: number;
  onReload: () => void;
  onCancel: () => void;
}

export function VersionMismatchDialog({
  open,
  onOpenChange,
  clientVersion,
  serverVersion,
  onReload,
  onCancel,
}: VersionMismatchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Version Conflict Detected
              </DialogTitle>
              <DialogDescription className="mt-1">
                This case has been modified by another user.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-3 rounded-lg border border-yellow-200 bg-yellow-50/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Your version:</span>
              <span className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-gray-900">
                v{clientVersion}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Latest version:</span>
              <span className="rounded-md bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                v{serverVersion}
              </span>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Your changes cannot be saved because another user has already updated this case.
            Please reload the latest version to see the current data.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onCancel();
              onOpenChange(false);
            }}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={() => {
              onReload();
              onOpenChange(false);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Latest Version
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

