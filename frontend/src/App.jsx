// src/App.jsx
import React, { useState, useMemo, createContext } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import TranslateIcon from '@mui/icons-material/Translate';
import { useTranslation } from 'react-i18next'; // Importamos el hook de idioma

import { getDesignTokens } from './theme/AppTheme';
import AnalysisPage from './pages/AnalysisPage';
import './services/i18n';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export default function App() {
  const [mode, setMode] = useState('light');
  const { t, i18n } = useTranslation(); 
  
  const isEnglish = i18n.language === 'en';

  // Lógica de idioma movida a nivel global
  const toggleLanguage = () => {
    i18n.changeLanguage(isEnglish ? 'es' : 'en');
  };

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline /> 
        
        {/* --- NUEVA BARRA DE NAVEGACIÓN SUPERIOR --- */}
        <AppBar 
          position="sticky" 
          color="inherit" 
          elevation={1} 
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Toolbar>
            {/* Título de la Aplicación */}
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}
            >
              CFDI AI Analyzer
            </Typography>

            {/* Controles Globales (Idioma y Tema) */}
            <Box display="flex" gap={1}>
              <Button 
                startIcon={<TranslateIcon />} 
                onClick={toggleLanguage} 
                color="inherit"
              >
                {isEnglish ? 'ES' : 'EN'}
              </Button>
              
              <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* --- CONTENIDO PRINCIPAL --- */}
        <Box sx={{ minHeight: 'calc(100vh - 64px)', backgroundColor: 'background.default' }}>
          <AnalysisPage />
        </Box>

      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}