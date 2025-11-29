import type { ReactNode } from 'react';
import { Navigate } from 'react-router';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const nickname = localStorage.getItem('nickname');

  if (!nickname) {
    return <Navigate to="/join" replace />;
  }

  return <>{children}</>;
}
