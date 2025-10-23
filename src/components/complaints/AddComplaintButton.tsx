"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export function AddComplaintButton() {
  return (
    <Button asChild className="gap-2" size="lg">
      <Link href="/complaints/new">
        <Plus className="h-5 w-5" />
        إضافة شكوى جديدة
      </Link>
    </Button>
  );
}

