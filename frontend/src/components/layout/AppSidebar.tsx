import {
  LayoutDashboard,
  Briefcase,
  UserX,
  Shield,
  Building2,
  Users,
  MapPin,
  FileText,
  Scale,
  Building,
  TestTube,
  Archive,
  Car,
  Swords,
  AlertTriangle,
  LogOut
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Cases", url: "/cases", icon: Briefcase },
  { title: "Arrests", url: "/arrests", icon: UserX },
  { title: "Officers", url: "/officers", icon: Shield },
  { title: "Departments", url: "/departments", icon: Building2 },
  { title: "People", url: "/people", icon: Users },
  { title: "Incidents", url: "/incidents", icon: AlertTriangle },
  { title: "Locations", url: "/locations", icon: MapPin },
  { title: "Charges", url: "/charges", icon: Scale },
  { title: "Evidence", url: "/evidence", icon: Archive },
  { title: "Forensics", url: "/forensics", icon: TestTube },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Prisons", url: "/prisons", icon: Building },
  { title: "Vehicles", url: "/vehicles", icon: Car },
  { title: "Weapons", url: "/weapons", icon: Swords },
];

export function AppSidebar() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-t border-sidebar-border px-6 py-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-sidebar-primary" />
          <div>
            <h2 className="text-lg font-bold text-sidebar-foreground">Law Enforcement</h2>
            <p className="text-xs text-sidebar-foreground/70">Database System</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
