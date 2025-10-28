import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, Users, MessageSquare, Settings, FileText } from "lucide-react";
import { Link } from "./intl-link";
import { getCachedDeputyProfile } from "@/rsc-data/user/deputy";

export async function SidebarUserNav() {
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
            <Link href="/complaints">
              <FileText className="h-4 w-4" />
              <span>إدارة الشكاوى</span>
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

