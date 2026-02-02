import { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar />
      
      {/* Main content area - pl-16 ensures content starts after mobile icon rail */}
      <div className="flex-1 flex flex-col min-w-0 pl-16 md:pl-0">
        <Header />
        
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
