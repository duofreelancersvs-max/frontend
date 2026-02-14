import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import type { UserRole } from '@/types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'client') {
      return <Navigate to="/client/dashboard" replace />;
    } else if (user.role === 'freelancer') {
      return <Navigate to="/freelancer/dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Pre-configured route wrappers
export function ClientRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['client']}>
      {children}
    </ProtectedRoute>
  );
}

export function FreelancerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['freelancer']}>
      {children}
    </ProtectedRoute>
  );
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
}

export function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
