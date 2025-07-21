import React, { useState } from 'react';
import { Box, Typography, TextField, Divider, Button, InputAdornment } from '@mui/material';
import SaveMessageAlert from '../../components/SaveMessageAlert';
import { useNavigate } from 'react-router-dom';
import NextPageButton from '../../components/NextPageButton';

const defaultValues = {
  n_I: 96, // 96%
  L_I: 25,
  DC_AC_ratio: 1.99,
  C_I: 440,
  R_I: 440,
  MO_I: 3.4
};

function Inverter({ auth, user }) {
  const [invData, setInvData] = useState(defaultValues);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (field) => (event) => {
    let value = event.target.value;
    if (field === 'n_I') {
      // Clamp to 0-100
      value = Math.max(0, Math.min(100, Number(value)));
    }
    setInvData(prev => ({ ...prev, [field]: value }));
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
      // Convert n_I to decimal before sending
      const payload = { ...invData, n_I: invData.n_I / 100 };
      const res = await fetch('http://127.0.0.1:5000/api/inverter-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSaveMessage('Inverter configuration saved!');
        setTimeout(async () => {
          // Fetch component selection to determine next page
          try {
            const res = await fetch('http://127.0.0.1:5000/api/component-selection', { 
              headers: { 'Authorization': `Bearer ${token}` },
              credentials: 'include' 
            });
            if (res.ok) {
              const data = await res.json();
              // Route to the first selected component that needs configuration
              if (data.PV) {
                navigate('/pv-config');
              } else if (data.WT) {
                navigate('/wind-config');
              } else if (data.Bat) {
                navigate('/battery-config');
              } else if (data.DG) {
                navigate('/dg-config');
              } else {
                navigate('/grid-config');
              }
            } else {
              navigate('/grid-config');
            }
          } catch (err) {
            navigate('/grid-config');
          }
        }, 1000);
      } else {
        const data = await res.json();
        setSaveMessage(data.error || 'Failed to save inverter configuration.');
      }
    } catch (err) {
      setSaveMessage('Failed to save inverter configuration.');
    } finally {
      setSaving(false);
    }
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
          <TextField
            label="Inverter Efficiency"
            value={invData.n_I}
            onChange={handleChange('n_I')}
            variant="outlined"
            fullWidth
            type="number"
            inputProps={{ min: 0, max: 100 }}
            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
          />
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