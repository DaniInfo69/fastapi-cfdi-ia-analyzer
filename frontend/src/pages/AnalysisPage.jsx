import React, { useState } from 'react';
import { Container, Paper, Typography, Button, TextField, Stack, Alert, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { analyzeFiscalHealth } from '../Services/aiService';

const AnalysisPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await analyzeFiscalHealth(formData);
      setResult(response.data);
    } catch (error) {
      alert('Error durante el análisis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          AI Fiscal Analyzer
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Los nombres de los inputs deben coincidir con los del ai_router.py */}
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
              Upload Tax Status (CSF) *
              <input name="tax_status_cert" type="file" hidden required accept=".pdf" />
            </Button>

            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
              Compliance Opinion *
              <input name="compliance_opinion" type="file" hidden required accept=".pdf" />
            </Button>

            <Button variant="text" component="label" startIcon={<CloudUploadIcon />}>
              Bylaws (Optional)
              <input name="bylaws" type="file" hidden accept=".pdf" />
            </Button>

            <TextField name="employees" label="Number of Employees" fullWidth />
            <TextField name="location" label="Location" fullWidth />
            <TextField name="additional_context" label="Extra Context for AI" multiline rows={3} fullWidth />

            <Button type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? 'Analyzing documents...' : 'Start AI Analysis'}
            </Button>
          </Stack>
        </form>

        {result && (
          <Box sx={{ mt: 4 }}>
            <Alert severity={result.compliance_status === 'POSITIVE' ? 'success' : 'error'}>
              Compliance Status: {result.compliance_status}
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