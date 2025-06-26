import React, { useState } from 'react';
import { Box, Typography, TextField, Divider, Button, InputAdornment } from '@mui/material';
import SaveMessageAlert from '../../components/SaveMessageAlert';
import { useNavigate } from 'react-router-dom';
import NextPageButton from '../../components/NextPageButton';

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
  Sales_tax: 80,
  Ppv_r: 1.0
};

function PV({ user }) {
  const [pvData, setPvData] = useState(defaultValues);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (field) => (event) => {
    setPvData(prev => ({ ...prev, [field]: event.target.value }));
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
      const res = await fetch('http://127.0.0.1:5000/api/pv-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(pvData),
      });
      if (res.ok) {
        setSaveMessage('PV configuration saved!');
        setTimeout(() => {
          navigate('/inverter');
        }, 1000);
      } else {
        const data = await res.json();
        setSaveMessage(data.error || 'Failed to save PV configuration.');
      }
    } catch (err) {
      setSaveMessage('Failed to save PV configuration.');
    } finally {
      setSaving(false);
    }
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
          <TextField label="PV module rated power" value={pvData.Ppv_r} onChange={handleChange('Ppv_r')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">kW</InputAdornment> }} />
          <TextField label="PV derating factor" value={pvData.fpv} onChange={handleChange('fpv')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
          <TextField label="Temperature coefficient" value={pvData.Tcof} onChange={handleChange('Tcof')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">%/°C</InputAdornment> }} />
          <TextField label="Temperature at standard test condition" value={pvData.Tref} onChange={handleChange('Tref')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">°C</InputAdornment> }} />
          <TextField label="Nominal operating cell temperature" value={pvData.Tc_noct} onChange={handleChange('Tc_noct')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">°C</InputAdornment> }} />
          <TextField label="Ambient temperature at which NOCT is defined" value={pvData.Ta_noct} onChange={handleChange('Ta_noct')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">°C</InputAdornment> }} />
          <TextField label="Solar radiation at which NOCT is defined" value={pvData.G_noct} onChange={handleChange('G_noct')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">W/m²</InputAdornment> }} />
          <TextField label="Efficiency of PV module" value={pvData.n_PV} onChange={handleChange('n_PV')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">%/100</InputAdornment> }} />
          <TextField label="Reference irradiance" value={pvData.Gref} onChange={handleChange('Gref')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">W/m²</InputAdornment> }} />
          <TextField label="PV modules' life time" value={pvData.L_PV} onChange={handleChange('L_PV')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">years</InputAdornment> }} />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>Economic</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Capital cost" value={pvData.C_PV} onChange={handleChange('C_PV')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">$/kW</InputAdornment> }} />
          <TextField label="Replacement Cost of PV modules" value={pvData.R_PV} onChange={handleChange('R_PV')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">$/kW</InputAdornment> }} />
          <TextField label="O&M cost" value={pvData.MO_PV} onChange={handleChange('MO_PV')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">$/year/kW</InputAdornment> }} />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>Engineering Costs</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Installation cost" value={pvData.Installation_cost} onChange={handleChange('Installation_cost')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">$/kW</InputAdornment> }} />
          <TextField label="Overhead" value={pvData.Overhead} onChange={handleChange('Overhead')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">$/kW</InputAdornment> }} />
          <TextField label="Sales and marketing" value={pvData.Sales_and_marketing} onChange={handleChange('Sales_and_marketing')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">$/kW</InputAdornment> }} />
          <TextField label="Permitting and Inspection" value={pvData.Permiting_and_Inspection} onChange={handleChange('Permiting_and_Inspection')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">$/kW</InputAdornment> }} />
          <TextField label="Electrical BoS" value={pvData.Electrical_BoS} onChange={handleChange('Electrical_BoS')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">$/kW</InputAdornment> }} />
          <TextField label="Structural BoS" value={pvData.Structural_BoS} onChange={handleChange('Structural_BoS')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">$/kW</InputAdornment> }} />
          <TextField label="Supply Chain costs" value={pvData.Supply_Chain_costs} onChange={handleChange('Supply_Chain_costs')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">$/kW</InputAdornment> }} />
          <TextField label="Profit costs" value={pvData.Profit_costs} onChange={handleChange('Profit_costs')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">$/kW</InputAdornment> }} />
          <TextField label="Sales tax" value={pvData.Sales_tax} onChange={handleChange('Sales_tax')} variant="outlined" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">$/kW</InputAdornment> }} />
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

export default PV; 