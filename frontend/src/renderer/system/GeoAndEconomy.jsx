import React, { useState, useEffect } from "react";
import {
  TextField, Button, InputAdornment, FormControl,
  Box, Typography, CircularProgress, Alert, Grid
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Search from '@components/Search';
import Map from '@components/Map';
import { API_URL } from "@utils/config"; 

const GeoInputField = ({ label, name, value, onChange, error, helperText, isDefault }) => (
  <FormControl fullWidth sx={{ mt: 2 }}>
    <Typography>{label}</Typography>
    <TextField
      name={name}
      value={value}
      onChange={onChange}
      type="number"
      label={label}
      variant="outlined"
      required
      error={!!error}
      helperText={helperText}
      InputProps={{
        endAdornment: <InputAdornment position="end">%</InputAdornment>,
        sx: isDefault ? { color: 'text.secondary' } : {}
      }}
    />
  </FormControl>
);

function GeoAndEconomy() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectPosition, setSelectPosition] = useState(null);
  const [defaults, setDefaults] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    nomDiscRate: '',
    expInfRate: '',
    equipSalePercent: '',
    invTaxCredit: ''
  });

  const [isUsingDefaults, setIsUsingDefaults] = useState({
    nomDiscRate: true,
    expInfRate: true,
    equipSalePercent: true,
    invTaxCredit: true
  });

  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const res = await fetch(`${API_URL}/api/defaults`);
        const data = await res.json();
        setDefaults(data);
        setFormData({
          nomDiscRate: data.nomDiscRate.toString(),
          expInfRate: data.expInfRate.toString(),
          equipSalePercent: data.equipSalePercent.toString(),
          invTaxCredit: data.invTaxCredit.toString()
        });
      } catch (err) {
        console.error("Failed to fetch defaults", err);
      }
    };
    fetchDefaults();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsUsingDefaults(prev => ({ ...prev, [name]: false }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateField = (name, value) => {
    const num = parseFloat(value);
    if (!value.trim()) return "This field is required";
    if (isNaN(num)) return "Must be a valid number";
    if (num < 0) return "Value cannot be negative";
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const initRes = await fetch(`${API_URL}/api/session/initialize`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      if (!initRes.ok) throw new Error("Session init failed");
      const { session_id } = await initRes.json();
      localStorage.setItem("session_id", session_id);

      const geoRes = await fetch(`${API_URL}/process/geo`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, session_id })
      });

      if (!geoRes.ok) throw new Error("Geo save failed");
      const geoResult = await geoRes.json();
      localStorage.setItem("geoEconomyId", geoResult.id);

      navigate("/system");
    } catch (err) {
      console.error(err);
      setErrors(prev => ({ ...prev, submit: "Failed to save data. Try again." }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, ml: '250px' }}>
      <Typography variant="h5" gutterBottom>
        Geography and Economy
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        <i>Default values are loaded. Modify as needed for accuracy.</i>
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Search selectPosition={selectPosition} setSelectPosition={setSelectPosition} />
          {errors.address && <Typography color="error">{errors.address}</Typography>}
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 400 }}>
            <Map selectPosition={selectPosition} />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <GeoInputField
            label="Nominal Discount Rate"
            name="nomDiscRate"
            value={formData.nomDiscRate}
            onChange={handleChange}
            error={errors.nomDiscRate}
            helperText={errors.nomDiscRate}
            isDefault={isUsingDefaults.nomDiscRate}
          />
          <GeoInputField
            label="Expected Inflation Rate"
            name="expInfRate"
            value={formData.expInfRate}
            onChange={handleChange}
            error={errors.expInfRate}
            helperText={errors.expInfRate}
            isDefault={isUsingDefaults.expInfRate}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <GeoInputField
            label="Equipment Sale Tax Percentage"
            name="equipSalePercent"
            value={formData.equipSalePercent}
            onChange={handleChange}
            error={errors.equipSalePercent}
            helperText={errors.equipSalePercent}
            isDefault={isUsingDefaults.equipSalePercent}
          />
          <GeoInputField
            label="Investment Tax Credit (ITC)"
            name="invTaxCredit"
            value={formData.invTaxCredit}
            onChange={handleChange}
            error={errors.invTaxCredit}
            helperText={errors.invTaxCredit}
            isDefault={isUsingDefaults.invTaxCredit}
          />
        </Grid>

        {errors.submit && (
          <Grid item xs={12}>
            <Alert severity="error">{errors.submit}</Alert>
          </Grid>
        )}

        <Grid item xs={12}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Next"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default GeoAndEconomy;
