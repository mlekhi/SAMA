import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, CircularProgress, Paper, Divider } from '@mui/material';
import { API_URL } from "@utils/config";
import Navigation from '@components/Navigation';

const Results = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [plots, setPlots] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const session_id = localStorage.getItem('session_id');
        if (!session_id) {
          setError("No session ID found. Please start from the beginning.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/results/${session_id}`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setLogs(data.logs || []);
          setPlots(data.plots || []);
        }
      } catch (err) {
        setError("Failed to fetch results: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
        <Navigation />
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Loading results...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
        <Navigation />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper sx={{ p: 3, bgcolor: '#ffebee' }}>
            <Typography variant="h5" color="error" gutterBottom>Error</Typography>
            <Typography variant="body1">{error}</Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>Analysis Results</Typography>
        
        {logs.length > 0 && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>Simulation Report</Typography>
            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, maxHeight: '300px', overflow: 'auto' }}>
              {logs.map((line, idx) => (
                <Typography key={idx} variant="body2" fontFamily="monospace" sx={{ whiteSpace: 'pre-wrap' }}>
                  {line}
                </Typography>
              ))}
            </Box>
          </Paper>
        )}
        
        {plots.length > 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Visualizations</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {plots.map((src, idx) => (
                <Box key={idx}>
                  <Typography variant="h6" gutterBottom>
                    {src.split('/').pop().replace('.png', '')}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <img 
                      src={`${API_URL}${src}`} 
                      alt={`Result visualization ${idx + 1}`} 
                      style={{ maxWidth: '100%', border: '1px solid #e0e0e0', borderRadius: '4px' }} 
                    />
                  </Box>
                  {idx < plots.length - 1 && <Divider sx={{ mt: 3 }} />}
                </Box>
              ))}
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default Results;