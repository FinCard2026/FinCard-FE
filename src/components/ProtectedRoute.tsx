import React from 'react';
import { Navigate } from 'react-router-dom';
import { Tokens } from '../lib/api';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!Tokens.access) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
