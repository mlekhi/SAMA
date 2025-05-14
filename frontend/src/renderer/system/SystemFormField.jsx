import React from 'react';
import { TextField, FormControl, Typography, InputAdornment } from '@mui/material';

const SystemFormField = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  error = '',
  helperText = '',
  endAdornment = null,
  isUsingDefault = false,
  fullWidth = true,
  sx = {}
}) => {
  return (
    <FormControl fullWidth={fullWidth} sx={{ mb: 2, ...sx }}>
      <Typography variant="body1" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <TextField
        value={value}
        name={name}
        onChange={onChange}
        type={type}
        variant="outlined"
        required={required}
        error={!!error}
        helperText={error || helperText}
        InputProps={{
          endAdornment: endAdornment ? (
            <InputAdornment position="end">{endAdornment}</InputAdornment>
          ) : null,
          sx: isUsingDefault ? { color: 'text.secondary' } : {}
        }}
      />
    </FormControl>
  );
};

export default SystemFormField; 