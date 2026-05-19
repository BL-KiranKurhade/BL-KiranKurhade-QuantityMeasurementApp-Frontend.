import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, Button, Box, Alert, Tabs, Tab } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/api';

/**
 * UC20 - Auth Page
 * Concepts: Authentication, Session Management, State & Controlled Inputs,
 *           Event Handlers in JSX, Conditional Rendering.
 */
export default function AuthPage() {
  const { user, setUser } = useAuth();
  const [tab, setTab]       = useState(0);
  const [email, setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async () => {
    setError(''); setSuccess('');
    try {
      const res = await AuthService.login({ email, password });
      sessionStorage.setItem('qma_token', res.data.token);
      setUser({ email: res.data.email, name: res.data.name });
      setSuccess('Logged in successfully!');
    } catch {
      setError('Login failed. (Demo: API not running)');
      // Demo mode — simulate login
      setUser({ email, name: 'Demo User' });
      setSuccess('Demo login successful (API offline)');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('qma_token');
    setUser(null);
    setSuccess('Logged out.');
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {user ? `Welcome, ${user.name}` : 'Authentication'}
        </Typography>

        {user ? (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>Logged in as {user.email}</Alert>
            <Button variant="outlined" color="error" onClick={handleLogout}>Logout</Button>
          </Box>
        ) : (
          <>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
              <Tab label="Login" />
              <Tab label="Google OAuth2" />
            </Tabs>

            {tab === 0 && (
              <Box>
                <TextField fullWidth label="Email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)} sx={{ mb: 2 }} />
                <TextField fullWidth label="Password" type="password" value={password}
                  onChange={e => setPassword(e.target.value)} sx={{ mb: 2 }} />
                <Button variant="contained" fullWidth onClick={handleLogin}>Login</Button>
              </Box>
            )}

            {tab === 1 && (
              <Box textAlign="center" py={3}>
                <Typography color="text.secondary" gutterBottom>
                  Click below to authenticate with Google OAuth2
                </Typography>
                <Button variant="contained" size="large"
                  href="http://localhost:8081/oauth2/authorization/google"
                  sx={{ bgcolor: '#db4437', '&:hover': { bgcolor: '#c13b2e' } }}>
                  Sign in with Google
                </Button>
                <Typography variant="caption" display="block" mt={2} color="text.secondary">
                  Requires UC18 backend running on port 8081
                </Typography>
              </Box>
            )}
          </>
        )}

        {error   && <Alert severity="error"   sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      </CardContent>
    </Card>
  );
}
