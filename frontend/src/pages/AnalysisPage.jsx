// src/pages/AnalysisPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { 
  Container, Paper, Typography, Button, TextField, Stack, 
  Box, IconButton, Alert, FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import TranslateIcon from '@mui/icons-material/Translate';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useTranslation } from 'react-i18next';
import { ColorModeContext } from '../App';
import { useTheme } from '@mui/material/styles';
import { analyzeFiscalHealth } from '../services/aiService';
import { getFiscalRegimes } from '../services/fiscalService';

const AnalysisPage = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  // --- ESTADOS DEL FORMULARIO ---
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [fiscalRegimes, setFiscalRegimes] = useState([]);
  const [selectedRegime, setSelectedRegime] = useState('');

  const isEnglish = i18n.language === 'en';
  // Buscamos si el régimen seleccionado en el estado requiere Acta Constitutiva
  const isMoral = fiscalRegimes.find(r => r.id === selectedRegime)?.moral === true;

  // --- CARGA DINÁMICA DESDE EL BACKEND ---
  useEffect(() => {
    const fetchRegimes = async () => {
      try {
        // 2. Usamos la función importada en lugar de axios directamente
        const regimesData = await getFiscalRegimes(); 
        setFiscalRegimes(regimesData);
      } catch (error) {
        // Aquí podrías poner una alerta visual si el backend no responde
        console.error("No se pudieron cargar los regímenes fiscales.");
      }
    };
    fetchRegimes();
  }, []);

  // --- LÓGICA DE IDIOMA ---
  const toggleLanguage = () => {
    const newLang = isEnglish ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  // --- LÓGICA DE ENVÍO AL BACKEND ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    formData.append('fiscal_regime', selectedRegime); 

    try {
      const response = await analyzeFiscalHealth(formData);
      setResult(response.data);
    } catch (error) {
      console.error("Error analizando documentos:", error);
      alert('Error de conexión con el backend. Revisa la consola.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          {t('title')}
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Stack spacing={3} mt={4}>
              
              {/* Selector Dinámico */}
              <FormControl fullWidth required>
                <InputLabel id="regime-select-label">
                  {t('fiscal_regime', isEnglish ? 'Fiscal Regime' : 'Régimen Fiscal')}
                </InputLabel>
                <Select
                  labelId="regime-select-label"
                  name="fiscal_regime_select"
                  value={selectedRegime}
                  label={t('fiscal_regime', isEnglish ? 'Fiscal Regime' : 'Régimen Fiscal')}
                  onChange={(e) => setSelectedRegime(e.target.value)}
                >
                  {fiscalRegimes.map((regime) => (
                    <MenuItem key={regime.id} value={regime.id}>
                      {isEnglish ? regime.en : regime.es}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                {t('upload_csf')}
                <input name="tax_status_cert" type="file" hidden required accept=".pdf" />
              </Button>
              
              <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                {t('upload_opinion')}
                <input name="compliance_opinion" type="file" hidden required accept=".pdf" />
              </Button>

              {isMoral && (
                <Button variant="text" component="label" startIcon={<CloudUploadIcon />}>
                  {t('bylaws')}
                  <input name="bylaws" type="file" hidden accept=".pdf" />
                </Button>
              )}
              
              <TextField 
                name="general_context" 
                label={t('general_context', isEnglish ? 'General Context (Employees, location, extra details)' : 'Contexto General (Empleados, ubicación, detalles extra)')} 
                multiline 
                rows={4} 
                fullWidth 
                placeholder={t('context_placeholder', isEnglish ? 'E.g. Company with 50 employees, located in Mexico City...' : 'Ej. Empresa con 50 empleados, ubicada en CDMX...')}
              />
              
              <Button type="submit" variant="gradient" size="large" disabled={loading}>
                {loading ? t('loading') : t('analyze_btn')}
              </Button>
          </Stack>
        </form>

        {result && (
          <Box sx={{ mt: 4 }}>
            <Alert severity={result.compliance_status === 'POSITIVE' ? 'success' : 'error'}>
              Status: {result.compliance_status}
            </Alert>
            <Typography variant="h6" sx={{ mt: 2 }}>Analysis Summary:</Typography>
            <Typography variant="body1">{result.entity_summary}</Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AnalysisPage;