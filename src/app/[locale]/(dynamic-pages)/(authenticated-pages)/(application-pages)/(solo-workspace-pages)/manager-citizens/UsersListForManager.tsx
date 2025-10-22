"use client";

import { Button } from "@/components/ui/button";
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
import { Mail } from "lucide-react";
import { Suspense } from "react";
import { ConfirmSendLoginLinkDialog } from "@/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/users/ConfirmSendLoginLinkDialog";
import { GetLoginLinkDialog } from "@/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/users/GetLoginLinkDialog";
import { PromoteToDeputyDialog } from "@/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/users/PromoteToDeputyDialog";
import { PromoteToManagerButton } from "@/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/users/PromoteToManagerButton";
import { EditUserDialog } from "@/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/users/EditUserDialog";

type User = {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  user_application_settings?: {
    email_readonly: string;
  } | null;
};

export function UsersListForManager({ users }: { users: User[] }) {
  return (
    <div className="space-y-2 border overflow-x-auto">
      <ShadcnTable>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contact User</TableHead>
            <TableHead>Send Login Link</TableHead>
            <TableHead>Get Login Link</TableHead>
            <TableHead>Promote to Deputy</TableHead>
            <TableHead>Promote to Manager</TableHead>
            <TableHead>Edit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const email = user.user_application_settings?.email_readonly ?? "-";

            return (
              <TableRow key={user.id}>
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
              </TableRow>
            );
          })}
        </TableBody>
      </ShadcnTable>
    </div>
  );
}

