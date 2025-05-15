import React, { useState, useEffect } from "react";
import {
  Box, Typography, Grid
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Search from '@components/Search';
import Map from '@components/Map';
import SystemButton from '@components/form/NextButton';
import FormInputField from '@components/form/FormInputField';
import ErrorMessage from '@components/form/ErrorMessage';
import { API_URL } from "@utils/config"; 

function GeoAndEconomy() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectPosition, setSelectPosition] = useState(null);
  const [defaults, setDefaults] = useState(null);
  const [errors, setErrors] = useState({});
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    title: '',
    message: ''
  });

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

  const [myData, setMyData] = useState({
    latitude: '',
    longitude: '',
    discountRate: '',
    projectLifetime: '',
    capitalCost: '',
    replacementCost: '',
    OMCost: ''
  });

  const [selectedSystems, setSelectedSystems] = useState([]);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const sessionId = localStorage.getItem("session_id");
        if (!sessionId) {
          console.error("No session ID found");
          return;
        }

        const response = await fetch(`${API_URL}/api/defaults`);
        if (!response.ok) throw new Error('Failed to fetch defaults');
        const data = await response.json();
        
        // Set form data with backend defaults
        setMyData({
          latitude: data.latitude?.toString() || '',
          longitude: data.longitude?.toString() || '',
          discountRate: data.discount_rate?.toString() || '',
          projectLifetime: data.project_lifetime?.toString() || '',
          capitalCost: '1000', // Default cost
          replacementCost: '1000', // Default cost
          OMCost: '10' // Default cost
        });

        // Get system config
        const configResponse = await fetch(`${API_URL}/get/routing`);
        const configData = await configResponse.json();
        setSelectedSystems(configData["Energy Systems"]);
        setIsConfigLoaded(true);
      } catch (error) {
        console.error('Error fetching defaults:', error);
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
    if (!validateForm()) {
      setErrorDialog({
        open: true,
        title: 'Validation Error',
        message: 'Please fix the errors in the form before proceeding.'
      });
      return;
    }

    if (!selectPosition) {
      setErrorDialog({
        open: true,
        title: 'Location Required',
        message: 'Please select a location on the map before proceeding.'
      });
      return;
    }

    setLoading(true);

    try {
      const sessionId = localStorage.getItem("session_id");
      if (!sessionId) {
        console.error("No session ID found");
        return;
      }

      const geoRes = await fetch(`${API_URL}/process/geo`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          session_id: sessionId,
          latitude: selectPosition.lat,
          longitude: selectPosition.lng
        })
      });

      if (!geoRes.ok) throw new Error("Failed to save geography and economy data");
      const geoResult = await geoRes.json();
      localStorage.setItem("geoEconomyId", geoResult.id);

      navigate("/system");
    } catch (err) {
      console.error(err);
      setErrorDialog({
        open: true,
        title: 'Error Saving Data',
        message: 'Failed to save your data. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseError = () => {
    setErrorDialog(prev => ({ ...prev, open: false }));
  };

  const sendComponentInfo = async () => {
    const sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
      console.error("No session ID found");
      return;
    }

    const Geo_Data = {
      latitude: myData.latitude,
      longitude: myData.longitude,
      discountRate: myData.discountRate,
      projectLifetime: myData.projectLifetime,
      capitalCost: myData.capitalCost,
      replacementCost: myData.replacementCost,
      OMCost: myData.OMCost
    };

    try {
      console.log(Geo_Data);
      const response = await fetch(`${API_URL}/geo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(Geo_Data)
      });

      const result = await response.json();
      console.log('Response from server:', result);
    } catch (error) {
      console.error('Error sending geo info:', error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, ml: '250px', maxWidth: '800px' }}>
      <Typography variant="h5" gutterBottom>
        Geography and Economy
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        <i>Default values are loaded. Modify as needed for accuracy.</i>
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Box>
          <Search selectPosition={selectPosition} setSelectPosition={setSelectPosition} />
          {errors.address && <Typography color="error">{errors.address}</Typography>}
        </Box>

        <Box sx={{ height: 400 }}>
          <Map selectPosition={selectPosition} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormInputField
            label="Nominal Discount Rate"
            name="nomDiscRate"
            value={formData.nomDiscRate}
            onChange={handleChange}
            error={errors.nomDiscRate}
            helperText={errors.nomDiscRate}
            isDefault={isUsingDefaults.nomDiscRate}
          />
          <FormInputField
            label="Expected Inflation Rate"
            name="expInfRate"
            value={formData.expInfRate}
            onChange={handleChange}
            error={errors.expInfRate}
            helperText={errors.expInfRate}
            isDefault={isUsingDefaults.expInfRate}
          />
          <FormInputField
            label="Equipment Sale Tax Percentage"
            name="equipSalePercent"
            value={formData.equipSalePercent}
            onChange={handleChange}
            error={errors.equipSalePercent}
            helperText={errors.equipSalePercent}
            isDefault={isUsingDefaults.equipSalePercent}
          />
          <FormInputField
            label="Investment Tax Credit (ITC)"
            name="invTaxCredit"
            value={formData.invTaxCredit}
            onChange={handleChange}
            error={errors.invTaxCredit}
            helperText={errors.invTaxCredit}
            isDefault={isUsingDefaults.invTaxCredit}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
          <SystemButton 
            loading={loading}
            onClick={handleNext}
          />
        </Box>
      </Box>

      <ErrorMessage
        open={errorDialog.open}
        onClose={handleCloseError}
        title={errorDialog.title}
        message={errorDialog.message}
      />
    </Box>
  );
}

export default GeoAndEconomy;
