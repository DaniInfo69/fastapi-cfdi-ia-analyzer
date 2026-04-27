// En src/pages/AnalysisPage.jsx
import React, { useState, useContext } from 'react';
import { Container, Paper, Typography, Button, TextField, Stack, Box, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import TranslateIcon from '@mui/icons-material/Translate';
import { useTranslation } from 'react-i18next';
import { ColorModeContext } from '../App'; // Importamos el contexto
import { useTheme } from '@mui/material/styles';

const AnalysisPage = () => {
  const { t, i18n } = useTranslation(); // Hook de traducciones
  const theme = useTheme(); // Para saber qué tema está activo
  const colorMode = useContext(ColorModeContext); // Función para cambiar tema

  // Función para cambiar idioma
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      
      {/* Controles superiores */}
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
          {t('title')} {/* Uso de traducción */}
        </Typography>
        
        {/* Ejemplo de un input traducido */}
        
        <form onSubmit={handleSubmit}>
          <Stack spacing={3} mt={4}>
              <Button variant="outlined" component="label">
                {t('upload_csf')}
                <input name="tax_status_cert" type="file" hidden required accept=".pdf" />
              </Button>
              
              <TextField name="employees" label={t('employees')} fullWidth />
              
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? t('loading') : t('analyze_btn')}
              </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default AnalysisPage;