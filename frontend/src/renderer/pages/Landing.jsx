import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { API_URL } from "@utils/config";
import ErrorMessage from '@components/form/ErrorMessage';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(4),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[4],
}));

const Landing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    title: '',
    message: ''
  });

  const handleStart = async () => {
    setLoading(true);
    setErrorDialog({ open: false, title: '', message: '' });
    
    // Check if a session ID already exists
    const existingSessionId = localStorage.getItem("session_id");
    if (existingSessionId) {
      console.log('Existing session ID found:', existingSessionId);
      navigate('/geo');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting to connect to:', `${API_URL}/api/session/initialize`);
      
      const initRes = await fetch(`${API_URL}/api/session/initialize`, {
        method: "POST", 
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({}),
        credentials: 'include'
      }).catch(error => {
        console.error('Network error:', error);
        throw new Error(`Network error: ${error.message}. Please check if the backend server is running.`);
      });

      if (!initRes.ok) {
        const errorData = await initRes.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('Server error response:', errorData);
        throw new Error(errorData.error || `Server error: ${initRes.status} ${initRes.statusText}`);
      }

      const result = await initRes.json().catch(error => {
        console.error('Error parsing response:', error);
        throw new Error('Failed to parse server response');
      });

      console.log('Session initialization response:', result);
      
      if (!result.session_id) {
        throw new Error('No session ID received from server');
      }

      localStorage.setItem("session_id", result.session_id);
      console.log('Session ID stored:', result.session_id);
      
    navigate('/geo');
    } catch (err) {
      console.error("Failed to initialize session:", err);
      setErrorDialog({
        open: true,
        title: 'Connection Error',
        message: err.message || "Failed to connect to the server. Please check if the backend is running and try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFaq = () => {
    navigate('/faq');
  };

  const handleCloseError = () => {
    setErrorDialog(prev => ({ ...prev, open: false }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Container maxWidth="md">
        <StyledPaper elevation={3}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'secondary.main',
              mb: 4,
            }}
          >
            Welcome to SAMA
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ textAlign: 'center', mb: 4 }}
          >
            Solar Assessment and Management Application
          </Typography>

          <Typography
            variant="body1"
            paragraph
            sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.6 }}
          >
            SAMA is a comprehensive tool designed to help you assess and optimize solar energy systems. 
            Our application provides detailed analysis and recommendations for solar installations, 
            taking into account various factors such as:
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
              • Geographic location and environmental factors
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
              • Economic considerations and financial parameters
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
              • System configuration and optimization
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
              • Grid information and connection details
            </Typography>
          </Box>

          <Typography
            variant="body1"
            paragraph
            sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.6 }}
          >
            Get started by clicking the button below to begin.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleStart}
              disabled={loading}
              sx={{
                py: 2,
                px: 4,
                fontSize: '1.2rem',
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: 3,
                backgroundColor: 'secondary.main',
                '&:hover': {
                  backgroundColor: 'secondary.dark',
                  boxShadow: 6,
                },
                '&:disabled': {
                  backgroundColor: 'action.disabled',
                },
              }}
            >
              {loading ? 'Starting...' : 'Start Assessment'}
            </Button>
            <Button
              variant="text"
              onClick={handleFaq}
              disabled={loading}
              sx={{
                fontSize: '1rem',
                textTransform: 'none',
                color: 'text.secondary',
              }}
            >
              View FAQ
            </Button>
          </Box>
        </StyledPaper>
      </Container>

      <ErrorMessage
        open={errorDialog.open}
        onClose={handleCloseError}
        title={errorDialog.title}
        message={errorDialog.message}
      />
    </Box>
  );
};

export default Landing; 