import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SaveMessageAlert from '../components/SaveMessageAlert'
import {
  Typography,
  TextField,
  Box,
  Divider,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Button,
  InputAdornment
} from "@mui/material"

function Grid({ auth, user }) {
  const navigate = useNavigate()
  const [gridData, setGridData] = useState({
    Grid: true,
    NEM: true,
    Annual_expenses: 0.0,
    Grid_sale_tax_rate: 6.88,
    Grid_Tax_amount: 0.0016,
    Grid_escalation_rate: 5.7,
    Grid_credit: 121.4,
    NEM_fee: 0.0,
    SC_flat: 0.0,
    Pbuy_max: 6.0,
    Psell_max: 200.0,
  })
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const isFormValid = () => {
    return (
      gridData.Annual_expenses !== '' &&
      gridData.Grid_sale_tax_rate !== '' &&
      gridData.Grid_Tax_amount !== '' &&
      gridData.Grid_escalation_rate !== '' &&
      gridData.Grid_credit !== '' &&
      gridData.NEM_fee !== '' &&
      gridData.SC_flat !== '' &&
      gridData.Pbuy_max !== '' &&
      gridData.Psell_max !== ''
    );
  };

  const handleSubmit = async () => {
    if (!user) return;

    setSaving(true);
    setSaveMessage('');

    try {
      const token = await user.getIdToken();
      
      // Step 1: Save the Grid data first.
      const saveResponse = await fetch('http://127.0.0.1:5000/api/grid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(gridData)
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save grid data.');
      }
      
      setSaveMessage('Grid configuration saved. Submitting for analysis...');

      // Step 2: Call the results endpoint.
      const submitResponse = await fetch('http://127.0.0.1:5000/api/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (submitResponse.ok) {
        const results = await submitResponse.json();
        console.log('SAMA Analysis Results:', results.logs);
        setSaveMessage('Analysis complete! Navigating to results...');
        setTimeout(() => {
          navigate('/results', { state: { results: results.logs } });
        }, 1500);
      } else {
        const errorData = await submitResponse.json();
        throw new Error(errorData.error || 'Failed to submit for analysis.');
      }
    } catch (error) {
      setSaveMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCheckboxChange = (field) => (event) => {
    setGridData(prev => ({
      ...prev,
      [field]: event.target.checked
    }))
  }

  const handleInputChange = (field) => (event) => {
    setGridData(prev => ({
      ...prev,
      [field]: event.target.value === '' ? '' : parseFloat(event.target.value)
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="h3" component="h1" gutterBottom>
            Grid Configuration
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Configure your grid connection parameters
          </Typography>
        </div>

        <Divider sx={{ my: 4 }} />

        {/* Grid Parameters Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Grid Connection
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={gridData.Grid} onChange={handleCheckboxChange('Grid')} />}
              label="Is grid connected"
            />
            <FormControlLabel
              control={<Checkbox checked={gridData.NEM} onChange={handleCheckboxChange('NEM')} />}
              label="Is net metered"
            />
          </FormGroup>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Economic Parameters Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Economic Parameters
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>Annual Expenses</Typography>
              <TextField 
                fullWidth 
                type="number"
                placeholder="Annual Expenses*"
                value={gridData.Annual_expenses} 
                onChange={handleInputChange('Annual_expenses')} 
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>Grid Sale Tax Rate</Typography>
              <TextField 
                fullWidth 
                type="number" 
                placeholder="Grid Sale Tax Rate*"
                value={gridData.Grid_sale_tax_rate} 
                onChange={handleInputChange('Grid_sale_tax_rate')} 
                variant="outlined" 
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>Grid Tax Amount</Typography>
              <TextField 
                fullWidth 
                type="number" 
                placeholder="Grid Tax Amount*"
                value={gridData.Grid_Tax_amount} 
                onChange={handleInputChange('Grid_Tax_amount')} 
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">$/kWh</InputAdornment>,
                }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>Grid Escalation Rate</Typography>
              <TextField 
                fullWidth 
                type="number" 
                placeholder="Grid Escalation Rate*"
                value={gridData.Grid_escalation_rate} 
                onChange={handleInputChange('Grid_escalation_rate')} 
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>Grid Credit</Typography>
              <TextField 
                fullWidth 
                type="number" 
                placeholder="Grid Credit*"
                value={gridData.Grid_credit} 
                onChange={handleInputChange('Grid_credit')} 
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>Net Metering Fee</Typography>
              <TextField 
                fullWidth 
                type="number" 
                placeholder="Net Metering Fee*"
                value={gridData.NEM_fee} 
                onChange={handleInputChange('NEM_fee')} 
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>Grid Monthly Fixed Charge</Typography>
              <TextField 
                fullWidth 
                type="number" 
                placeholder="Grid Monthly Fixed Charge*"
                value={gridData.SC_flat} 
                onChange={handleInputChange('SC_flat')} 
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">$/kWh</InputAdornment>,
                }}
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Technical Parameters Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Technical Parameters
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>Purchase Capacity</Typography>
              <TextField 
                fullWidth 
                type="number" 
                placeholder="Purchase Capacity*"
                value={gridData.Pbuy_max} 
                onChange={handleInputChange('Pbuy_max')} 
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">kW</InputAdornment>,
                }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>Sell Capacity</Typography>
              <TextField 
                fullWidth 
                type="number" 
                placeholder="Sell Capacity*"
                value={gridData.Psell_max} 
                onChange={handleInputChange('Psell_max')} 
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">kW</InputAdornment>,
                }}
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Save Button */}
        <Box sx={{ mb: 4 }}>
          <SaveMessageAlert message={saveMessage} />
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!isFormValid() || saving}
            fullWidth
            sx={{ py: 1.5 }}
          >
            {saving ? 'Submitting...' : 'Submit for Analysis'}
          </Button>
          
          {!isFormValid() && (
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
              Please fill in all fields to continue
            </Typography>
          )}
        </Box>
      </div>
    </div>
  )
}

export default Grid 