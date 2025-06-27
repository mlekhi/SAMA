import React, { useState } from 'react';
import { Box, Typography, TextField, Divider, Button, InputAdornment } from '@mui/material';
import SaveMessageAlert from '../../components/SaveMessageAlert';
import { useNavigate } from 'react-router-dom';
import NextPageButton from '../../components/NextPageButton';

const defaultValues = {
  n_I: 0.96,
  L_I: 25,
  DC_AC_ratio: 1.99,
  C_I: 440,
  R_I: 440,
  MO_I: 3.4
};

function Inverter({ user }) {
  const [invData, setInvData] = useState(defaultValues);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (field) => (event) => {
    setInvData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = () => {
    setSaving(true);
    setSaveMessage('');
    setTimeout(async () => {
      setSaving(false);
      setSaveMessage('Inverter configuration saved!');
      
      // Fetch component selection to determine next page
      try {
        console.log('Fetching component selection...');
        let token = null;
        if (user) {
          token = await user.getIdToken();
        }
        const res = await fetch('http://127.0.0.1:5000/api/component-selection', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          credentials: 'include',
        });
        console.log('Response status:', res.status);
        if (res.ok) {
          const data = await res.json();
          console.log('Component selection data:', data);
          if (data.DG) {
            console.log('Navigating to DG config');
            navigate('/dg-config');
          } else if (data.Bat) {
            console.log('Navigating to Battery config');
            navigate('/battery-config');
          } else {
            console.log('Neither DG nor Bat selected, navigating to grid-config');
            navigate('/grid-config');
          }
        } else {
          console.error('Failed to fetch component selection:', res.status);
          // Fallback to grid-config
          navigate('/grid-config');
        }
      } catch (err) {
        console.error('Failed to fetch component selection:', err);
        // Fallback to grid-config
        navigate('/grid-config');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Typography variant="h3" component="h1" gutterBottom>
          Inverter Configuration
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>Technical</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Inverter Efficiency" value={invData.n_I} onChange={handleChange('n_I')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
          <TextField label="Inverter lifetime" value={invData.L_I} onChange={handleChange('L_I')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">years</InputAdornment> }} />
          <TextField label="Maximum acceptable DC to AC ratio" value={invData.DC_AC_ratio} onChange={handleChange('DC_AC_ratio')} variant="outlined" fullWidth />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>Economic</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Capital cost" value={invData.C_I} onChange={handleChange('C_I')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">$/kW</InputAdornment> }} />
          <TextField label="Replacement cost" value={invData.R_I} onChange={handleChange('R_I')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">$/kW</InputAdornment> }} />
          <TextField label="O&M cost" value={invData.MO_I} onChange={handleChange('MO_I')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">$/kW/year</InputAdornment> }} />
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

export default Inverter; 