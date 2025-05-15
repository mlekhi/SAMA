import React from 'react';
import { Button, CircularProgress } from '@mui/material';

function SystemButton({ 
  loading, 
  onClick, 
  label = "Next",
  disabled = false,
  color = "secondary"
}) {
  return (
    <Button
      variant="contained"
      color={color}
      onClick={onClick}
      disabled={loading || disabled}
      sx={{
        minWidth: 100,
        backgroundColor: '#5A3472',
        '&:hover': { backgroundColor: '#4A2D61' },
        color: 'white'
      }}
    >
      {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : label}
    </Button>
  );
}

export default SystemButton; 