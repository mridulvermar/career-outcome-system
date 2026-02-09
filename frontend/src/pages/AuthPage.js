import React, { useState } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Login,
  AppRegistration,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const MotionPaper = motion(Paper);

function AuthPage() {
  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (tab === 0) {
        // Login
        result = await login(formData.email, formData.password);
      } else {
        // Register
        if (!formData.name) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        result = await register(formData.name, formData.email, formData.password);
      }

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (e, newValue) => {
    setTab(newValue);
    setError('');
  };

  return (
    <Container maxWidth={false} disableGutters sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <MotionPaper
        elevation={24}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        sx={{
          maxWidth: 450,
          width: '100%',
          p: 0,
          borderRadius: 4,
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.85)'
        }}
      >
        <Box sx={{
          background: 'linear-gradient(135deg, #6C63FF 0%, #4B45B2 100%)',
          p: 4,
          textAlign: 'center',
          color: 'white'
        }}>
          <Typography variant="h4" fontWeight="800" gutterBottom>
            Career AI
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Predict your future. Bridge the gap.
          </Typography>
        </Box>

        <Box p={4}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            centered
            sx={{
              mb: 3,
              '& .MuiTabs-indicator': { height: 3, borderRadius: 3 },
              '& .MuiTab-root': { fontWeight: 'bold' }
            }}
          >
            <Tab label="Login" icon={<Login fontSize="small" />} iconPosition="start" />
            <Tab label="Register" icon={<AppRegistration fontSize="small" />} iconPosition="start" />
          </Tabs>

          <AnimatePresence mode='wait'>
            <motion.div
              key={tab}
              initial={{ x: tab === 0 ? -20 : 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: tab === 0 ? 20 : -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                {tab === 1 && (
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    margin="normal"
                    required={tab === 1}
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                )}

                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  required
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  margin="normal"
                  required
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px 0 rgba(108, 99, 255, 0.4)',
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : (tab === 0 ? 'Login' : 'Create Account')}
                </Button>
              </form>
            </motion.div>
          </AnimatePresence>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {tab === 0
                ? "First time here?"
                : "Already part of the community?"}
              <Button
                onClick={() => setTab(tab === 0 ? 1 : 0)}
                sx={{ ml: 1, fontWeight: 'bold', textTransform: 'none' }}
              >
                {tab === 0 ? "Create an account" : "Log in"}
              </Button>
            </Typography>
          </Box>
        </Box>
      </MotionPaper>
    </Container>
  );
}

export default AuthPage;
