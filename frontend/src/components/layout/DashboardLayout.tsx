import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-gradient-to-r from-white via-blue-50 to-indigo-50 px-6 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-blue-100 rounded-md transition-colors" />
              <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Crime & Law Enforcement System
              </h1>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex flex-col items-end">
                <span className="font-semibold text-foreground">{user?.firstName || user?.username || 'User'} {user?.lastName || ''}</span>
                <span className="text-xs text-muted-foreground capitalize">{user?.role || 'public'}</span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
