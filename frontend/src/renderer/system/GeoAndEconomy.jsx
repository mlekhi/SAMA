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
        setDefaults(data);
        
        // Set form data with backend defaults
        setFormData({
          nomDiscRate: data.nomDiscRate?.toString() || '',
          expInfRate: data.expInfRate?.toString() || '',
          equipSalePercent: data.equipSalePercent?.toString() || '',
          invTaxCredit: data.invTaxCredit?.toString() || ''
        });

        // Set myData with backend defaults
        setMyData({
          latitude: data.latitude?.toString() || '',
          longitude: data.longitude?.toString() || '',
          discountRate: data.discount_rate?.toString() || '',
          projectLifetime: data.project_lifetime?.toString() || '',
          capitalCost: data.capital_cost?.toString() || '1000',
          replacementCost: data.replacement_cost?.toString() || '1000',
          OMCost: data.om_cost?.toString() || '10'
        });

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

      // Prepare only the required data for the GeographyEconomy component
      const geoEconomyData = {
        session_id: sessionId,
        n_ir_rate: parseFloat(formData.nomDiscRate),
        e_ir_rate: parseFloat(formData.expInfRate),
        Tax_rate: parseFloat(formData.equipSalePercent),
        RE_incentives_rate: parseFloat(formData.invTaxCredit)
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
