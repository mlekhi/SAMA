import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(4),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[4],
}));

const Landing = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/geo');
  };

  const handleFaq = () => {
    navigate('/faq');
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
              color: '#1976d2',
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
            Get started by clicking the button below to begin your solar assessment journey.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleStart}
              sx={{
                py: 2,
                px: 4,
                fontSize: '1.2rem',
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 6,
                },
              }}
            >
              Start Assessment
            </Button>
            <Button
              variant="text"
              onClick={handleFaq}
              sx={{
                fontSize: '1rem',
                textTransform: 'none',
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              View FAQ
            </Button>
          </Box>
        </StyledPaper>
      </Container>
    </Box>
  );
};

export default Landing; 