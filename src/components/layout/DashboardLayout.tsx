import { ReactNode } from "react";
import AppLayout from "./AppLayout";

interface DashboardLayoutProps {
  children: ReactNode;
}

// DashboardLayout now delegates to AppLayout for consistent mobile/desktop behavior
const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return <AppLayout>{children}</AppLayout>;
};

export default DashboardLayout;
