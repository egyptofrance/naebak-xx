import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, Users, MessageSquare, Settings } from "lucide-react";
import { Link } from "./intl-link";

export function SidebarUserNav() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/home">
              <Home className="h-4 w-4" />
              <span>الرئيسية</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/deputies">
              <Users className="h-4 w-4" />
              <span>النواب</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/complaints">
              <MessageSquare className="h-4 w-4" />
              <span>شكاويي</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/user/settings">
              <Settings className="h-4 w-4" />
              <span>الإعدادات</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

