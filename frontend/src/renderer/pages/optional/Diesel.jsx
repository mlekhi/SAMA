import React, { useState } from 'react';
import { Box, Typography, TextField, Divider, Button } from '@mui/material';
import SaveMessageAlert from '../../components/SaveMessageAlert';
import { useNavigate } from 'react-router-dom';

const defaultValues = {
  a: 0.273,
  b: 0.033,
  C_DG: 240.45,
  R_DG: 240.45,
  MO_DG: 0.066,
  C_fuel: 1.428,
  C_fuel_adj_rate: 2
};

function Diesel() {
  const [dgData, setDgData] = useState(defaultValues);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (field) => (event) => {
    setDgData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = () => {
    setSaving(true);
    setSaveMessage('');
    setTimeout(() => {
      setSaving(false);
      setSaveMessage('Diesel Generator configuration saved!');
      // navigate('/next-page'); // Uncomment and set next page if needed
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Typography variant="h3" component="h1" gutterBottom>
          Diesel Generator Configuration
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>Diesel Generator Fuel Curve</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Slope" value={dgData.a} onChange={handleChange('a')} InputProps={{ endAdornment: <span>Liter/hr/kW output</span> }} />
          <TextField label="Intercept coefficient" value={dgData.b} onChange={handleChange('b')} InputProps={{ endAdornment: <span>Liter/hr/kW rate</span> }} />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>Economic</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Capital cost" value={dgData.C_DG} onChange={handleChange('C_DG')} InputProps={{ endAdornment: <span>$/kW</span> }} />
          <TextField label="Replacement Cost" value={dgData.R_DG} onChange={handleChange('R_DG')} InputProps={{ endAdornment: <span>$/kW</span> }} />
          <TextField label="O&M cost / Running cost" value={dgData.MO_DG} onChange={handleChange('MO_DG')} InputProps={{ endAdornment: <span>$/op.h</span> }} />
          <TextField label="Fuel Cost" value={dgData.C_fuel} onChange={handleChange('C_fuel')} InputProps={{ endAdornment: <span>$/L</span> }} />
          <TextField label="DG fuel cost yearly escalation rate" value={dgData.C_fuel_adj_rate} onChange={handleChange('C_fuel_adj_rate')} InputProps={{ endAdornment: <span>%</span> }} />
        </Box>
        <Box sx={{ mt: 4 }}>
          <SaveMessageAlert message={saveMessage} />
          <Button variant="contained" color="primary" onClick={handleSave} disabled={saving} fullWidth sx={{ py: 1.5 }}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </div>
    </div>
  );
}

export default Diesel; 