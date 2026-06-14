// src/pages/AnalysisPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Button, TextField, Stack, 
  Box, Alert, FormControl, InputLabel, Select, MenuItem, Chip 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
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
  const [fileNames, setFileNames] = useState({});
  
  // NUEVO: Estado para manejar errores de validación del formulario
  const [formError, setFormError] = useState(null);

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

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    if (files && files.length > 0) {
      setFileNames((prev) => ({ ...prev, [name]: files[0].name }));
      // Si el usuario sube el archivo, limpiamos el error
      setFormError(null);
    } else {
      setFileNames((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(""); // Reiniciamos el error en cada intento

    // VALIDACIÓN MANUAL: Verificamos los archivos obligatorios
    if (!fileNames.tax_status_cert) {
      setFormError(isEnglish ? "Tax Status Certificate (PDF) is required." : "La Constancia de Situación Fiscal (PDF) es obligatoria.");
      return; // Detenemos la ejecución
    }
    
    if (!fileNames.cfdi) {
      setFormError(isEnglish ? "CFDI / Invoice is required." : "La Factura / CFDI (XML o PDF) es obligatoria.");
      return; // Detenemos la ejecución
    }
    
    setLoading(true);
    setResult(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.append('fiscal_regime', selectedRegime); 

    try {
      const response = await analyzeFiscalHealth(formData);
      const result = await aiService.analyze(formData);
      setResult(response.data.data);
      setQueriesRemaining(response.data.queries_remaining);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        // Si el backend mandó un HTTPException
        setFormError(error.response.data.detail);
      } else {
        setFormError("Ocurrió un error inesperado al comunicarse con el servidor. Revisa tu conexión.");
      }
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

        {formError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {formError}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Stack spacing={3} mt={2}>
              <FormControl required className="regime-form-control">
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

              <Box className="file-buttons-grid">
                {/* Botón 1: Constancia (OBLIGATORIA) */}
                {/* Nota: Quitamos el "required" nativo del input oculto para evitar fallos del navegador */}
                <Box className="file-upload-wrapper">
                  <Button variant="outlined" size="small" component="label" startIcon={<CloudUploadIcon />}>
                    {t('upload_csf', 'Constancia (PDF)*')}
                    <input name="tax_status_cert" type="file" hidden accept=".pdf" onChange={handleFileChange} />
                  </Button>
                  {fileNames.tax_status_cert && (
                    <Box className="file-preview-badge">
                      <DescriptionIcon fontSize="small" /> {fileNames.tax_status_cert}
                    </Box>
                  )}
                </Box>
                
                {/* Botón 2: Opinión de Cumplimiento (AHORA OPCIONAL) */}
                <Box className="file-upload-wrapper">
                  <Button variant="outlined" size="small" component="label" startIcon={<CloudUploadIcon />}>
                    {t('upload_opinion', 'Opinión Cumplimiento (Opcional)')}
                    <input name="compliance_opinion" type="file" hidden accept=".pdf" onChange={handleFileChange} />
                  </Button>
                  {fileNames.compliance_opinion && (
                    <Box className="file-preview-badge">
                      <DescriptionIcon fontSize="small" /> {fileNames.compliance_opinion}
                    </Box>
                  )}
                </Box>

                {/* Botón 3: Acta Constitutiva (Opcional - Personas Morales) */}
                {isMoral && (
                  <Box className="file-upload-wrapper">
                    <Button variant="outlined" size="small" component="label" startIcon={<CloudUploadIcon />}>
                      {t('bylaws', 'Acta Constitutiva (Opcional)')}
                      <input name="bylaws" type="file" hidden accept=".pdf" onChange={handleFileChange} />
                    </Button>
                    {fileNames.bylaws && (
                      <Box className="file-preview-badge">
                        <DescriptionIcon fontSize="small" /> {fileNames.bylaws}
                      </Box>
                    )}
                  </Box>
                )}

                {/* Botón 4: CFDI Factura (OBLIGATORIA - ESTIRA A 2 COLUMNAS SI NO HAY ACTA) */}
                <Box 
                  className="file-upload-wrapper" 
                  sx={{ gridColumn: { sm: isMoral ? 'auto' : 'span 2' } }}
                >
                  <Button variant="outlined" size="small" component="label" startIcon={<CloudUploadIcon />}>
                    {t('upload_cfdi', 'Factura / CFDI (XML o PDF)*')}
                    <input name="cfdi" type="file" hidden accept=".xml,.pdf" onChange={handleFileChange} />
                  </Button>
                  {fileNames.cfdi && (
                    <Box className="file-preview-badge">
                      <DescriptionIcon fontSize="small" /> {fileNames.cfdi}
                    </Box>
                  )}
                </Box>
              </Box>
              
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

        {result && (
          <Paper sx={{ mt: 4, p: { xs: 2, sm: 3 }, bgcolor: 'background.default', borderLeft: 6, borderColor: result.deducible === 'Sí' ? 'success.main' : 'error.main' }}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={2} gap={1}>
              <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                Veredicto: {result.deducible}
              </Typography>
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