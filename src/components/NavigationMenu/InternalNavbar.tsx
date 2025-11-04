import { cn } from "@/utils/cn";
import { Suspense, type ReactNode } from "react";
import { SidebarTrigger } from "../ui/sidebar";
import { Home } from "lucide-react";
import { Button } from "../ui/button";
import { PendingInvitationCounter } from "./PendingInvitationCounter";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { RefreshButton } from "./RefreshButton";
import Link from "next/link";
import Image from "next/image";


export async function InternalNavbar({ children }: { children: ReactNode }) {
  return (
    <header className="sticky top-0 w-full z-10 bg-green-900 text-white shadow-lg">
      <div
        className={cn(
          "h-full  text-sm font-medium flex gap-2 mx-auto pl-6 pr-6 border-b border-white/10 py-3 w-full justify-between items-center",
        )}
      >
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="size-10 text-white hover:bg-white/10 rounded-lg"
              aria-label="العودة للصفحة الرئيسية"
            >
              <Home className="size-5" />
            </Button>
          </Link>

        </div>
        
        {/* Logo */}
        <Link href="/" className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/images/logo-naebak-white.png"
            alt="نائبك"
            width={200}
            height={67}
            className="h-12 md:h-14 w-auto object-contain"
            priority
          />
        </Link>
        
        {/* Right side - empty for now */}
        <div className="w-10"></div>
      </div>
    </header>
  );
}
