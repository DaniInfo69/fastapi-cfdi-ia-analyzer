// src/pages/HistoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Container, Paper, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip 
} from '@mui/material';
import { getAnalysisHistory } from '../services/aiService';

const HistoryPage = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Usamos tu servicio limpio
        const data = await getAnalysisHistory(); 
        setHistory(data || []);
      } catch (error) {
        console.error("Error cargando historial", error);
      }
    };
    fetchHistory();
  }, []);

  // Modificado para leer los valores en inglés de la base de datos
  const getRiskColor = (risk) => {
    if (risk === 'Low') return 'success';
    if (risk === 'Medium') return 'warning';
    return 'error';
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, overflowX: 'auto' }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          Historial de Análisis
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Tus análisis recientes vinculados a tu cuenta.
        </Typography>

        <TableContainer>
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell><b>Fecha</b></TableCell>
                <TableCell><b>Régimen</b></TableCell>
                <TableCell><b>Riesgo</b></TableCell>
                <TableCell><b>Deducible</b></TableCell>
                <TableCell><b>Resumen</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Cambiamos 'records' por 'history' */}
              {history.map((row) => (
                <TableRow key={row.id}>
                  {/* Formateamos la fecha para que se vea bonita */}
                  <TableCell>
                    {new Date(row.created_at).toLocaleDateString()}
                  </TableCell>
                  
                  <TableCell>{row.fiscal_regime || "No especificado"}</TableCell>
                  
                  {/* Usamos el Chip para que el riesgo tenga color */}
                  <TableCell>
                    <Chip 
                      size="small"
                      label={t(`risk.${row.risk_level}`, { defaultValue: row.risk_level })}
                      color={getRiskColor(row.risk_level)} 
                    />
                  </TableCell>
          
                  <TableCell>
                    {t(`deductible.${row.deductible}`, { defaultValue: row.deductible })}
                  </TableCell>

                  {/* Mostramos el resumen. Quité la justificación porque haría la tabla inmensa, es mejor dejarla solo en la vista de detalle. */}
                  <TableCell>{row.summary}</TableCell>
                </TableRow>
              ))}
              
              {/* Mensaje por si el historial está vacío */}
              {history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    Aún no tienes análisis en tu historial.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default HistoryPage;