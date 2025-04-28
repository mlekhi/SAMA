import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function ResultsSummary() {
  const [logs, setLogs] = useState([]);  // State to hold the logs data
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch data from the backend API when the component mounts
    fetch('http://127.0.0.1:5000/get_logs')
      .then((response) => response.json())  // Parse the JSON response
      .then((data) => setLogs(data))  // Update the state with the fetched data
      .catch((error) => console.error('Error fetching logs:', error));
  }, []);

  const handleNext = () => {
    window.scrollTo(0, 0);
    navigate('/timeseries'); 
  };

  return (
    <div style={{ marginLeft: '220px', padding: '20px' }}>
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Results: Summary
        </Typography>
        {/* <Typography variant="body1" sx={{ mb: 3 }}>
          <i>
            Backend text output in a beautiful graphical manner.
          </i>
        </Typography> */}

        {/* Display each log entry dynamically */}
        <Box sx={{ mb: 3 }}>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <Typography key={index} variant="body1">
                {log}
              </Typography>
            ))
          ) : (
            <Typography variant="body1">Loading...</Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '300px', mt: 4 }}>
          <Button
            variant="contained"
            sx={{
              minWidth: 100,
              backgroundColor: '#5A3472',
              '&:hover': { backgroundColor: '#4A2D61' },
              color: 'white',
            }}
            onClick={handleNext}
          >
            Next
          </Button>
        </Box>
      </Box>
    </div>
  );
}

export default ResultsSummary;
