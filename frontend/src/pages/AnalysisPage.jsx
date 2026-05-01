import React, { useState, useContext } from 'react';
import { Container, Paper, Typography, Button, TextField, Stack, Box, IconButton, Alert } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import TranslateIcon from '@mui/icons-material/Translate';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useTranslation } from 'react-i18next';
import { ColorModeContext } from '../App';
import { useTheme } from '@mui/material/styles';
import { analyzeFiscalHealth } from '../services/aiService';

const AnalysisPage = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  // --- ESTADOS DEL FORMULARIO ---
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // --- LÓGICA DE IDIOMA ---
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  // --- LÓGICA DE ENVÍO AL BACKEND ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResult(null); // Limpiamos errores o resultados anteriores

    // Extraemos todos los datos del formulario automáticamente
    const formData = new FormData(event.currentTarget);

    try {
      // Llamamos a tu servicio que se conecta con FastAPI/OpenAI
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
      
      {/* Controles superiores (Idioma y Tema) */}
      <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
        <Button startIcon={<TranslateIcon />} onClick={toggleLanguage} variant="outlined">
          {i18n.language === 'en' ? 'Español' : 'English'}
        </Button>
        <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          {t('title')}
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Stack spacing={3} mt={4}>
              <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                {t('upload_csf')}
                <input name="tax_status_cert" type="file" hidden required accept=".pdf" />
              </Button>
              
              <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                {t('upload_opinion')}
                <input name="compliance_opinion" type="file" hidden required accept=".pdf" />
              </Button>

              <Button variant="text" component="label" startIcon={<CloudUploadIcon />}>
                {t('bylaws')}
                <input name="bylaws" type="file" hidden accept=".pdf" />
              </Button>
              
              <TextField name="employees" label={t('employees')} fullWidth />
              <TextField name="location" label={t('location')} fullWidth />
              <TextField name="additional_context" label={t('extra_context')} multiline rows={3} fullWidth />
              
              <Button type="submit" variant="gradient" size="large" disabled={loading}>
                
                
                {loading ? t('loading') : t('analyze_btn')}
              </Button>
          </Stack>
        </form>

        {/* Sección de Resultados: Solo aparece si el backend responde */}
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