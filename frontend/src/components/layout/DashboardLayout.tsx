import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { ExpandableSidebar, useExpandableSidebar } from "@/components/ui/expandable-sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const MainContent = ({ children }: { children: ReactNode }) => {
  const { open } = useExpandableSidebar();

  return (
    <div 
      className="flex-1 flex flex-col transition-all duration-200 min-w-0"
      style={{ marginLeft: open ? '300px' : '70px' }}
    >
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold" style={{ color: '#0b2c75' }}>
              Crime & Law Enforcement System
            </h1>
          </div>
        </header>

        <main className="flex-1 p-6 bg-[#F5F7FA] overflow-y-auto">
          {children}
        </main>
      </div>
  );
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ExpandableSidebar>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <MainContent>{children}</MainContent>
      </div>
    </ExpandableSidebar>
  );
}
