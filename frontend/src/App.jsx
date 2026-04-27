// src/App.jsx
import React, { useState, useMemo, createContext } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getDesignTokens } from './theme/AppTheme';
import AnalysisPage from './pages/AnalysisPage';
import './services/i18n'; // Importamos la configuración de idiomas

// Creamos un contexto para poder cambiar el tema desde cualquier botón
export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export default function App() {
  const [mode, setMode] = useState('light');

  // Función para alternar el tema
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  // Re-creamos el tema de MUI cada vez que 'mode' cambia
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline reinicia los estilos del navegador e inyecta el color de fondo correcto (oscuro o claro) */}
        <CssBaseline /> 
        <AnalysisPage />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}