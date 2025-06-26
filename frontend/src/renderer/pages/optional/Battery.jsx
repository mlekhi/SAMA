import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Divider, Button, InputAdornment } from '@mui/material';
import SaveMessageAlert from '../../components/SaveMessageAlert';
import { useNavigate } from 'react-router-dom';
import NextPageButton from '../../components/NextPageButton';

const defaultValues = {
  SOC_min: 0.1,
  SOC_max: 1,
  SOC_initial: 0.5,
  self_discharge_rate: 0,
  L_B: 7.5,
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

function Battery() {
  const [batData, setBatData] = useState(defaultValues);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [componentSelection, setComponentSelection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComponentSelection = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/component-selection', {
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error('Failed to fetch component selection');
        }
        const data = await res.json();
        setComponentSelection(data);
      } catch (err) {
        setError('Could not load component selection.');
      } finally {
        setLoading(false);
      }
    };
    fetchComponentSelection();
  }, []);

  const handleChange = (field) => (event) => {
    setBatData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = () => {
    setSaving(true);
    setSaveMessage('');
    setTimeout(() => {
      setSaving(false);
      setSaveMessage('Battery configuration saved!');
      // navigate('/next-page'); // Uncomment and set next page if needed
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Typography variant="h3" component="h1" gutterBottom>
          Battery Configuration
        </Typography>
        <Divider sx={{ my: 2 }} />
        {loading ? (
          <Typography>Loading battery options...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <Typography variant="h5" gutterBottom>Technical</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Minimum state of charge (SoC)" value={batData.SOC_min} onChange={handleChange('SOC_min')} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
              <TextField label="Maximum state of charge (SoC)" value={batData.SOC_max} onChange={handleChange('SOC_max')} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
              <TextField label="Initial state of charge (SoC)" value={batData.SOC_initial} onChange={handleChange('SOC_initial')} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
              <TextField label="Hourly self-discharge rate" value={batData.self_discharge_rate} onChange={handleChange('self_discharge_rate')} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
              <TextField label="Battery lifetime" value={batData.L_B} onChange={handleChange('L_B')} InputProps={{ endAdornment: <InputAdornment position="end">years</InputAdornment> }} />
            </Box>
            {componentSelection?.Lead_acid && (
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
            {componentSelection?.Li_ion && (
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
                disabled={saving}
              />
            </Box>
          </>
        )}
      </div>
    </div>
  );
}

export default Battery; 