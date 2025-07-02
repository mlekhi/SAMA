import React, { useState } from 'react';
import { Box, Typography, TextField, Divider, Button, InputAdornment, FormControlLabel, Checkbox, FormGroup } from '@mui/material';
import SaveMessageAlert from '../../components/SaveMessageAlert';
import { useNavigate } from 'react-router-dom';
import NextPageButton from '../../components/NextPageButton';

const defaultValues = {
  SOC_min: 0.1,
  SOC_max: 1,
  SOC_initial: 0.5,
  self_discharge_rate: 0,
  L_B: 7.5,
  // Battery Type Selection
  Lead_acid: false,
  Li_ion: false,
  // Lead Acid
  Cnom_Leadacid: 83.4,
  alfa_battery_leadacid: 1,
  c: 0.403,
  k: 0.827,
  Ich_max_leadacid: 16.7,
  Vnom_leadacid: 12,
  ef_bat_leadacid: 0.8,
  Q_lifetime_leadacid: 8000,
  // Li-ion
  Ich_max_Li_ion: 167,
  Idch_max_Li_ion: 500,
  alfa_battery_Li_ion: 1,
  Vnom_Li_ion: 48,
  ef_bat_Li: 0.9,
  Cnom_Li: 167,
  Q_lifetime_Li: 3000,
  L_B_Li: 7.5,
  // Economic
  C_B: 458.06,
  R_B: 458.06,
  MO_B: 10.27
};

