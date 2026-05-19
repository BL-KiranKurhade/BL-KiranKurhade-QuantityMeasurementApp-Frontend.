import React, { useState } from 'react';
import {
  Container, Box, Paper, Typography, TextField,
  Button, Alert, Link, CircularProgress, Avatar,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [form,  setForm]  = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) navigate('/dashboard');
    else setError(result.message || 'Login failed. Check your email and password.');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={4} sx={{ p: 4, width: '100%', borderRadius: 3 }}>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mb: 1, width: 56, height: 56 }}>
              <LockOutlinedIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight={700}>Welcome Back</Typography>
            <Typography color="text.secondary">Sign in to QMA</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth name="email" label="Email Address" type="email"
              margin="normal" required autoFocus autoComplete="email"
              value={form.email} onChange={handleChange}
            />
            <TextField
              fullWidth name="password" label="Password" type="password"
              margin="normal" required autoComplete="current-password"
              value={form.password} onChange={handleChange}
            />
            <Button
              type="submit" fullWidth variant="contained" size="large"
              sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link component={RouterLink} to="/register" fontWeight={600}>Sign up</Link>
            </Typography>
          </Box>

        </Paper>
      </Box>
    </Container>
  );
}
