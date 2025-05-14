import React, { useState, useEffect } from "react";
import { Grid2, InputAdornment } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Search from '@components/Search';
import Map from '@components/Map';
import SystemLayout from './SystemLayout';
import SystemFormField from './SystemFormField';

function GeoAndEconomy() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectPosition, setSelectPosition] = useState(null);
  const [defaults, setDefaults] = useState(null);
  const [errors, setErrors] = useState({});

  // Default values from backend
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
        const response = await fetch('http://127.0.0.1:5000/api/defaults');
        if (!response.ok) throw new Error('Failed to fetch defaults');
        const data = await response.json();
        setDefaults(data);
        setFormData({
          nomDiscRate: data.nomDiscRate.toString(),
          expInfRate: data.expInfRate.toString(),
          equipSalePercent: data.equipSalePercent.toString(),
          invTaxCredit: data.invTaxCredit.toString()
        });
      } catch (error) {
        console.error('Error fetching defaults:', error);
      }
    };
    fetchDefaults();
  }, []);

  const validateField = (name, value) => {
    const numValue = parseFloat(value);
    if (!value || value.trim() === '') {
      return 'This field is required';
    }
    if (isNaN(numValue)) {
      return 'Must be a valid number';
    }
    if (numValue < 0) {
      return 'Value cannot be negative';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setIsUsingDefaults(prev => ({
      ...prev,
      [name]: false
    }));
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const geoResponse = await fetch("http://127.0.0.1:5000/process/geo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!geoResponse.ok) {
        throw new Error("Failed to save geography and economy data");
      }

      const geoResult = await geoResponse.json();
      localStorage.setItem('geoEconomyId', geoResult.id);
      window.scrollTo(0, 0);
      navigate('/system');
    } catch (error) {
      console.error("Error:", error);
      setErrors(prev => ({ ...prev, submit: 'Failed to save data. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <SystemLayout
      title="Geography and Economy"
      subtitle="Default values are provided for some questions, but please review and adjust as necessary for more accurate results."
      loading={loading}
      error={errors.submit}
      onNext={handleNext}
      onBack={handleBack}
    >
      <Grid2 container spacing={3}>
        <Grid2 item xs={12}>
          <Grid2 container sx={{ width: "500px" }} spacing={2}>
            <Grid2 item sx={{ width: "100%" }}>
              <Search selectPosition={selectPosition} setSelectPosition={setSelectPosition} />
              {errors.address && (
                <Typography color="error" variant="caption">
                  {errors.address}
                </Typography>
              )}
            </Grid2>
            <Grid2 item sx={{ width: "100%", height: "500px" }}>
              <Map selectPosition={selectPosition} />
            </Grid2>
          </Grid2>
        </Grid2>

        <Grid2 item xs={12}>
          <SystemFormField
            label="Enter the nominal discount rate:"
            name="nomDiscRate"
            value={formData.nomDiscRate}
            onChange={handleChange}
            type="number"
            required
            error={errors.nomDiscRate}
            endAdornment="%"
            isUsingDefault={isUsingDefaults.nomDiscRate}
          />
        </Grid2>

        <Grid2 item xs={12}>
          <SystemFormField
            label="Enter the expected inflation rate:"
            name="expInfRate"
            value={formData.expInfRate}
            onChange={handleChange}
            type="number"
            required
            error={errors.expInfRate}
            endAdornment="%"
            isUsingDefault={isUsingDefaults.expInfRate}
          />
        </Grid2>

        <Grid2 item xs={12}>
          <SystemFormField
            label="Enter the equipment sale percentage:"
            name="equipSalePercent"
            value={formData.equipSalePercent}
            onChange={handleChange}
            type="number"
            required
            error={errors.equipSalePercent}
            endAdornment="%"
            isUsingDefault={isUsingDefaults.equipSalePercent}
          />
        </Grid2>

        <Grid2 item xs={12}>
          <SystemFormField
            label="Enter the investment tax credit:"
            name="invTaxCredit"
            value={formData.invTaxCredit}
            onChange={handleChange}
            type="number"
            required
            error={errors.invTaxCredit}
            endAdornment="%"
            isUsingDefault={isUsingDefaults.invTaxCredit}
          />
        </Grid2>
      </Grid2>
    </SystemLayout>
  );
}

export default GeoAndEconomy;