import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../shared/store/useStore';

/**
 * Разделение кабинетов: студенческие экраны не открываются партнёру и наоборот.
 * Сервер проверяет то же самое, поэтому через API обойти правило нельзя.
 */

export const RequirePartner: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const role = useStore((s) => s.userRole);
  if (role !== 'partner') return <Navigate to="/" replace />;
  return children;
};

export const RequireStudent: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const role = useStore((s) => s.userRole);
  if (role !== 'student') return <Navigate to="/" replace />;
  return children;
};
