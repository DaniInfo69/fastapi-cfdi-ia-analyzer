import { createTheme } from '@mui/material/styles';
import { Component } from 'react';

// Exportamos getDesignTokens para que App.jsx pueda inyectarle 'light' o 'dark'
export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#159cf6' : '#1186d4',
    },
    background: {
      default: mode === 'light' ? '#f4f3ec' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
    text: {
      primary: mode === 'light' ? '#000000' : '#ffffff',
    }
  },
  typography: {
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '.login-wrapper': {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          /* Descuenta con exactitud los 64px del AppBar y los 48px del padding (py:3) en App.jsx */
          minHeight: 'calc(100vh - 112px)', 
          padding: '0 16px',
        },
        '.login-card': {
          maxWidth: '420px',
          width: '100%',
          /* El fondo blur y borde curvo ya los hereda automáticamente de tu configuración de MuiPaper abajo */
        },
        '.login-card-content': {
          padding: '32px !important', /* Equivale a tu anterior sx={{ p: 4 }} */
        },
        '.login-subtitle': {
          marginBottom: '32px', /* Equivale a tu anterior sx={{ mb: 4 }} */
        },
        // NUEVO: Fila que agrupa el checkbox y el link
        '.login-options-row': {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '-8px', // Acercamos los elementos un poco a la contraseña
          marginBottom: '-8px',
        },
        // NUEVO: Link de Olvidar contraseña estilizado
        '.forgot-password-link': {
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '0.875rem',
          color: mode === 'light' ? '#159cf6' : '#1186d4',
          transition: 'color 0.3s ease',
          '&:hover': {
            color: mode === 'light' ? '#0d85d8' : '#3ec1fd',
            textDecoration: 'underline',
          }
        }
      }
    },
    MuiButton: {
      variants: [
        {
          props: { variant: 'gradient' },
          style: {
            borderRadius: '14px',
            background: 'linear-gradient(45deg, #4b0082 30%, #159cf6 90%)',
            boxShadow: '-4px 4px 10px rgba(90, 0, 155, 0.3), 6px 6px 15px rgba(62, 193, 253, 0.3)',
            color: 'white',
            padding: '12px 32px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            transition: 'all 0.5s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              background: 'linear-gradient(45deg, #4b0082 15%, #159cf6 90%)',
              boxShadow: '-6px 6px 15px rgba(90, 0, 155, 0.7), 6px 6px 15px rgba(62, 193, 253, 0.7)',
            },
            '&.Mui-disabled': {
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'gray',
              boxShadow: 'none',
            }
          },
        },
        {
          props: { variant: 'flat' },
          style: {
            borderRadius: '14px',
            backgroundColor: mode === 'light' ? '#159cf6' : '#1186d4',
            color: '#ffffff',
            boxShadow: 'none',
            padding: '12px 32px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease',
            '&:hover': {
              backgroundColor: mode === 'light' ? '#0d85d8' : '#0e70b0',
              boxShadow: 'none',
            },
            '&.Mui-disabled': {
              backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
              color: mode === 'light' ? 'rgba(0, 0, 0, 0.26)' : 'rgba(255, 255, 255, 0.3)',
            }
          },
        },
      ],
      styleOverrides: {
        root: {
          borderRadius: '14px',
          color: mode === 'dark' ? '#159cf6' : '#1186d4',
          fontWeight: 'bold',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderRadius: '20px',
        },
      },
    },
    // Centralizamos el estilo para que aplique a TextField y a Select
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
    // Estilos para el menú del selector
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: mode === 'light' ? 'rgba(21, 156, 246, 0.15)' : 'rgba(17, 134, 212, 0.25)',
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(21, 156, 246, 0.25)' : 'rgba(17, 134, 212, 0.35)',
            }
          },
        }
      }
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'dark' ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          padding: '16px',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          backgroundImage: 'none',
        },
      },
    },
    
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 'bold',
          textTransform: 'none',
          borderRadius: '12px',
        }
      }
    },

  },
});