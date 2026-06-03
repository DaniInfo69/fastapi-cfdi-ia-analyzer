import React, { createContext, useState, useEffect, useRef } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Función auxiliar que busca en local primero, y si no hay, busca en session
  const getInitialData = (key) => {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  };

  // Inicializamos el estado buscando en la caja fuerte correcta desde el principio
  const [token, setToken] = useState(getInitialData('access_token'));
  const [role, setRole] = useState(getInitialData('user_role'));
  const [username, setUsername] = useState(getInitialData('username'));
  const [loading, setLoading] = useState(true);

  const inactivityTimerRef = useRef(null);
  const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutos en milisegundos

  const logout = () => {
    // Barremos con ambas cajas fuertes para no dejar rastros de seguridad
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user_role');
    sessionStorage.removeItem('username');

    // Limpiamos la memoria de React
    setToken(null);
    setRole(null);
    setUsername(null);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
  };

  const login = (data, rememberMe) => {
    // 1. Elegimos la caja fuerte dinámicamente según lo que pidió el usuario
    const storage = rememberMe ? localStorage : sessionStorage;
    
    // 2. Guardamos todos los datos en la caja fuerte elegida
    storage.setItem('access_token', data.access_token);
    if (data.refresh_token) storage.setItem('refresh_token', data.refresh_token);
    storage.setItem('user_role', data.role);
    storage.setItem('username', data.username);

    // 3. Actualizamos la memoria de React
    setToken(data.access_token);
    setRole(data.role);
    setUsername(data.username);
    
    resetTimer();
  };

  const resetTimer = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (token || getInitialData('access_token')) {
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