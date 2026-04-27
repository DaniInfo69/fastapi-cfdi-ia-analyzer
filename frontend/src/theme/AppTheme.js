import { createTheme } from '@mui/material/styles';

// Definición de colores y estilos globales
export const AppTheme = createTheme({
  palette: {
    mode,
    primary: {
      main: '#aa3bff', // El color morado que ya usas en tu CSS
    },
    secondary: {
      main: '#c084fc',
    },
    background: {
      default: mode === 'light' ? '#f4f3ec' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
    text: {
      primary: mode === 'light' ? '#000000' : '#ffffff',
      secondary: mode === 'light' ? '#666666' : '#aaaaaa',
    }
  },
  typography: {
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 500 },
    h2: { fontWeight: 500 },
  },
});