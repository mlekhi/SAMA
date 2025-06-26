import React, { useState } from 'react';
import { Box, Typography, TextField, Divider, Button } from '@mui/material';
import SaveMessageAlert from '../../components/SaveMessageAlert';
import { useNavigate } from 'react-router-dom';

const defaultValues = {
  fpv: 0.9,
  Tcof: -0.43,
  Tref: 25,
  Tc_noct: 45,
  Ta_noct: 20,
  G_noct: 800,
  n_PV: 0.2182,
  Gref: 1000,
  L_PV: 25,
  C_PV: 534.54,
  R_PV: 534.54,
  MO_PV: 28.88,
  Installation_cost: 160,
  Overhead: 260,
  Sales_and_marketing: 40,
  Permiting_and_Inspection: 210,
  Electrical_BoS: 370,
  Structural_BoS: 160,
  Supply_Chain_costs: 0,
  Profit_costs: 340,
  Sales_tax: 80
};

function PV() {
  const [pvData, setPvData] = useState(defaultValues);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (field) => (event) => {
    setPvData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = () => {
    setSaving(true);
    setSaveMessage('');
    setTimeout(() => {
      setSaving(false);
      setSaveMessage('PV configuration saved!');
      navigate('/inverter'); // Navigate to Inverter page
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Typography variant="h3" component="h1" gutterBottom>
          PV System Configuration
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>Technical</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="PV derating factor" value={pvData.fpv} onChange={handleChange('fpv')} InputProps={{ endAdornment: <span>%</span> }} />
          <TextField label="Temperature coefficient" value={pvData.Tcof} onChange={handleChange('Tcof')} InputProps={{ endAdornment: <span>%/°C</span> }} />
          <TextField label="Temperature at standard test condition" value={pvData.Tref} onChange={handleChange('Tref')} InputProps={{ endAdornment: <span>°C</span> }} />
          <TextField label="Nominal operating cell temperature" value={pvData.Tc_noct} onChange={handleChange('Tc_noct')} InputProps={{ endAdornment: <span>°C</span> }} />
          <TextField label="Ambient temperature at which NOCT is defined" value={pvData.Ta_noct} onChange={handleChange('Ta_noct')} InputProps={{ endAdornment: <span>°C</span> }} />
          <TextField label="Solar radiation at which NOCT is defined" value={pvData.G_noct} onChange={handleChange('G_noct')} InputProps={{ endAdornment: <span>W/m²</span> }} />
          <TextField label="Efficiency of PV module" value={pvData.n_PV} onChange={handleChange('n_PV')} InputProps={{ endAdornment: <span>%/100</span> }} />
          <TextField label="Reference irradiance" value={pvData.Gref} onChange={handleChange('Gref')} InputProps={{ endAdornment: <span>W/m²</span> }} />
          <TextField label="PV modules' life time" value={pvData.L_PV} onChange={handleChange('L_PV')} InputProps={{ endAdornment: <span>years</span> }} />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>Economic</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Capital cost" value={pvData.C_PV} onChange={handleChange('C_PV')} InputProps={{ endAdornment: <span>$/kW</span> }} />
          <TextField label="Replacement Cost of PV modules" value={pvData.R_PV} onChange={handleChange('R_PV')} InputProps={{ endAdornment: <span>$/kW</span> }} />
          <TextField label="O&M cost" value={pvData.MO_PV} onChange={handleChange('MO_PV')} InputProps={{ endAdornment: <span>$/year/kW</span> }} />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>Engineering Costs</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Installation cost" value={pvData.Installation_cost} onChange={handleChange('Installation_cost')} InputProps={{ endAdornment: <span>$/kW</span> }} />
          <TextField label="Overhead" value={pvData.Overhead} onChange={handleChange('Overhead')} InputProps={{ endAdornment: <span>$/kW</span> }} />
          <TextField label="Sales and marketing" value={pvData.Sales_and_marketing} onChange={handleChange('Sales_and_marketing')} InputProps={{ endAdornment: <span>$/kW</span> }} />
          <TextField label="Permitting and Inspection" value={pvData.Permiting_and_Inspection} onChange={handleChange('Permiting_and_Inspection')} InputProps={{ endAdornment: <span>$/kW</span> }} />
          <TextField label="Electrical BoS" value={pvData.Electrical_BoS} onChange={handleChange('Electrical_BoS')} InputProps={{ endAdornment: <span>$/kW</span> }} />
          <TextField label="Structural BoS" value={pvData.Structural_BoS} onChange={handleChange('Structural_BoS')} InputProps={{ endAdornment: <span>$/kW</span> }} />
          <TextField label="Supply Chain costs" value={pvData.Supply_Chain_costs} onChange={handleChange('Supply_Chain_costs')} InputProps={{ endAdornment: <span>$/kW</span> }} />
          <TextField label="Profit costs" value={pvData.Profit_costs} onChange={handleChange('Profit_costs')} InputProps={{ endAdornment: <span>$/kW</span> }} />
          <TextField label="Sales tax" value={pvData.Sales_tax} onChange={handleChange('Sales_tax')} InputProps={{ endAdornment: <span>$/kW</span> }} />
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

export default PV; 