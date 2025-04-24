import React from 'react'
import { Box, Typography, Button, Divider } from '@mui/material'
import { useNavigate } from "react-router-dom";

function ResultsGraphs() {
    const navigate = useNavigate();
  const images = {
    costs: [
      'Grid Hourly Cost.png',
      'Daily-Monthly-Yearly average cost of energy system.png',
      'Daily-Monthly-Yearly average cost of only grid-connected system.png',
      'Daily-Monthly-Yearly average earning Sell to the Grid.png',
      'Daily-Monthly-Yearly average hourly cost of connecting to the grid.png'
    ],
    cashflow: ['Cash Flow.png', 'Cash Flow_ADV.png'],
    electrical: ['Energy Distribution.png', 'Battery State of Charge.png'],
    grid: ['Grid Interconnection.png'],
    optimization: ['Optimization.png'],
    custom: ['Specific day results.png']
  }

  const backendUrl = 'http://127.0.0.1:5000/image/'

  // Function to handle image error and fallback
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/500?text=Image+Not+Available'
  }

  const handlePrev = () => {
    window.scrollTo(0, 0);
    navigate('/timeseries'); 
  };

  return (
    <div style={{ marginLeft: '220px', padding: '20px' }}>
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Results: Graphs
        </Typography>

        {/* Costs */}
        <Typography variant="body1" sx={{ mb: 3 }}>
          <i>Costs:</i>
        </Typography>
        {images.costs.map((img, index) => (
          <Box key={`costs-${index}`} sx={{ marginBottom: '20px', textAlign: 'center' }}>
            <img
              src={`${backendUrl}${encodeURIComponent(img)}`} // Fetch image from Flask backend
              alt={img}
              onError={handleImageError} // Handle image error
              style={{ display: 'block', margin: '0 auto', width: '100%', maxWidth: '500px', height: 'auto' }}
            />
            <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
              <i>Figure {index + 1}: {img}</i> {/* Figure X: Label */}
            </Typography>
          </Box>
        ))}
        <Divider sx={{ my: 4 }} />

        {/* Cashflow */}
        <Typography variant="body1" sx={{ mb: 3 }}>
          <i>Cashflow:</i>
        </Typography>
        {images.cashflow.map((img, index) => (
          <Box key={`cashflow-${index}`} sx={{ textAlign: 'center' }}>
            <img
              src={`${backendUrl}${encodeURIComponent(img)}`}
              alt={img}
              onError={handleImageError}
              style={{ display: 'block', margin: '0 auto', width: '100%', maxWidth: '500px', height: 'auto' }}
            />
            <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
              <i>Figure {index + 1}: {img}</i>
            </Typography>
          </Box>
        ))}
        <Divider sx={{ my: 4 }} />

        {/* Electrical */}
        <Typography variant="body1" sx={{ mb: 3 }}>
          <i>Electrical:</i>
        </Typography>
        {images.electrical.map((img, index) => (
          <Box key={`electrical-${index}`} sx={{ textAlign: 'center' }}>
            <img
              src={`${backendUrl}${encodeURIComponent(img)}`}
              alt={img}
              onError={handleImageError}
              style={{ display: 'block', margin: '0 auto', width: '100%', maxWidth: '500px', height: 'auto' }}
            />
            <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
              <i>Figure {index + 1}: {img}</i>
            </Typography>
          </Box>
        ))}
        <Divider sx={{ my: 4 }} />

        {/* Grid */}
        <Typography variant="body1" sx={{ mb: 3 }}>
          <i>Grid:</i>
        </Typography>
        {images.grid.map((img, index) => (
          <Box key={`grid-${index}`} sx={{ textAlign: 'center' }}>
            <img
              src={`${backendUrl}${encodeURIComponent(img)}`}
              alt={img}
              onError={handleImageError}
              style={{ display: 'block', margin: '0 auto', width: '100%', maxWidth: '500px', height: 'auto' }}
            />
            <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
              <i>Figure {index + 1}: {img}</i>
            </Typography>
          </Box>
        ))}
        <Divider sx={{ my: 4 }} />

        {/* Optimization */}
        <Typography variant="body1" sx={{ mb: 3 }}>
          <i>Optimization:</i>
        </Typography>
        {images.optimization.map((img, index) => (
          <Box key={`optimization-${index}`} sx={{ textAlign: 'center' }}>
            <img
              src={`${backendUrl}${encodeURIComponent(img)}`}
              alt={img}
              onError={handleImageError}
              style={{ display: 'block', margin: '0 auto', width: '100%', maxWidth: '500px', height: 'auto' }}
            />
            <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
              <i>Figure {index + 1}: {img}</i>
            </Typography>
          </Box>
        ))}
        <Divider sx={{ my: 4 }} />

        {/* Custom */}
        <Typography variant="body1" sx={{ mb: 3 }}>
          <i>Custom:</i>
        </Typography>
        {images.custom.map((img, index) => (
          <Box key={`custom-${index}`} sx={{ textAlign: 'center' }}>
            <img
              src={`${backendUrl}${encodeURIComponent(img)}`}
              alt={img}
              onError={handleImageError}
              style={{ display: 'block', margin: '0 auto', width: '100%', maxWidth: '500px', height: 'auto' }}
            />
            <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
              <i>Figure {index + 1}: {img}</i>
            </Typography>
          </Box>
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '300px', mt: 4 }}>
          <Button
            variant="contained"
            sx={{
              minWidth: 100,
              backgroundColor: '#5A3472',
              '&:hover': { backgroundColor: '#4A2D61' },
              color: 'white'
            }}
            onClick={handlePrev}
          >
            Previous
          </Button>
           {/* <Button
            variant="contained"
            sx={{
              minWidth: 100,
              backgroundColor: '#5A3472',
              '&:hover': { backgroundColor: '#4A2D61' },
              color: 'white'
            }}
          >
            Next
          </Button> */}
        </Box>
      </Box>
    </div>
  )
}

export default ResultsGraphs
