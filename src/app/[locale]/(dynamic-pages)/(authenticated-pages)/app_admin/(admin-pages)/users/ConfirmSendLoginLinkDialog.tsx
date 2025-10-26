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
import { sendLoginLinkAction } from "@/data/admin/user";
import { Send } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";
import { toast } from "sonner";

export const ConfirmSendLoginLinkDialog = ({
  userEmail,
}: {
  userEmail: string;
}) => {
  const [open, setOpen] = useState(false);
  const toastRef = useRef<string | number | undefined>(undefined);

  const { execute: sendLoginLink, isPending: isSending } = useAction(
    sendLoginLinkAction,
    {
      onExecute: () => {
        toastRef.current = toast.loading("Sending login link...");
      },
      onSuccess: () => {
        toast.success("Login link sent!", {
          id: toastRef.current,
        });
        toastRef.current = undefined;
        setOpen(false);
      },
      onError: ({ error }) => {
        const errorMessage = error.serverError ?? "Failed to send login link";
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
        <Button variant="ghost" size="icon" aria-disabled={isSending} title="Send login link">
          <Send className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-3">
          <div className="mx-auto p-3 w-fit bg-gray-200/50 dark:bg-gray-700/40 rounded-lg">
            <Send className="w-6 h-6" />
          </div>
          <div className="text-center space-y-2">
            <DialogTitle className="text-lg">Send Login Link</DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to send a login link to the user?
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 min-w-[120px]"
            disabled={isSending}
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            className="flex-1 min-w-[120px]"
            disabled={isSending}
            onClick={() => {
              sendLoginLink({ email: userEmail });
            }}
          >
            {isSending ? "Sending..." : "Send Login Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
