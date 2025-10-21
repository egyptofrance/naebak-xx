"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteUserAction } from "@/data/admin/user";
import { Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";
import { toast } from "sonner";

export const DeleteUserDialog = ({
  userId,
  userEmail,
  onSuccess,
}: {
  userId: string;
  userEmail: string;
  onSuccess?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const toastRef = useRef<string | number | undefined>(undefined);

  const { execute: deleteUser, isPending: isDeleting } = useAction(
    deleteUserAction,
    {
      onExecute: () => {
        toastRef.current = toast.loading("Deleting user...");
      },
      onSuccess: () => {
        toast.success("User deleted successfully!", {
          id: toastRef.current,
        });
        toastRef.current = undefined;
        setOpen(false);
        onSuccess?.();
      },
      onError: ({ error }) => {
        const errorMessage = error.serverError ?? "Failed to delete user";
        toast.error(errorMessage, {
          id: toastRef.current,
        });
        toastRef.current = undefined;
      },
    },
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isDeleting}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-3">
          <div className="mx-auto p-3 w-fit bg-destructive/10 rounded-lg">
            <Trash2 className="w-6 h-6 text-destructive" />
          </div>
          <div className="text-center space-y-2">
            <DialogTitle className="text-lg">Delete User</DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to delete <strong>{userEmail}</strong>?
              <br />
              This action cannot be undone.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 min-w-[120px]"
            disabled={isDeleting}
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="flex-1 min-w-[120px]"
            disabled={isDeleting}
            onClick={() => {
              deleteUser({ userId });
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

