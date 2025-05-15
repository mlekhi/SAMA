import React from 'react';
import { TextField, InputAdornment, FormControl, Typography } from "@mui/material";

function FormInputField({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  helperText, 
  isDefault,
  type = "number",
  endAdornment = "%",
  required = true,
  variant = "outlined"
}) {
  return (
    <FormControl fullWidth sx={{ mt: 3 }}>
      <Typography sx={{ mb: 1, fontWeight: 500 }}>{label}</Typography>
      <TextField
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        label={label}
        variant={variant}
        required={required}
        error={!!error}
        helperText={helperText}
        InputProps={{
          endAdornment: endAdornment ? <InputAdornment position="end">{endAdornment}</InputAdornment> : null,
          sx: isDefault ? { color: 'text.secondary' } : {}
        }}
      />
    </FormControl>
  );
}

export default FormInputField; 