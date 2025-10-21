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
  deleteCouncilAction,
  toggleCouncilActiveAction,
  updateCouncilOrderAction,
} from "@/data/admin/council";
import { ArrowDown, ArrowUp, Edit, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { EditCouncilDialog } from "./EditCouncilDialog";
import type { Council } from "./types";

export function CouncilsList({ councils }: { councils: Council[] }) {
  const [localCouncils, setLocalCouncils] = useState(councils);
  const toastRef = useRef<string | number | undefined>(undefined);

  const { execute: updateOrder } = useAction(updateCouncilOrderAction, {
    onSuccess: () => {
      toast.success("تم تحديث الترتيب بنجاح");
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "فشل تحديث الترتيب");
      // Reload to revert changes
      window.location.reload();
    },
  });

  const { execute: deleteCouncil } = useAction(deleteCouncilAction, {
    onExecute: () => {
      toastRef.current = toast.loading("جاري الحذف...");
    },
    onSuccess: () => {
      toast.success("تم حذف المجلس بنجاح", {
        id: toastRef.current,
      });
      toastRef.current = undefined;
      window.location.reload();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "فشل حذف المجلس", {
        id: toastRef.current,
      });
      toastRef.current = undefined;
    },
  });

  const { execute: toggleActive } = useAction(toggleCouncilActiveAction, {
    onSuccess: () => {
      toast.success("تم تحديث حالة المجلس");
      window.location.reload();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "فشل تحديث حالة المجلس");
    },
  });

  const moveUp = (index: number) => {
    if (index === 0) return;

    const newCouncils = [...localCouncils];
    const temp = newCouncils[index];
    newCouncils[index] = newCouncils[index - 1];
    newCouncils[index - 1] = temp;

    // Update display_order
    newCouncils[index].display_order = index;
    newCouncils[index - 1].display_order = index - 1;

    setLocalCouncils(newCouncils);

    // Update in database
    updateOrder({ id: newCouncils[index].id, newOrder: index });
    updateOrder({ id: newCouncils[index - 1].id, newOrder: index - 1 });
  };

  const moveDown = (index: number) => {
    if (index === localCouncils.length - 1) return;

    const newCouncils = [...localCouncils];
    const temp = newCouncils[index];
    newCouncils[index] = newCouncils[index + 1];
    newCouncils[index + 1] = temp;

    // Update display_order
    newCouncils[index].display_order = index;
    newCouncils[index + 1].display_order = index + 1;

    setLocalCouncils(newCouncils);

    // Update in database
    updateOrder({ id: newCouncils[index].id, newOrder: index });
    updateOrder({ id: newCouncils[index + 1].id, newOrder: index + 1 });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">الترتيب</TableHead>
            <TableHead>الاسم بالعربية</TableHead>
            <TableHead>الاسم بالإنجليزية</TableHead>
            <TableHead>الكود</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-center">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localCouncils.map((council, index) => (
            <TableRow key={council.id}>
              <TableCell className="font-medium">
                {council.display_order ?? "-"}
              </TableCell>
              <TableCell>{council.name_ar}</TableCell>
              <TableCell>{council.name_en || "-"}</TableCell>
              <TableCell>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {council.code}
                </code>
              </TableCell>
              <TableCell>
                <Button
                  variant={council.is_active ?? false ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    toggleActive({ id: council.id, isActive: !council.is_active })
                  }
                >
                  {council.is_active ?? false ? "نشط" : "غير نشط"}
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
                    disabled={index === localCouncils.length - 1}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <EditCouncilDialog council={council}>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </EditCouncilDialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (
                        confirm(`هل أنت متأكد من حذف ${council.name_ar}؟`)
                      ) {
                        deleteCouncil({ id: council.id });
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

