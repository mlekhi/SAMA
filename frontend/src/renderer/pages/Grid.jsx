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
import NextPageButton from '../components/NextPageButton'

function Grid({ auth, user }) {
  const navigate = useNavigate()
  const [gridData, setGridData] = useState({
    Grid: false,
    NEM: false,
    Annual_expenses: 0.0,
    Grid_sale_tax_rate: 0.0,
    Grid_Tax_amount: 0.0,
    Grid_escalation_rate: 2.0,
    Grid_credit: 0.0,
    NEM_fee: 0.0,
    SC_flat: 10.0,
    Pbuy_max: 6.0,
    Psell_max: 200.0,
  })
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [currentStep, setCurrentStep] = useState(1) // 1: Grid connected?, 2: Net metered?, 3: Configuration

  const isFormValid = () => {
    // If grid is not connected, no validation needed
    if (!gridData.Grid) {
      return true;
    }
    
    // If grid is connected, validate required fields
    return (
      gridData.Annual_expenses !== '' &&
      gridData.Grid_sale_tax_rate !== '' &&
      gridData.Grid_Tax_amount !== '' &&
      gridData.Grid_escalation_rate !== '' &&
      gridData.Grid_credit !== '' &&
      gridData.SC_flat !== '' &&
      gridData.Pbuy_max !== '' &&
      gridData.Psell_max !== '' &&
      // Only validate NEM_fee if NEM is enabled
      (!gridData.NEM || gridData.NEM_fee !== '')
    );
  };

  const handleGridConnectionChange = (event) => {
    const isConnected = event.target.checked;
    setGridData(prev => ({
      ...prev,
      Grid: isConnected,
      // Reset NEM if grid is disconnected
      NEM: isConnected ? prev.NEM : false
    }));
    
    if (isConnected) {
      setCurrentStep(2); // Move to net metering question
    } else {
      setCurrentStep(1); // Stay on grid connection question
    }
  };

  const handleNetMeteringChange = (event) => {
    setGridData(prev => ({
      ...prev,
      NEM: event.target.checked
    }));
    setCurrentStep(3); // Move to configuration
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
        console.log('Generated Files:', results.generated_files);
        console.log('Full response:', results);
        console.log('User ID from response:', results.user_id);
        setSaveMessage('Analysis complete! Navigating to results...');
        setTimeout(() => {
          navigate('/results', { 
            state: { 
              results: results.logs,
              generatedFiles: results.generated_files,
              userId: results.user_id
            } 
          });
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

  const handleInputChange = (field) => (event) => {
    setGridData(prev => ({
      ...prev,
      [field]: event.target.value === '' ? '' : parseFloat(event.target.value)
    }))
  }

  const renderStep1 = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Grid Connection
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Is your system connected to the electrical grid?
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox 
              checked={gridData.Grid} 
              onChange={handleGridConnectionChange}
              size="large"
            />
          }
          label="Yes, my system is connected to the grid"
        />
      </FormGroup>
    </Box>
  );

  const renderStep2 = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Net Metering
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Does your utility offer net metering for your grid connection?
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox 
              checked={gridData.NEM} 
              onChange={handleNetMeteringChange}
              size="large"
            />
          }
          label="Yes, I have net metering"
        />
      </FormGroup>
    </Box>
  );

  const renderStep3 = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Grid Configuration
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Please provide the following grid connection details:
      </Typography>

      {/* Economic Parameters Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          Economic Parameters
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box>
            <Typography variant="subtitle1" component="h4" gutterBottom>Annual Expenses</Typography>
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
            <Typography variant="subtitle1" component="h4" gutterBottom>Grid Sale Tax Rate</Typography>
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
            <Typography variant="subtitle1" component="h4" gutterBottom>Grid Tax Amount</Typography>
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
            <Typography variant="subtitle1" component="h4" gutterBottom>Grid Escalation Rate</Typography>
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
            <Typography variant="subtitle1" component="h4" gutterBottom>Grid Credit</Typography>
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
          {gridData.NEM && (
          <Box>
            <Typography variant="subtitle1" component="h4" gutterBottom>Net Metering Fee</Typography>
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
          )}
          <Box>
            <Typography variant="subtitle1" component="h4" gutterBottom>Grid Monthly Fixed Charge</Typography>
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
        <Typography variant="h6" component="h3" gutterBottom>
          Technical Parameters
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box>
            <Typography variant="subtitle1" component="h4" gutterBottom>Purchase Capacity</Typography>
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
            <Typography variant="subtitle1" component="h4" gutterBottom>Sell Capacity</Typography>
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
    </Box>
  );

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

        {/* Step 1: Grid Connection Question */}
        {renderStep1()}

        {/* Step 2: Net Metering Question (only if grid is connected) */}
        {gridData.Grid && currentStep >= 2 && renderStep2()}

        {/* Step 3: Configuration Fields (only if grid is connected) */}
        {gridData.Grid && currentStep >= 3 && renderStep3()}

        {/* Save Button */}
        <Box sx={{ mb: 4 }}>
          <SaveMessageAlert message={saveMessage} />
          <NextPageButton
            onClick={handleSubmit}
            disabled={!isFormValid() || saving}
            saving={saving}
            text="Submit for Analysis"
            savingText="Submitting..."
          />
          {!isFormValid() && gridData.Grid && (
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
              Please fill in all required fields to continue
            </Typography>
          )}
        </Box>
      </div>
    </div>
  )
}

export default Grid 