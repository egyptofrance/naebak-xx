"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deletePartyAction,
  togglePartyActiveAction,
  updatePartyOrderAction,
} from "@/data/admin/party";
import { ArrowDown, ArrowUp, Edit, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { EditPartyDialog } from "./EditPartyDialog";

type Party = {
  id: string;
  name_ar: string;
  name_en: string | null;
  abbreviation: string | null;
  display_order: number | null;
  is_active: boolean | null;
};

export function PartiesList({ parties }: { parties: Party[] }) {
  const [localParties, setLocalParties] = useState(parties);
  const toastRef = useRef<string | number | undefined>(undefined);

  const { execute: updateOrder } = useAction(updatePartyOrderAction, {
    onSuccess: () => {
      toast.success("تم تحديث الترتيب بنجاح");
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "فشل تحديث الترتيب");
      // Reload to revert changes
      window.location.reload();
    },
  });

  const { execute: deleteParty } = useAction(deletePartyAction, {
    onExecute: () => {
      toastRef.current = toast.loading("جاري الحذف...");
    },
    onSuccess: () => {
      toast.success("تم حذف الحزب بنجاح", {
        id: toastRef.current,
      });
      toastRef.current = undefined;
      window.location.reload();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "فشل حذف الحزب", {
        id: toastRef.current,
      });
      toastRef.current = undefined;
    },
  });

  const { execute: toggleActive } = useAction(togglePartyActiveAction, {
    onSuccess: () => {
      toast.success("تم تحديث حالة الحزب");
      window.location.reload();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "فشل تحديث حالة الحزب");
    },
  });

  const moveUp = (index: number) => {
    if (index === 0) return;

    const newParties = [...localParties];
    const temp = newParties[index];
    newParties[index] = newParties[index - 1];
    newParties[index - 1] = temp;

    // Update display_order
    newParties[index].display_order = index + 1;
    newParties[index - 1].display_order = index;

    setLocalParties(newParties);

    // Update in database
    updateOrder({ id: newParties[index].id, newOrder: index + 1 });
    updateOrder({ id: newParties[index - 1].id, newOrder: index });
  };

  const moveDown = (index: number) => {
    if (index === localParties.length - 1) return;

    const newParties = [...localParties];
    const temp = newParties[index];
    newParties[index] = newParties[index + 1];
    newParties[index + 1] = temp;

    // Update display_order
    newParties[index].display_order = index + 1;
    newParties[index + 1].display_order = index + 2;

    setLocalParties(newParties);

    // Update in database
    updateOrder({ id: newParties[index].id, newOrder: index + 1 });
    updateOrder({ id: newParties[index + 1].id, newOrder: index + 2 });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">الترتيب</TableHead>
            <TableHead>الاسم بالعربية</TableHead>
            <TableHead>الاسم بالإنجليزية</TableHead>
            <TableHead>الاختصار</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-center">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localParties.map((party, index) => (
            <TableRow key={party.id}>
              <TableCell className="font-medium">
                {party.display_order ?? "-"}
              </TableCell>
              <TableCell>{party.name_ar}</TableCell>
              <TableCell>{party.name_en || "-"}</TableCell>
              <TableCell>{party.abbreviation || "-"}</TableCell>
              <TableCell>
                <Button
                  variant={party.is_active ?? false ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    toggleActive({ id: party.id, isActive: !party.is_active })
                  }
                >
                  {party.is_active ?? false ? "نشط" : "غير نشط"}
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveDown(index)}
                    disabled={index === localParties.length - 1}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <EditPartyDialog party={party}>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </EditPartyDialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (
                        confirm(`هل أنت متأكد من حذف ${party.name_ar}؟`)
                      ) {
                        deleteParty({ id: party.id });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

