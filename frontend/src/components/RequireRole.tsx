import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface RequireRoleProps {
    children: React.ReactNode;
    allowedRoles: ('admin' | 'officer' | 'analyst' | 'clerk')[];
}

export function RequireRole({ children, allowedRoles }: RequireRoleProps) {
    const { user, isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
    return <RequireRole allowedRoles={['admin']}>{children}</RequireRole>;
}

