import { createTheme } from '@mui/material/styles';

// Definición de colores y estilos globales
export const AppTheme = createTheme({
  palette: {
    primary: {
      main: '#aa3bff', // El color morado que ya usas en tu CSS
    },
    secondary: {
      main: '#c084fc',
    },
    background: {
      default: '#f4f3ec',
    },
  },
  typography: {
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 500 },
    h2: { fontWeight: 500 },
  },
});