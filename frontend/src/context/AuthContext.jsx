import React, { createContext, useState, useEffect, useRef } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [role, setRole] = useState(localStorage.getItem('user_role'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [loading, setLoading] = useState(true);

  const inactivityTimerRef = useRef(null);
  const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutos en milisegundos

  const logout = () => {
    setToken(null);
    setRole(null);
    setUsername(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
  };

  const login = (data) => {
    setToken(data.access_token);
    setRole(data.role);
    setUsername(data.username);
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user_role', data.role);
    localStorage.setItem('username', data.username);
    resetTimer();
  };

  const resetTimer = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (localStorage.getItem('access_token')) {
      inactivityTimerRef.current = setTimeout(() => {
        alert("Tu sesión ha expirado debido a 10 minutos de inactividad.");
        logout();
      }, INACTIVITY_LIMIT);
    }
  };

  // Escuchar desautenticaciones globales del interceptor Axios (401)
  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    // Inicialización al cargar la app
    setLoading(false);
    
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Monitorear actividad del usuario (Mouse, teclado, scroll, etc.)
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    const handleActivity = () => { if (token) resetTimer(); };

    events.forEach((event) => window.addEventListener(event, handleActivity));
    if (token) resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, role, username, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};