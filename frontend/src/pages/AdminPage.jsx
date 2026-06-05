import React, { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Stack, MenuItem } from '@mui/material';
import apiClient from '../services/apiClient';

const AdminPage = () => {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('cliente');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      await apiClient.post('/api/v1/auth/create-user', {
        username: newUsername.trim(),
        password: newPassword,
        role: newRole
      });
      
      setStatusMsg({ type: 'success', text: `Usuario ${newUsername} registrado exitosamente.` });
      setNewUsername('');
      setNewPassword('');
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.detail || 'Error al crear el usuario' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={600} mx="auto" mt={{ xs: 2, sm: 5 }} px={{ xs: 2, sm: 3 }}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
            Panel de Administración
          </Typography>
          {/* ... el resto del formulario ... */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Registra nuevos usuarios autorizados en el sistema.
          </Typography>

          <form onSubmit={handleCreateUser}>
            <Stack spacing={3}>
              <TextField 
                label="Nombre de Usuario" 
                fullWidth 
                required 
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
              <TextField 
                label="Contraseña" 
                type="text" // Texto plano para que el admin pueda copiar la credencial inicial generada
                fullWidth 
                required 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <TextField
                select
                label="Rol asignado"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                fullWidth
              >
                <MenuItem value="cliente">Cliente (5 Análisis)</MenuItem>
                <MenuItem value="admin">Administrador (Gestión total)</MenuItem>
              </TextField>

              {statusMsg.text && <Alert severity={statusMsg.type}>{statusMsg.text}</Alert>}

              <Button type="submit" variant="gradient" size="large" disabled={loading}>
                {loading ? 'Registrando...' : 'Generar Cuenta'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminPage;