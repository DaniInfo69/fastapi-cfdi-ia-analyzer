// src/pages/AnalysisPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { 
  Container, Paper, Typography, Button, TextField, Stack, 
  Box, IconButton, Alert, FormControl, InputLabel, Select, MenuItem, Chip 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useTranslation } from 'react-i18next';
import { analyzeFiscalHealth } from '../services/aiService';
import { getFiscalRegimes } from '../services/fiscalService';

const AnalysisPage = () => {
  const { t, i18n } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [queriesRemaining, setQueriesRemaining] = useState(null);
  const [fiscalRegimes, setFiscalRegimes] = useState([]);
  const [selectedRegime, setSelectedRegime] = useState('');

  const isEnglish = i18n.language === 'en';
  const isMoral = fiscalRegimes.find(r => r.id === selectedRegime)?.moral === true;

  useEffect(() => {
    const fetchRegimes = async () => {
      try {
        const regimesData = await getFiscalRegimes(); 
        setFiscalRegimes(regimesData);
      } catch (error) {
        console.error("No se pudieron cargar los regímenes fiscales.");
      }
    };
    fetchRegimes();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    formData.append('fiscal_regime', selectedRegime); 

    try {
      const response = await analyzeFiscalHealth(formData);
      // Extraemos la 'data' del nuevo formato del backend
      setResult(response.data.data);
      setQueriesRemaining(response.data.queries_remaining);
    } catch (error) {
      console.error("Error analizando documentos:", error);
      alert(error.response?.data?.detail || 'Error de conexión con el backend. Revisa la consola.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    if (risk === 'Bajo') return 'success';
    if (risk === 'Medio') return 'warning';
    return 'error';
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          {t('title', 'Nuevo Análisis Fiscal')}
        </Typography>

        {queriesRemaining !== null && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Análisis gratuitos restantes hoy: <strong>{queriesRemaining}</strong>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Stack spacing={3} mt={4}>
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
                {t('upload_csf', 'Constancia de Situación Fiscal (PDF)*')}
                <input name="tax_status_cert" type="file" hidden required accept=".pdf" />
              </Button>
              
              <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                {t('upload_opinion', 'Opinión de Cumplimiento (PDF)*')}
                <input name="compliance_opinion" type="file" hidden required accept=".pdf" />
              </Button>

              {isMoral && (
                <Button variant="text" component="label" startIcon={<CloudUploadIcon />}>
                  {t('bylaws', 'Acta Constitutiva (PDF Opcional)')}
                  <input name="bylaws" type="file" hidden accept=".pdf" />
                </Button>
              )}
              
              <TextField 
                name="general_context" 
                label={t('general_context', isEnglish ? 'General Context (Employees, location, extra details)' : 'Contexto General del CFDI')} 
                multiline 
                rows={4} 
                fullWidth 
                required
                placeholder={t('context_placeholder', isEnglish ? 'E.g. Purchase of 5 laptops...' : 'Ej. Compra de 5 laptops para desarrolladores...')}
              />
              
              <Button type="submit" variant="gradient" size="large" disabled={loading}>
                {loading ? t('loading', 'Analizando con IA...') : t('analyze_btn', 'Analizar Deducibilidad')}
              </Button>
          </Stack>
        </form>

        {/* RESULTADO ADAPTADO AL NUEVO JSON */}
        {result && (
          <Paper sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderLeft: 6, borderColor: result.deducible === 'Sí' ? 'success.main' : 'error.main' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" fontWeight="bold">Veredicto: {result.deducible}</Typography>
              <Chip label={`Riesgo: ${result.nivel_riesgo}`} color={getRiskColor(result.nivel_riesgo)} />
            </Box>
            <Typography variant="body1" paragraph><strong>Resumen:</strong> {result.resumen}</Typography>
            <Typography variant="body2" color="text.secondary" paragraph><strong>Fundamento:</strong> {result.justificacion_legal}</Typography>
            
            {result.advertencias && result.advertencias.length > 0 && (
              <Alert severity="warning">
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {result.advertencias.map((adv, i) => <li key={i}>{adv}</li>)}
                </ul>
              </Alert>
            )}
          </Paper>
        )}
      </Paper>
    </Container>
  );
};

export default AnalysisPage;