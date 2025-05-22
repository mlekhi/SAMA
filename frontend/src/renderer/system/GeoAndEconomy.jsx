import React, { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Container
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Search from '@components/Search';
import Map from '@components/Map';
import SystemButton from '@components/form/NextButton';
import FormInputField from '@components/form/FormInputField';
import ErrorMessage from '@components/form/ErrorMessage';
import { API_URL } from "@utils/config"; 
import Navigation from '@components/Navigation';

function GeoAndEconomy() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectPosition, setSelectPosition] = useState(null);
  const [defaults, setDefaults] = useState(null);
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

        console.log("Fetching defaults from /api/get");
        const response = await fetch(`${API_URL}/api/get`);
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          throw new Error(errorData.error || 'Failed to fetch defaults');
        }
        const data = await response.json();
        console.log("Received data:", data);
        setDefaults(data);
        
        // Set form data with backend defaults from geo_economy section
        const geoEconomyData = data.geo_economy || {};
        console.log("Geo economy data:", geoEconomyData);
        
        setFormData({
            nomDiscRate: geoEconomyData.nomDiscRate?.toString() || '',
            expInfRate: geoEconomyData.expInfRate?.toString() || '',
            equipSalePercent: geoEconomyData.equipSalePercent?.toString() || '',
            invTaxCredit: geoEconomyData.invTaxCredit?.toString() || ''
        });

        // If we have coordinates in the data, set the position
        if (data.latitude && data.longitude) {
            setSelectPosition({
                lat: parseFloat(data.latitude),
                lng: parseFloat(data.longitude)
            });
        }

        setIsConfigLoaded(true);
      } catch (error) {
        console.error('Error fetching defaults:', error);
        setErrorDialog({
          open: true,
          title: 'Error Loading Defaults',
          message: error.message || 'Failed to load default values. Please try again.'
        });
      }
    };
    fetchDefaults();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsUsingDefaults(prev => ({ ...prev, [name]: false }));
  };

  const handleNext = async () => {
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
        throw new Error("No session ID found");
      }

      // Prepare the data using the new field names from the backend
      const geoEconomyData = {
        session_id: sessionId,
        n_ir_rate: parseFloat(formData.nomDiscRate) || 0,
        e_ir_rate: parseFloat(formData.expInfRate) || 0,
        Tax_rate: parseFloat(formData.equipSalePercent) || 0,
        RE_incentives_rate: parseFloat(formData.invTaxCredit) || 0,
        latitude: selectPosition.lat,
        longitude: selectPosition.lng
      };

      const response = await fetch(`${API_URL}/api/component/geography_economy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geoEconomyData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save geography and economy data");
      }

      const result = await response.json();
      localStorage.setItem("geoEconomyId", result.id);
      navigate("/optim");
    } catch (err) {
      setErrorDialog({
        open: true,
        title: 'Error Saving Data',
        message: err.message || 'Failed to save your data. Please try again.'
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
      latitude: selectPosition.lat,
      longitude: selectPosition.lng,
      discountRate: formData.equipSalePercent,
      projectLifetime: defaults?.system_config?.lifetime?.toString() || '',
      capitalCost: '1000', // Default value
      replacementCost: '1000', // Default value
      OMCost: '10' // Default value
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
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navigation />
      <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 6 }}>
        <Typography variant="h5" gutterBottom>
          Geography and Economy
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={4}>
          <i>Default values are loaded. Modify as needed for accuracy.</i>
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box>
            <Search selectPosition={selectPosition} setSelectPosition={setSelectPosition} />
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
              isDefault={isUsingDefaults.nomDiscRate}
            />
            <FormInputField
              label="Expected Inflation Rate"
              name="expInfRate"
              value={formData.expInfRate}
              onChange={handleChange}
              isDefault={isUsingDefaults.expInfRate}
            />
            <FormInputField
              label="Equipment Sale Tax Percentage"
              name="equipSalePercent"
              value={formData.equipSalePercent}
              onChange={handleChange}
              isDefault={isUsingDefaults.equipSalePercent}
            />
            <FormInputField
              label="Investment Tax Credit (ITC)"
              name="invTaxCredit"
              value={formData.invTaxCredit}
              onChange={handleChange}
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
      </Container>
    </Box>
  );
}

export default GeoAndEconomy;
