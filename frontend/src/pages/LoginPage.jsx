import React, { useState, useContext, useEffect } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Stack, Checkbox, FormControlLabel, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../services/apiClient';

const LoginPage = () => {
  const { token, login } = useContext(AuthContext);
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // Estado para el Checkbox
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const params = new URLSearchParams();
    params.append('username', usernameInput.trim());
    params.append('password', password);
    // Nota: Aquí en el futuro puedes usar la variable "rememberMe" para guardar el login en localStorage en lugar de sessionStorage.

    try {
      const response = await apiClient.post('/api/v1/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      login(response.data, rememberMe);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-wrapper">
      <Card className="login-card" elevation={3}>
        <CardContent className="login-card-content">
          <Typography variant="h5" align="center" fontWeight="bold" gutterBottom color="primary.main">
            CFDI AI Analyzer
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" className="login-subtitle">
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

              {/* Nueva fila de opciones: Recordarme y Olvidaste la contraseña */}
              <Box className="login-options-row">
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)} 
                      color="primary"
                    />
                  }
                  label={<Typography variant="body2">Recordarme</Typography>}
                />
                <Link href="#" className="forgot-password-link">
                  ¿Olvidaste tu contraseña?
                </Link>
              </Box>

              {error && <Alert severity="error">{error}</Alert>}

              <Button 
                type="submit" 
                variant="flat" 
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