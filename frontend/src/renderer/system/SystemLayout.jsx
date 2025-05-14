import React from 'react';
import { Box, Grid2, Typography, CircularProgress, Alert } from '@mui/material';

const SystemLayout = ({
  title,
  subtitle,
  children,
  loading = false,
  error = null,
  onNext,
  onBack,
  nextDisabled = false,
  backDisabled = false,
  nextText = 'Next',
  backText = 'Back'
}) => {
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3, ml: '250px' }}>
      <Grid2 container direction="column" spacing={3}>
        {/* Header Section */}
        <Grid2 item>
          <Typography variant="h5" component="h2" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              <i>{subtitle}</i>
            </Typography>
          )}
        </Grid2>

        {/* Error Alert */}
        {error && (
          <Grid2 item>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Grid2>
        )}

        {/* Loading State */}
        {loading && (
          <Grid2 item sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Grid2>
        )}

        {/* Main Content */}
        <Grid2 item>
          {children}
        </Grid2>

        {/* Navigation Buttons */}
        <Grid2 item sx={{ mt: 4 }}>
          <Grid2 container spacing={2} justifyContent="flex-end">
            <Grid2 item>
              <Button
                variant="outlined"
                onClick={onBack}
                disabled={backDisabled || loading}
              >
                {backText}
              </Button>
            </Grid2>
            <Grid2 item>
              <Button
                variant="contained"
                onClick={onNext}
                disabled={nextDisabled || loading}
              >
                {nextText}
              </Button>
            </Grid2>
          </Grid2>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default SystemLayout; 