import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";

interface RequireRoleProps {
  children: ReactNode;
  allowedRoles: AppRole[];
  fallback?: ReactNode;
  redirectTo?: string;
}

export const RequireRole = ({
  children,
  allowedRoles,
  fallback,
  redirectTo,
}: RequireRoleProps) => {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-4">
        <h2 className="text-xl font-semibold text-destructive mb-2">
          Access Denied
        </h2>
        <p className="text-muted-foreground">
          You don't have permission to access this content.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireRole;
