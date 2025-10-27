import { cn } from "@/utils/cn";
import { Suspense, type ReactNode } from "react";
import { SidebarTrigger } from "../ui/sidebar";
import { PendingInvitationCounter } from "./PendingInvitationCounter";
import { LanguageSwitcher } from "./LanguageSwitcher";
import Link from "next/link";
import Image from "next/image";
import { VisitorCounter } from "@/components/VisitorCounter";

export async function InternalNavbar({ children }: { children: ReactNode }) {
  return (
    <header className="sticky top-0 w-full z-10 backdrop-blur-sm bg-background ">
      <div
        className={cn(
          "h-full  text-sm font-medium flex gap-2 mx-auto pl-6 pr-6 border-b dark:border-gray-700/50 py-3 w-full justify-between items-center",
        )}
      >
        <SidebarTrigger />
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/images/logo-naebak-green.png"
            alt="نائبك"
            width={120}
            height={40}
            className="h-8 w-auto dark:hidden"
            priority
          />
          <Image
            src="/images/logo-naebak-white.png"
            alt="نائبك"
            width={120}
            height={40}
            className="h-8 w-auto hidden dark:block"
            priority
          />
        </Link>
        
        <Suspense>{children}</Suspense>
        <VisitorCounter />
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
