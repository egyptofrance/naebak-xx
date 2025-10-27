import { Link } from "@/components/intl-link";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

/**
 * رابط النواب في الهيدر
 * يظهر لجميع المستخدمين (مواطنين، نواب، إدارة)
 */
export function DeputiesHeaderLink() {
  return (
    <Button variant="ghost" size="sm" asChild>
      <Link href="/deputies" className="gap-2">
        <Users className="h-4 w-4" />
        <span className="hidden md:inline">النواب</span>
      </Link>
    </Button>
  );
}
