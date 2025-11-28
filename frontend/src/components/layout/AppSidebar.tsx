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
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";
import {
  SidebarBody,
  SidebarLink,
  useExpandableSidebar,
} from "@/components/ui/expandable-sidebar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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

const Logo = () => {
  const { open } = useExpandableSidebar();
  
  return (
    <div className="font-normal flex items-center gap-3 text-sm py-4 relative z-20 border-b border-white/10">
      <div className="h-10 w-10 bg-gradient-to-br from-white to-white/80 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
        <Shield className="h-6 w-6 text-[#0b2c75]" />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 1 : 0 }}
        className="font-semibold text-white text-base whitespace-pre"
      >
        Law Enforcement
      </motion.span>
    </div>
  );
};

const LogoIcon = () => {
  return (
    <div className="font-normal flex items-center justify-center text-sm py-4 relative z-20 border-b border-white/10">
      <div className="h-10 w-10 bg-gradient-to-br from-white to-white/80 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
        <Shield className="h-6 w-6 text-[#0b2c75]" />
      </div>
    </div>
  );
};

const SidebarContent = () => {
  const { open } = useExpandableSidebar();
  const { logout, user } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const links = menuItems.map(item => {
    const isActive = location.pathname === item.url || (item.url !== "/" && location.pathname.startsWith(item.url));
    return {
      label: item.title,
      href: item.url,
      icon: (
        <item.icon 
          className={cn(
            "h-5 w-5 flex-shrink-0 transition-colors min-w-[20px]",
            isActive
              ? "text-white"
              : "text-white/100"
          )}
        />
      ),
    };
  });

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Logo - Fixed at top */}
        <div className="flex-shrink-0">
          {open ? <Logo /> : <LogoIcon />}
        </div>
        
        {/* Menu Items - Scrollable middle section */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden mt-4 min-h-0">
          <div className="flex flex-col gap-1">
            {links.map((link, idx) => {
              const isActive = location.pathname === link.href || (link.href !== "/" && location.pathname.startsWith(link.href));
              return (
                <SidebarLink
                  key={idx}
                  link={link}
                  className={cn(
                    "rounded-lg py-2.5 transition-all duration-200 flex-shrink-0",
                    open ? "px-3" : "px-2",
                    isActive
                      ? "bg-white/25 text-white shadow-sm border-l-4 border-white/50"
                      : "text-white/80 hover:bg-white/15 hover:text-white"
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 border-t border-white/10 pt-3 mt-2">
          <SidebarLink
            link={{
              label: user?.firstName || user?.username || "User",
              href: "#",
              icon: (
                <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center text-white text-sm font-semibold shadow-sm border border-white/20">
                  {(user?.firstName?.[0] || user?.username?.[0] || "U").toUpperCase()}
                </div>
              ),
            }}
            closeOnClick={false}
            className={cn(
              "rounded-lg py-2.5 text-white/90 hover:bg-white/15 hover:text-white transition-all",
              open ? "px-3" : "px-2"
            )}
          />
          <SidebarLink
            link={{
              label: "Logout",
              href: "#",
              icon: (
                <LogOut className="h-5 w-5 flex-shrink-0 text-red-300" />
              ),
            }}
            closeOnClick={false}
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            className={cn(
              "rounded-lg py-2.5 text-red-300 hover:bg-red-500/20 hover:text-red-200 mt-2 transition-all",
              open ? "px-3" : "px-2"
            )}
          />
        </div>
      </div>
    </>
  );
};

export function AppSidebar() {
  return (
    <SidebarBody className="bg-gradient-to-b from-[#0b2c75] to-[#0a1f5c] shadow-lg">
      <SidebarContent />
    </SidebarBody>
  );
}
