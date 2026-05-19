import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';
import LogoutIcon  from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth }     from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <AppBar
      position="sticky"
      elevation={2}
      sx={{ background: '#4361EE', boxShadow: '0 2px 12px rgba(67,97,238,0.35)' }}
    >
      <Toolbar sx={{ position: 'relative', minHeight: 56 }}>

        {/* Centered title */}
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#ffffff',
            whiteSpace: 'nowrap',
            letterSpacing: '0.01em',
          }}
        >
          Welcome To Quantity Measurement
        </Typography>

        {/* Right side — user + logout */}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isLoggedIn ? (
            <>
              <Avatar
                sx={{
                  width: 30, height: 30, fontSize: '0.8rem', fontWeight: 700,
                  background: 'rgba(255,255,255,0.25)',
                  color: '#fff',
                }}
              >
                {(user?.username || 'U')[0].toUpperCase()}
              </Avatar>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255,255,255,0.85)', display: { xs: 'none', sm: 'block' } }}
              >
                {user?.username}
              </Typography>
              <Button
                startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
                onClick={handleLogout}
                size="small"
                sx={{
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.35)',
                  borderRadius: 1.5,
                  px: 1.5,
                  fontSize: '0.8rem',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.6)',
                  },
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                onClick={() => navigate('/login')}
                sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#fff' } }}
              >
                Login
              </Button>
              <Button
                onClick={() => navigate('/register')}
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff', borderRadius: 1.5, px: 2,
                  '&:hover': { background: 'rgba(255,255,255,0.3)' },
                }}
              >
                Register
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
