import { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import MobileNavigation from "./MobileNavigation";
import MobileHeader from "./MobileHeader";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showSearch?: boolean;
}

const AppLayout = ({ children, title, showSearch = true }: AppLayoutProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <MobileHeader title={title} showSearch={showSearch} />
        
        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>
        
        <MobileNavigation />
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
