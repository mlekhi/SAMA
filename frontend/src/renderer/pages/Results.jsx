import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Results = () => {
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
        <Typography variant="h2" component="h1" gutterBottom>
          Results
        </Typography>
        <Typography variant="body1">
          Your system configuration results will be displayed here.
        </Typography>
      </Container>
    </Box>
  );
};

export default Results;
