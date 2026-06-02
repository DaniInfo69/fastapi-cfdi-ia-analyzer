import React, { useState, useMemo, createContext, useContext } from 'react';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Tooltip, Chip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import TranslateIcon from '@mui/icons-material/Translate';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useTranslation } from 'react-i18next'; 
import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from 'react-router-dom';
import { getDesignTokens } from './theme/AppTheme';

import AnalysisPage from './pages/AnalysisPage';
import HistoryPage from './pages/HistoryPage'; 
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';

import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './services/i18n';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

const NavigationBar = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const { t, i18n } = useTranslation(); 
  const { token, username, role, logout } = useContext(AuthContext);
  
  const isEnglish = i18n.language === 'en';
  const toggleLanguage = () => i18n.changeLanguage(isEnglish ? 'es' : 'en');

  return (
    <AppBar 
      position="sticky" 
      color="inherit" 
      elevation={1} 
      sx={{ 
        borderBottom: 1, borderColor: 'divider', 
        backdropFilter: 'blur(10px)', 
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(18,18,18,0.8)' : 'rgba(244,243,236,0.8)' 
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          component={token ? RouterLink : Box} 
          to={token ? "/" : undefined}
          sx={{ fontWeight: 'bold', color: 'primary.main', textDecoration: 'none', cursor: token ? 'pointer' : 'default' }}
        >
          CFDI AI Analyzer
        </Typography>

        {/* Solo se muestran los botones si hay sesión activa */}
        <Box sx={{ flexGrow: 1, display: 'flex', ml: 4, gap: 2 }}>
          {token && (
            <>
              <Button color="inherit" component={RouterLink} to="/">Análisis</Button>
              <Button color="inherit" component={RouterLink} to="/history">Historial</Button>
              {role === 'admin' && (
                <Button startIcon={<AdminPanelSettingsIcon />} color="secondary" component={RouterLink} to="/admin">
                  Admin
                </Button>
              )}
            </>
          )}
        </Box>

        <Box display="flex" gap={1} alignItems="center">
          {token && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 2, display: { xs: 'none', sm: 'flex' } }}>
              <Typography variant="body2" fontWeight="bold">
                {username}
              </Typography>
              <Chip label={role} size="small" color={role === 'admin' ? 'secondary' : 'default'} />
            </Stack>
          )}

          <Button startIcon={<TranslateIcon />} onClick={toggleLanguage} color="inherit">
            {isEnglish ? 'ES' : 'EN'}
          </Button>
          <IconButton onClick={colorMode.toggleColorMode} color="inherit">
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          
          {token && (
            <Tooltip title="Cerrar Sesión">
              <IconButton onClick={logout} color="error" sx={{ ml: 1 }}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default function App() {
  const [mode, setMode] = useState('light');

  const colorMode = useMemo(() => ({
    toggleColorMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
  }), []);

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline /> 
        <AuthProvider>
          <Router>
            <NavigationBar />
            <Box sx={{ minHeight: 'calc(100vh - 64px)', backgroundColor: 'background.default', py: 3 }}>
              <Routes>
                {/* Ruta Pública */}
                <Route path="/login" element={<LoginPage />} />

                {/* Rutas Protegidas para Clientes y Admins */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <AnalysisPage />
                  </ProtectedRoute>
                } />
                <Route path="/history" element={
                  <ProtectedRoute>
                    <HistoryPage />
                  </ProtectedRoute>
                } />

                {/* Ruta Protegida Exclusiva para Administradores */}
                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </Box>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}