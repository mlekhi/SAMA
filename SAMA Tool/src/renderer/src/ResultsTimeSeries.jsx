import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function ResultsTimeSeries() {
  const navigate = useNavigate();
  const [csvData, setCsvData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/csv_data')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load CSV data');
        }
        return response.json();
      })
      .then((data) => {
        setCsvData(data);
      })
      .catch((err) => {
        setError(err.message);
        console.error(err);
      });
  }, []);

  const handleNext = () => {
    window.scrollTo(0, 0);
    navigate('/graphs');
  };

  const handlePrev = () => {
    window.scrollTo(0, 0);
    navigate('/summary');  
  };

  return (
    <div style={{ marginLeft: '220px', padding: '20px' }}>
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Results: Time Series
        </Typography>

        {error && (
          <Typography variant="body1" color="error" sx={{ mb: 3 }}>
            {error}
          </Typography>
        )}

        {csvData.length > 0 ? (
          <Box
            sx={{
              overflowX: 'auto',
              marginTop: '20px',
              maxHeight: '400px',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '12px',
                height: '12px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#555',
              },
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {Object.keys(csvData[0]).map((key) => (
                    <th
                      key={key}
                      style={{
                        border: '1px solid #ddd',
                        padding: '10px 15px',
                        position: 'sticky',
                        top: 0,
                        backgroundColor: '#5A3472',
                        color: 'white',
                        zIndex: 1,
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, idx) => (
                      <td
                        key={idx}
                        style={{
                          border: '1px solid #ddd',
                          padding: '10px 15px',
                          textAlign: 'center',
                          backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff',
                        }}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        ) : (
          <Typography variant="body1">Loading CSV Data...</Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '300px', mt: 4 }}>
        <Button
            variant="contained"
            sx={{
              minWidth: 100,
              backgroundColor: '#5A3472',
              '&:hover': { backgroundColor: '#4A2D61' },
              color: 'white',
            }}
            onClick={handlePrev}
          >
            Previous
          </Button>
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

export default ResultsTimeSeries;
