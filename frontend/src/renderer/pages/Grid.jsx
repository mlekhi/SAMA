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
  InputAdornment,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  OutlinedInput,
  Chip
} from "@mui/material"
import NextPageButton from '../components/NextPageButton'

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const holidayOptions = [
  'New Year\'s Day', 'Independence Day', 'Thanksgiving', 'Christmas',
  'Labor Day', 'Memorial Day', 'Other'
];

const rateStructures = [
  { value: 'flat', label: 'Flat Rate' },
  { value: 'seasonal', label: 'Seasonal Rate' },
  { value: 'monthly', label: 'Monthly Rate' },
  { value: 'tiered', label: 'Tiered Rate' },
  { value: 'seasonalTiered', label: 'Seasonal Tiered Rate' },
  { value: 'monthlyTiered', label: 'Monthly Tiered Rate' },
  { value: 'tou', label: 'Time of Use' },
];

function Grid({ auth, user }) {
  const navigate = useNavigate()
  const [gridData, setGridData] = useState({
    Grid: null,
    NEM: null,
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
  const [compareOffGrid, setCompareOffGrid] = useState(null); // null, true, or false
  const [seasonMonths, setSeasonMonths] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [rateStructure, setRateStructure] = useState('');
  const [onPeakPrice, setOnPeakPrice] = useState('');
  const [midPeakPrice, setMidPeakPrice] = useState('');

  const isFormValid = () => {
    // If grid is not connected and user hasn't answered the comparison question yet
    if (!gridData.Grid && currentStep < 3) {
      return false;
    }
    
    // If grid is not connected and user doesn't want to compare, no validation needed
    if (!gridData.Grid && compareOffGrid === false) {
      return true;
    }
    
    // If grid is connected, validate required fields
    if (gridData.Grid) {
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
    }
    
    // If grid is not connected and user wants to compare, validate required fields
    if (!gridData.Grid && compareOffGrid === true) {
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
    }
    
    return false;
  };

  const handleSubmit = async () => {
    if (!user) return;

    setSaving(true);
    setSaveMessage('');

    try {
      const token = await user.getIdToken();
      // Send all grid data and new fields
      const payload = {
        ...gridData,
        season: seasonMonths,
        holidays,
        rateStructure,
        onPeakPrice,
        midPeakPrice,
        // Add more rate-structure-specific fields here as needed
      };
      // Step 1: Save the Grid data first.
      const saveResponse = await fetch('http://127.0.0.1:5000/api/grid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
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
      <FormControl fullWidth>
        <InputLabel id="grid-connection-label">Grid Connection</InputLabel>
        <Select
          labelId="grid-connection-label"
          value={gridData.Grid === null ? '' : gridData.Grid}
          onChange={(e) => {
            const isConnected = e.target.value;
            setGridData(prev => ({
              ...prev,
              Grid: isConnected,
              // Reset NEM if grid is disconnected
              NEM: isConnected ? prev.NEM : false
            }));
            setCurrentStep(2); // Move to net metering question
          }}
          input={<OutlinedInput label="Grid Connection" />}
        >
          <MenuItem value={true}>Yes, my system is connected to the grid</MenuItem>
          <MenuItem value={false}>No, my system is off-grid</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );

  const renderOffGridCompareQuestion = () => (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
      >
        Do you want to compare your off-grid system with the grid?
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        This will allow you to compare the economics of your off-grid system with a hypothetical grid-connected scenario.
      </Typography>
      <FormControl fullWidth>
        <InputLabel id="compare-offgrid-label">Compare with Grid</InputLabel>
        <Select
          labelId="compare-offgrid-label"
          value={compareOffGrid === null ? '' : compareOffGrid}
          onChange={(e) => {
            setCompareOffGrid(e.target.value);
            setCurrentStep(3);
          }}
          input={<OutlinedInput label="Compare with Grid" />}
        >
          <MenuItem value={true}>Yes, compare with grid</MenuItem>
          <MenuItem value={false}>No, skip comparison</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );

  const renderStep2 = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Net Metering
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        {gridData.Grid 
          ? "Does your utility offer net metering for your grid connection?"
          : "If you were connected to the grid, would your utility offer net metering?"
        }
      </Typography>
      <FormControl fullWidth>
        <InputLabel id="net-metering-label">Net Metering</InputLabel>
        <Select
          labelId="net-metering-label"
          value={gridData.NEM === null ? '' : gridData.NEM}
          onChange={(e) => {
            setGridData(prev => ({
              ...prev,
              NEM: e.target.value
            }));
            setCurrentStep(3); // Move to next step (comparison question or configuration)
          }}
          input={<OutlinedInput label="Net Metering" />}
        >
          <MenuItem value={true}>
            {gridData.Grid 
              ? "Yes, I have net metering"
              : "Yes, my utility would offer net metering"
            }
          </MenuItem>
          <MenuItem value={false}>
            {gridData.Grid 
              ? "No, I don't have net metering"
              : "No, my utility would not offer net metering"
            }
          </MenuItem>
        </Select>
      </FormControl>
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

  const renderOffGridExtras = () => (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Divider sx={{ my: 4 }} />
      <Typography variant="h5" gutterBottom>
        Which months of the year are considered as summer?
      </Typography>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="season-months-label">Summer Months</InputLabel>
        <Select
          labelId="season-months-label"
          multiple
          value={seasonMonths}
          onChange={e => setSeasonMonths(e.target.value)}
          input={<OutlinedInput label="Summer Months" />}
          renderValue={selected => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map(value => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {monthNames.map(month => (
            <MenuItem key={month} value={month}>{month}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="h5" gutterBottom>
        Which days are considered holidays?
      </Typography>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="holidays-label">Holidays</InputLabel>
        <Select
          labelId="holidays-label"
          multiple
          value={holidays}
          onChange={e => setHolidays(e.target.value)}
          input={<OutlinedInput label="Holidays" />}
          renderValue={selected => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map(value => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {holidayOptions.map(day => (
            <MenuItem key={day} value={day}>{day}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="h5" gutterBottom>
        Select Utility Rate Structure
      </Typography>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="rate-structure-label">Rate Structure</InputLabel>
        <Select
          labelId="rate-structure-label"
          value={rateStructure}
          onChange={e => setRateStructure(e.target.value)}
          input={<OutlinedInput label="Rate Structure" />}
        >
          {rateStructures.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {/* Conditionally render fields for Time of Use */}
      {rateStructure === 'tou' && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="On-Peak Price"
            value={onPeakPrice}
            onChange={e => setOnPeakPrice(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            fullWidth
          />
          <TextField
            label="Mid-Peak Price"
            value={midPeakPrice}
            onChange={e => setMidPeakPrice(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            fullWidth
          />
        </Box>
      )}
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

        {/* Step 2: If grid is connected, ask about net metering. If not, ask about comparison */}
        {currentStep >= 2 && (
          gridData.Grid === true
            ? renderStep2() // Net Metering
            : renderOffGridCompareQuestion() // Off-grid comparison
        )}

        {/* Show grid parameter fields if grid is connected and both questions are answered, or if off-grid and user wants to compare */}
        {((gridData.Grid === true && currentStep >= 3) || (gridData.Grid === false && currentStep >= 3 && compareOffGrid === true)) && renderStep3()}

        {/* Always show summer months, holidays, and rate structure after grid params if grid params are shown */}
        {((gridData.Grid === true && currentStep >= 3) || (gridData.Grid === false && currentStep >= 3 && compareOffGrid === true)) && renderOffGridExtras()}

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
          {!isFormValid() && (
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
              {!gridData.Grid && currentStep < 3 
                ? "Please answer both questions to continue"
                : (gridData.Grid || (!gridData.Grid && compareOffGrid === true))
                ? "Please fill in all required fields to continue"
                : "Please make a selection to continue"
              }
            </Typography>
          )}
        </Box>
      </div>
    </div>
  );
}

export default Grid; 