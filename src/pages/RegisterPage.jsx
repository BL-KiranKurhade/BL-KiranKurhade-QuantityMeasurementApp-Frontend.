import React, { useState } from 'react';
import {
  Container, Box, Paper, Typography, TextField,
  Button, Alert, Link, CircularProgress, Avatar, Divider,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form,     setForm]     = useState({ username: '', email: '', password: '', confirm: '' });
  const [error,    setError]    = useState('');
  const [fieldErr, setFieldErr] = useState({});

  const validate = () => {
    const e = {};
    if (!form.username || form.username.length < 3)
      e.username = 'Username must be at least 3 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Valid email required';
    if (!form.password || form.password.length < 6)
      e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm)
      e.confirm = 'Passwords do not match';
    setFieldErr(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setFieldErr(fe => ({ ...fe, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    const result = await register(form.username, form.email, form.password);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={4} sx={{ p: 4, width: '100%', borderRadius: 3 }}>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', mb: 1, width: 56, height: 56 }}>
              <PersonAddIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight={700}>Create Account</Typography>
            <Typography color="text.secondary">Join QMA — Quantity Measurement App</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth name="username" label="Username" margin="normal" required
              value={form.username} onChange={handleChange}
              error={!!fieldErr.username} helperText={fieldErr.username}
              autoFocus autoComplete="username"
            />
            <TextField
              fullWidth name="email" label="Email Address" type="email" margin="normal" required
              value={form.email} onChange={handleChange}
              error={!!fieldErr.email} helperText={fieldErr.email}
              autoComplete="email"
            />
            <TextField
              fullWidth name="password" label="Password" type="password" margin="normal" required
              value={form.password} onChange={handleChange}
              error={!!fieldErr.password} helperText={fieldErr.password}
              autoComplete="new-password"
            />
            <TextField
              fullWidth name="confirm" label="Confirm Password" type="password" margin="normal" required
              value={form.confirm} onChange={handleChange}
              error={!!fieldErr.confirm} helperText={fieldErr.confirm}
              autoComplete="new-password"
            />
            <Button
              type="submit" fullWidth variant="contained" size="large"
              sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" fontWeight={600}>Sign in</Link>
              </Typography>
            </Box>
          </Box>

        </Paper>
      </Box>
    </Container>
  );
}
