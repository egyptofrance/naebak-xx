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
        <nav
          className="flex items-center w-full h-[54px] md:container md:mx-auto justify-between px-6 md:px-8"
          aria-label="Global"
        >
          {/* Left: Visitor Counter */}
          <div className="flex items-center gap-4">
            <VisitorCounter />
            <NavbarLogo />
          </div>
          
          {/* Right: Menu + Actions */}
          <div className="flex items-center gap-5">
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
        <MobileMenu />
      </header>
    </MobileMenuProvider>
  );
}

