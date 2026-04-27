// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx' // Importamos el nuevo "Cerebro"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App /> {/* App ya se encarga de poner el ThemeProvider y renderizar AnalysisPage */}
  </StrictMode>,
);