import { getCachedUserProfile } from "@/rsc-data/user/user";
import { getUserAvatarUrl } from "@/utils/helpers";
import { serverGetLoggedInUserVerified } from "@/utils/server/serverGetLoggedInUser";
import {
  BadgeCheck,
  ChevronsUpDown,
  LogOut,
  Shield,
} from "lucide-react";
import { Suspense } from "react";
import { Link } from "./intl-link";


import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { Skeleton } from "./ui/skeleton";

async function SidebarFooterUserMenu() {
  const [data, user] = await Promise.all([
    getCachedUserProfile(),
    serverGetLoggedInUserVerified(),
  ]);
  const avatarImage = getUserAvatarUrl({
    email: user.email,
    profileAvatarUrl: data.avatar_url,
  });
  return (
    <SidebarMenu data-testid="sidebar-user-nav-menu">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              data-testid="sidebar-user-nav-avatar-button"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={avatarImage}
                  alt={data.full_name ?? user.email}
                />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {data.full_name ?? user.email}
                </span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={avatarImage}
                    alt={data.full_name ?? user.email}
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {data.full_name ?? user.email}
                  </span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/user/settings" className="bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-700 text-gray-900 dark:text-gray-100 font-semibold shadow-md hover:shadow-lg transition-all duration-200 rounded-md px-3 py-2 border border-gray-300 dark:border-gray-600">
                  <BadgeCheck className="text-gray-700 dark:text-gray-300" />
                  الإعدادات
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/user/settings/security">
                  <Shield />
                  الأمان
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/logout">
                <LogOut />
                تسجيل الخروج
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export async function SidebarFooterUserNav() {
  return (
    <Suspense fallback={<Skeleton className="h-10 w-full" />}>
      <SidebarFooterUserMenu />
    </Suspense>
  );
}
