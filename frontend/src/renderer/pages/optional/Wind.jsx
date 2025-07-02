import React, { useState } from 'react';
import { Box, Typography, TextField, Divider, InputAdornment } from '@mui/material';
import SaveMessageAlert from '../../components/SaveMessageAlert';
import { useNavigate } from 'react-router-dom';
import NextPageButton from '../../components/NextPageButton';

const defaultValues = {
  // Technical Parameters
  Pwt_r: 10,           // Rated power (kW)
  h_hub: 17,           // Hub height (m)
  h0: 43.6,            // Anemometer height (m)
  nw: 1,               // Electrical Efficiency (%)
  v_cut_out: 25,       // Cut out speed (m/s)
  v_cut_in: 2.5,       // Cut in speed (m/s)
  v_rated: 9.5,        // Rated speed (m/s)
  alfa_wind_turbine: 0.11, // Coefficient of friction (0.11 for extreme wind conditions, and 0.20 for normal wind conditions)
  L_WT: 20,            // Life time (years)
  
  // Economic Parameters
  C_WT: 1200,          // Capital cost of Wind Turbine ($/kW)
  R_WT: 1200,          // Replacement cost of Wind Turbine ($/kW)
  MO_WT: 40,           // O&M cost of Wind Turbine ($/year/kw)
  
  // Wind Resource Parameters
  Weibull_k: 2,        // Weibull shape parameter
  Weibull_c: 7,        // Weibull scale parameter (m/s)
  Wind_speed: 7        // Average wind speed (m/s)
};

function Wind({ auth, user }) {
  const [windData, setWindData] = useState(defaultValues);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (field) => (event) => {
    setWindData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = async () => {
    if (!user) {
      setSaveMessage('User not authenticated.');
      return;
    }
    setSaving(true);
    setSaveMessage('');
    try {
      const token = await user.getIdToken();
      const res = await fetch('http://127.0.0.1:5000/api/wind-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(windData)
      });
      if (res.ok) {
        setSaveMessage('Wind turbine configuration saved!');
        setTimeout(async () => {
          // Check what other components are selected to determine next page
          try {
            const componentRes = await fetch('http://127.0.0.1:5000/api/component-selection', {
              headers: { 'Authorization': `Bearer ${token}` },
              credentials: 'include'
            });
            if (componentRes.ok) {
              const data = await componentRes.json();
              if (data.DG) {
                navigate('/dg-config');
              } else if (data.Bat) {
                navigate('/battery-config');
              } else {
                navigate('/grid-config');
              }
            } else {
              navigate('/grid-config');
            }
          } catch (err) {
            navigate('/grid-config');
          }
        }, 1500);
      } else {
        setSaveMessage('Failed to save wind turbine configuration.');
      }
    } catch (error) {
      setSaveMessage('Error saving configuration: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Typography variant="h3" component="h1" gutterBottom>
          Wind Turbine Configuration
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h5" gutterBottom>Technical Parameters</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField 
            label="Rated power" 
            value={windData.Pwt_r} 
            onChange={handleChange('Pwt_r')} 
            InputProps={{ endAdornment: <InputAdornment position="end">kW</InputAdornment> }} 
          />
          <TextField 
            label="Hub height" 
            value={windData.h_hub} 
            onChange={handleChange('h_hub')} 
            InputProps={{ endAdornment: <InputAdornment position="end">m</InputAdornment> }} 
          />
          <TextField 
            label="Anemometer height" 
            value={windData.h0} 
            onChange={handleChange('h0')} 
            InputProps={{ endAdornment: <InputAdornment position="end">m</InputAdornment> }} 
          />
          <TextField 
            label="Electrical Efficiency" 
            value={windData.nw} 
            onChange={handleChange('nw')} 
            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} 
          />
          <TextField 
            label="Cut-in wind speed" 
            value={windData.v_cut_in} 
            onChange={handleChange('v_cut_in')} 
            InputProps={{ endAdornment: <InputAdornment position="end">m/s</InputAdornment> }} 
          />
          <TextField 
            label="Cut-out wind speed" 
            value={windData.v_cut_out} 
            onChange={handleChange('v_cut_out')} 
            InputProps={{ endAdornment: <InputAdornment position="end">m/s</InputAdornment> }} 
          />
          <TextField 
            label="Rated wind speed" 
            value={windData.v_rated} 
            onChange={handleChange('v_rated')} 
            InputProps={{ endAdornment: <InputAdornment position="end">m/s</InputAdornment> }} 
          />
          <TextField 
            label="Coefficient of friction" 
            value={windData.alfa_wind_turbine} 
            onChange={handleChange('alfa_wind_turbine')} 
            helperText="0.11 for extreme wind conditions, 0.20 for normal wind conditions"
          />
          <TextField 
            label="Wind turbine lifetime" 
            value={windData.L_WT} 
            onChange={handleChange('L_WT')} 
            InputProps={{ endAdornment: <InputAdornment position="end">years</InputAdornment> }} 
          />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>Economic Parameters</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField 
            label="Capital cost" 
            value={windData.C_WT} 
            onChange={handleChange('C_WT')} 
            InputProps={{ endAdornment: <InputAdornment position="end">$/kW</InputAdornment> }} 
          />
          <TextField 
            label="Replacement cost" 
            value={windData.R_WT} 
            onChange={handleChange('R_WT')} 
            InputProps={{ endAdornment: <InputAdornment position="end">$/kW</InputAdornment> }} 
          />
          <TextField 
            label="O&M cost" 
            value={windData.MO_WT} 
            onChange={handleChange('MO_WT')} 
            InputProps={{ endAdornment: <InputAdornment position="end">$/kW/year</InputAdornment> }} 
          />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>Wind Resource Parameters</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField 
            label="Weibull shape parameter (k)" 
            value={windData.Weibull_k} 
            onChange={handleChange('Weibull_k')} 
          />
          <TextField 
            label="Weibull scale parameter (c)" 
            value={windData.Weibull_c} 
            onChange={handleChange('Weibull_c')} 
            InputProps={{ endAdornment: <InputAdornment position="end">m/s</InputAdornment> }} 
          />
          <TextField 
            label="Average wind speed" 
            value={windData.Wind_speed} 
            onChange={handleChange('Wind_speed')} 
            InputProps={{ endAdornment: <InputAdornment position="end">m/s</InputAdornment> }} 
          />
        </Box>
        
        <Box sx={{ mt: 4 }}>
          <SaveMessageAlert message={saveMessage} />
          <NextPageButton
            onClick={handleSave}
            saving={saving}
            text="Next"
            savingText="Saving..."
            disabled={saving}
          />
        </Box>
      </div>
    </div>
  );
}

export default Wind; 