import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles';
import { AppTheme } from './Theme/AppTheme';
import AnalysisPage from './Pages/AnalysisPage';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={AppTheme}>
      <AnalysisPage />
    </ThemeProvider>
  </StrictMode>,
);