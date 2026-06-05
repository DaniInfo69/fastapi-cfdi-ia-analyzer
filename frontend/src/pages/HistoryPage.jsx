// src/pages/HistoryPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip 
} from '@mui/material';
import { getAnalysisHistory } from '../services/aiService';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getAnalysisHistory();
        setHistory(data);
      } catch (error) {
        console.error("Error cargando historial", error);
      }
    };
    fetchHistory();
  }, []);

  const getRiskColor = (risk) => {
    if (risk === 'Bajo') return 'success';
    if (risk === 'Medio') return 'warning';
    return 'error';
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, overflowX: 'auto' }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          Historial de Análisis
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Tus análisis recientes (actualmente vinculados por IP, próximamente por cuenta).
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>Fecha</b></TableCell>
                <TableCell><b>Régimen</b></TableCell>
                <TableCell><b>Deducible</b></TableCell>
                <TableCell><b>Riesgo</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No hay historial disponible aún.</TableCell>
                </TableRow>
              ) : (
                history.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{row.fiscal_regime || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={row.deducible} color={row.deducible === 'Sí' ? 'success' : 'error'} />
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={row.nivel_riesgo} color={getRiskColor(row.nivel_riesgo)} variant="outlined" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default HistoryPage;