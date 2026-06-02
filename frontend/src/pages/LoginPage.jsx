import React, { useState, useContext, useEffect } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../services/apiClient';

const LoginPage = () => {
  const { token, login } = useContext(AuthContext);
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Si el usuario ya tiene sesión activa, redirigir automáticamente al panel de análisis
  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // FastAPI OAuth2 requiere los parámetros en formato Form URL Encoded
    const params = new URLSearchParams();
    params.append('username', usernameInput.trim());
    params.append('password', password);

    try {
      const response = await apiClient.post('/api/v1/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      login(response.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" px={2}>
      <Card sx={{ maxWidth: 420, width: '100%', backdropFilter: 'blur(16px)', borderRadius: 4, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" align="center" fontWeight="bold" gutterBottom color="primary.main">
            CFDI AI Analyzer
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Inicia sesión para gestionar tus análisis fiscales
          </Typography>

          <form onSubmit={handleFormSubmit}>
            <Stack spacing={3}>
              <TextField 
                label="Usuario" 
                variant="outlined" 
                fullWidth 
                required 
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
              />
              <TextField 
                label="Contraseña" 
                type="password" 
                variant="outlined" 
                fullWidth 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && <Alert severity="error">{error}</Alert>}

              <Button 
                type="submit" 
                variant="gradient" 
                fullWidth 
                size="large" 
                disabled={loading}
              >
                {loading ? 'Verificando...' : 'Ingresar'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;