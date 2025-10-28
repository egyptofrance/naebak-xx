import LocaleSwitcher from "@/components/LocaleSwitcher";
import { ThemeSwitch } from "@/components/theme-switch";
import { Suspense } from "react";
import { LeftNav } from "./LeftNav";
import { LoginCTAButton } from "./LoginCTAButton";
import { MobileMenu } from "./MobileMenu";
import { MobileMenuProvider } from "./MobileMenuContext";
import { MobileMenuOpen } from "./MobileMenuOpen";
import { VisitorCounter } from "@/components/VisitorCounter";
import { NavbarLogo } from "./NavbarLogo";

export function ExternalNavigation() {
  return (
    <MobileMenuProvider>
      <header className="sticky inset-x-0 w-full top-0 z-50 border-b bg-green-900 text-white shadow-lg">
        <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30">
          <nav
            className="flex items-center w-full min-w-max h-[54px] md:container md:mx-auto justify-between px-4 md:px-8"
            aria-label="Global"
          >
          {/* Left: Visitor Counter */}
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-shrink">
            <VisitorCounter />
            <NavbarLogo />
          </div>
          
          {/* Right: Menu + Actions */}
          <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
            <LeftNav />
            <Suspense
              fallback={
                <div className="flex space-x-10 items-center lg:-mr-2"></div>
              }
            >
              <div className="flex space-x-3 items-center lg:-mr-2">
                <LocaleSwitcher />
                <ThemeSwitch />
                <div className="ml-6 hidden lg:block" suppressHydrationWarning>
                  <LoginCTAButton />
                </div>
              </div>
            </Suspense>
            <MobileMenuOpen />
          </div>
          </nav>
        </div>
        <MobileMenu />
      </header>
    </MobileMenuProvider>
  );
}

