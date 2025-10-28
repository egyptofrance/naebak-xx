import { cn } from "@/utils/cn";
import { Suspense, type ReactNode } from "react";
import { SidebarTrigger } from "../ui/sidebar";
import { PendingInvitationCounter } from "./PendingInvitationCounter";
import { LanguageSwitcher } from "./LanguageSwitcher";
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
        <SidebarTrigger />
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/images/logo-naebak-white.png"
            alt="نائبك"
            width={200}
            height={67}
            className="h-12 md:h-14 w-auto object-contain"
            priority
          />
        </Link>
        
        <Suspense>{children}</Suspense>
        <div className="relative w-max flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <PendingInvitationCounter />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
