"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "@/components/intl-link";
import { T } from "@/components/ui/Typography";
import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteMultipleUsersAction } from "@/data/admin/user";
import { format } from "date-fns";
import { Mail, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { Suspense, useRef, useState } from "react";
import { toast } from "sonner";
import { ConfirmSendLoginLinkDialog } from "./ConfirmSendLoginLinkDialog";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { GetLoginLinkDialog } from "./GetLoginLinkDialog";
import { PromoteToDeputyDialog } from "./PromoteToDeputyDialog";
import { PromoteToManagerButton } from "./PromoteToManagerButton";
import { EditUserDialog } from "./EditUserDialog";

type User = {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  user_application_settings?: {
    email_readonly: string;
  } | null;
};

export function UsersListWithBulkDelete({ users }: { users: User[] }) {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const toastRef = useRef<string | number | undefined>(undefined);

  const { execute: deleteMultipleUsers, isPending: isDeleting } = useAction(
    deleteMultipleUsersAction,
    {
      onExecute: () => {
        toastRef.current = toast.loading(
          `Deleting ${selectedUsers.size} users...`,
        );
      },
      onSuccess: ({ data }) => {
        toast.success(data?.message ?? "Users deleted successfully!", {
          id: toastRef.current,
        });
        toastRef.current = undefined;
        setSelectedUsers(new Set());
        setShowDeleteDialog(false);
        // Refresh the page to show updated list
        window.location.reload();
      },
      onError: ({ error }) => {
        const errorMessage = error.serverError ?? "Failed to delete users";
        toast.error(errorMessage, {
          id: toastRef.current,
        });
        toastRef.current = undefined;
      },
    },
  );

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    }
  };

  const handleBulkDelete = () => {
    deleteMultipleUsers({ userIds: Array.from(selectedUsers) });
  };

  return (
    <>
      {selectedUsers.size > 0 && (
        <div className="mb-4 p-4 bg-muted rounded-lg flex items-center justify-between">
          <T.P className="font-medium">
            {selectedUsers.size} user{selectedUsers.size > 1 ? "s" : ""}{" "}
            selected
          </T.P>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      <div className="space-y-2 border overflow-x-auto">
        <ShadcnTable>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    users.length > 0 && selectedUsers.size === users.length
                  }
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contact User</TableHead>
              <TableHead>Send Login Link</TableHead>
              <TableHead>Get Login Link</TableHead>
              <TableHead>Promote to Deputy</TableHead>
              <TableHead>Promote to Manager</TableHead>
              <TableHead>Edit</TableHead>
              <TableHead>Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const email = user.user_application_settings?.email_readonly ?? "-";

              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.has(user.id)}
                      onCheckedChange={() => toggleUser(user.id)}
                    />
                  </TableCell>
                  <TableCell> {user.full_name ?? "-"} </TableCell>
                  <TableCell>
                    <Link href={`/app_admin/users/${user.id}`}>{email}</Link>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center space-x-4">
                      <a
                        title="Contact User by email"
                        className="flex items-center "
                        href={`mailto:${email}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Mail className="h-5 w-5 mr-2 " />{" "}
                        <T.Small className=" font-medium underline underline-offset-4 ">
                          Contact User by email
                        </T.Small>
                      </a>
                    </span>
                  </TableCell>

                  <TableCell>
                    <Suspense>
                      <ConfirmSendLoginLinkDialog userEmail={email} />
                    </Suspense>
                  </TableCell>
                  <TableCell>
                    <Suspense>
                      <GetLoginLinkDialog userId={user.id} />
                    </Suspense>
                  </TableCell>
                  <TableCell>
                    <PromoteToDeputyDialog
                      userId={user.id}
                      userName={user.full_name ?? email}
                    />
                  </TableCell>
                  <TableCell>
                    <PromoteToManagerButton
                      userId={user.id}
                      userName={user.full_name ?? email}
                    />
                  </TableCell>
                  <TableCell>
                    <EditUserDialog
                      userId={user.id}
                      currentFullName={user.full_name}
                      currentPhone={user.phone}
                    />
                  </TableCell>
                  <TableCell>
                    <DeleteUserDialog userId={user.id} userEmail={email} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </ShadcnTable>
      </div>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="space-y-3">
            <div className="mx-auto p-3 w-fit bg-destructive/10 rounded-lg">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <div className="text-center space-y-2">
              <DialogTitle className="text-lg">Delete Multiple Users</DialogTitle>
              <DialogDescription className="text-base">
                Are you sure you want to delete <strong>{selectedUsers.size}</strong>{" "}
                user{selectedUsers.size > 1 ? "s" : ""}?
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
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1 min-w-[120px]"
              disabled={isDeleting}
              onClick={handleBulkDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