function Battery({ auth, user }) {
  const [batData, setBatData] = useState(defaultValues);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (field) => (event) => {
    setBatData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleCheckboxChange = (field) => (event) => {
    setBatData(prev => ({ ...prev, [field]: event.target.checked }));
  };

  const isFormValid = () => {
    return batData.Lead_acid || batData.Li_ion;
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
      const res = await fetch('http://127.0.0.1:5000/api/battery-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(batData),
      });
      if (res.ok) {
        setSaveMessage('Battery configuration saved!');
        setTimeout(() => {
          navigate('/grid-config');
        }, 1000);
      } else {
        const data = await res.json();
        setSaveMessage(data.error || 'Failed to save battery configuration.');
      }
    } catch (err) {
      setSaveMessage('Failed to save battery configuration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Typography variant="h3" component="h1" gutterBottom>
          Battery Configuration
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>Technical</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Minimum state of charge (SoC)" value={batData.SOC_min} onChange={handleChange('SOC_min')} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
          <TextField label="Maximum state of charge (SoC)" value={batData.SOC_max} onChange={handleChange('SOC_max')} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
          <TextField label="Initial state of charge (SoC)" value={batData.SOC_initial} onChange={handleChange('SOC_initial')} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
          <TextField label="Hourly self-discharge rate" value={batData.self_discharge_rate} onChange={handleChange('self_discharge_rate')} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
          <TextField label="Battery lifetime" value={batData.L_B} onChange={handleChange('L_B')} InputProps={{ endAdornment: <InputAdornment position="end">years</InputAdornment> }} />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>Battery Type Selection</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Select which battery types you want to include in your system. You can choose one or both types.
        </Typography>
        <FormGroup row sx={{ mb: 2 }}>
          <FormControlLabel 
            control={<Checkbox checked={batData.Lead_acid} onChange={handleCheckboxChange('Lead_acid')} />} 
            label="Lead Acid Battery" 
          />
          <FormControlLabel 
            control={<Checkbox checked={batData.Li_ion} onChange={handleCheckboxChange('Li_ion')} />} 
            label="Li-ion Battery" 
          />
        </FormGroup>
        
        {batData.Lead_acid && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" gutterBottom>Lead Acid Battery</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Lead Acid nominal capacity" value={batData.Cnom_Leadacid} onChange={handleChange('Cnom_Leadacid')} InputProps={{ endAdornment: <InputAdornment position="end">Ah</InputAdornment> }} />
              <TextField label="Storage's maximum charge rate" value={batData.alfa_battery_leadacid} onChange={handleChange('alfa_battery_leadacid')} InputProps={{ endAdornment: <InputAdornment position="end">A/Ah</InputAdornment> }} />
              <TextField label="Storage capacity ratio" value={batData.c} onChange={handleChange('c')} />
              <TextField label="Storage rate constant" value={batData.k} onChange={handleChange('k')} InputProps={{ endAdornment: <InputAdornment position="end">1/h</InputAdornment> }} />
              <TextField label="Storage's maximum charge current" value={batData.Ich_max_leadacid} onChange={handleChange('Ich_max_leadacid')} InputProps={{ endAdornment: <InputAdornment position="end">A</InputAdornment> }} />
              <TextField label="Storage's nominal voltage" value={batData.Vnom_leadacid} onChange={handleChange('Vnom_leadacid')} InputProps={{ endAdornment: <InputAdornment position="end">V</InputAdornment> }} />
              <TextField label="Round trip efficiency" value={batData.ef_bat_leadacid} onChange={handleChange('ef_bat_leadacid')} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
              <TextField label="Throughout" value={batData.Q_lifetime_leadacid} onChange={handleChange('Q_lifetime_leadacid')} InputProps={{ endAdornment: <InputAdornment position="end">kWh</InputAdornment> }} />
            </Box>
          </>
        )}
        {batData.Li_ion && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" gutterBottom>Li-ion Battery</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Storage's maximum charge current" value={batData.Ich_max_Li_ion} onChange={handleChange('Ich_max_Li_ion')} InputProps={{ endAdornment: <InputAdornment position="end">A</InputAdornment> }} />
              <TextField label="Storage's maximum discharge current" value={batData.Idch_max_Li_ion} onChange={handleChange('Idch_max_Li_ion')} InputProps={{ endAdornment: <InputAdornment position="end">A</InputAdornment> }} />
              <TextField label="Storage's maximum charge rate" value={batData.alfa_battery_Li_ion} onChange={handleChange('alfa_battery_Li_ion')} InputProps={{ endAdornment: <InputAdornment position="end">A/Ah</InputAdornment> }} />
              <TextField label="Storage's nominal voltage" value={batData.Vnom_Li_ion} onChange={handleChange('Vnom_Li_ion')} InputProps={{ endAdornment: <InputAdornment position="end">V</InputAdornment> }} />
              <TextField label="Round trip efficiency" value={batData.ef_bat_Li} onChange={handleChange('ef_bat_Li')} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
              <TextField label="Li-ion nominal capacity" value={batData.Cnom_Li} onChange={handleChange('Cnom_Li')} InputProps={{ endAdornment: <InputAdornment position="end">Ah</InputAdornment> }} />
              <TextField label="Throughout" value={batData.Q_lifetime_Li} onChange={handleChange('Q_lifetime_Li')} InputProps={{ endAdornment: <InputAdornment position="end">kWh</InputAdornment> }} />
              <TextField label="Battery lifetime" value={batData.L_B_Li} onChange={handleChange('L_B_Li')} InputProps={{ endAdornment: <InputAdornment position="end">years</InputAdornment> }} />
            </Box>
          </>
        )}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>Economic</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Capital cost" value={batData.C_B} onChange={handleChange('C_B')} InputProps={{ endAdornment: <InputAdornment position="end">$/kWh</InputAdornment> }} />
          <TextField label="Replacement cost" value={batData.R_B} onChange={handleChange('R_B')} InputProps={{ endAdornment: <InputAdornment position="end">$/kWh</InputAdornment> }} />
          <TextField label="O&M cost" value={batData.MO_B} onChange={handleChange('MO_B')} InputProps={{ endAdornment: <InputAdornment position="end">$/kWh/year</InputAdornment> }} />
        </Box>
        <Box sx={{ mt: 4 }}>
          <SaveMessageAlert message={saveMessage} />
          <NextPageButton
            onClick={handleSave}
            saving={saving}
            text="Next"
            savingText="Saving..."
            disabled={!isFormValid() || saving}
          />
          {!isFormValid() && (
            <Typography variant="body2" color="error" align="center" sx={{ mt: 2 }}>
              Please select at least one battery type to continue
            </Typography>
          )}
        </Box>
      </div>
    </div>
  );
}

export default Battery; 