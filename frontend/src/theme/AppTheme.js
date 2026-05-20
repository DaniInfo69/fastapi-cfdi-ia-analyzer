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
    }
  },
});