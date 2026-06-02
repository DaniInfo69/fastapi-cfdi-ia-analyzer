import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, role } = useContext(AuthContext);

  if (!token) {
    // Si no está logueado, va al login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Si está logueado pero no tiene el rol permitido (ej: cliente queriendo entrar a admin)
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;