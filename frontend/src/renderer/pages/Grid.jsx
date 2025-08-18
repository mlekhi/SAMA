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
  Chip,
  Grid
} from "@mui/material"
import NextPageButton from '../components/NextPageButton'
import DatePicker from "react-multi-date-picker";

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
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

function GridConfig({ auth, user }) {
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
  const [holidayDates, setHolidayDates] = useState([]); // Array of Date objects
  const [rateStructure, setRateStructure] = useState('');
  
  // Rate structure specific state
  const [flatPrice, setFlatPrice] = useState('');
  const [summerPrice, setSummerPrice] = useState('');
  const [winterPrice, setWinterPrice] = useState('');
  const [monthlyPrices, setMonthlyPrices] = useState({
    January: '', February: '', March: '', April: '', May: '', June: '',
    July: '', August: '', September: '', October: '', November: '', December: ''
  });
  
  // Tiered rate state
  const [lowTierPrice, setLowTierPrice] = useState('');
  const [mediumTierPrice, setMediumTierPrice] = useState('');
  const [highTierPrice, setHighTierPrice] = useState('');
  const [lowTierMaxLoad, setLowTierMaxLoad] = useState('');
  const [mediumTierMaxLoad, setMediumTierMaxLoad] = useState('');
  const [highTierMaxLoad, setHighTierMaxLoad] = useState('');
  
  // Seasonal tiered rate state
  const [summerLowTierPrice, setSummerLowTierPrice] = useState('');
  const [summerMediumTierPrice, setSummerMediumTierPrice] = useState('');
  const [summerHighTierPrice, setSummerHighTierPrice] = useState('');
  const [summerLowTierMaxLoad, setSummerLowTierMaxLoad] = useState('');
  const [summerMediumTierMaxLoad, setSummerMediumTierMaxLoad] = useState('');
  const [summerHighTierMaxLoad, setSummerHighTierMaxLoad] = useState('');
  const [winterLowTierPrice, setWinterLowTierPrice] = useState('');
  const [winterMediumTierPrice, setWinterMediumTierPrice] = useState('');
  const [winterHighTierPrice, setWinterHighTierPrice] = useState('');
  const [winterLowTierMaxLoad, setWinterLowTierMaxLoad] = useState('');
  const [winterMediumTierMaxLoad, setWinterMediumTierMaxLoad] = useState('');
  const [winterHighTierMaxLoad, setWinterHighTierMaxLoad] = useState('');
  
  // Monthly tiered rate state
  const [monthlyTieredPrices, setMonthlyTieredPrices] = useState({});
  const [monthlyTieredMaxLoads, setMonthlyTieredMaxLoads] = useState({});
  
  // Time of Use state
  const [summerOnPeakPrice, setSummerOnPeakPrice] = useState('');
  const [summerMidPeakPrice, setSummerMidPeakPrice] = useState('');
  const [summerOffPeakPrice, setSummerOffPeakPrice] = useState('');
  const [winterOnPeakPrice, setWinterOnPeakPrice] = useState('');
  const [winterMidPeakPrice, setWinterMidPeakPrice] = useState('');
  const [winterOffPeakPrice, setWinterOffPeakPrice] = useState('');
  const [summerPeakHours, setSummerPeakHours] = useState([]);
  const [summerMidPeakHours, setSummerMidPeakHours] = useState([]);
  const [winterPeakHours, setWinterPeakHours] = useState([]);
  const [winterMidPeakHours, setWinterMidPeakHours] = useState([]);

  // Initialize monthly tiered data
  React.useEffect(() => {
    const initialMonthlyTiered = {};
    monthNames.forEach(month => {
      initialMonthlyTiered[month] = {
        lowTierPrice: '',
        mediumTierPrice: '',
        highTierPrice: '',
        lowTierMaxLoad: '',
        mediumTierMaxLoad: '',
        highTierMaxLoad: ''
      };
    });
    setMonthlyTieredPrices(initialMonthlyTiered);
    setMonthlyTieredMaxLoads(initialMonthlyTiered);
  }, []);

  const handleMonthlyTieredChange = (month, field, value) => {
    setMonthlyTieredPrices(prev => ({
      ...prev,
      [month]: {
        ...prev[month],
        [field]: value
      }
    }));
  };

  const handleMonthlyTieredMaxLoadChange = (month, field, value) => {
    setMonthlyTieredMaxLoads(prev => ({
      ...prev,
      [month]: {
        ...prev[month],
        [field]: value
      }
    }));
  };

  const addHourRange = (type, season) => {
    const newRange = { start: '', end: '' };
    if (type === 'peak' && season === 'summer') {
      setSummerPeakHours([...summerPeakHours, newRange]);
    } else if (type === 'midPeak' && season === 'summer') {
      setSummerMidPeakHours([...summerMidPeakHours, newRange]);
    } else if (type === 'peak' && season === 'winter') {
      setWinterPeakHours([...winterPeakHours, newRange]);
    } else if (type === 'midPeak' && season === 'winter') {
      setWinterMidPeakHours([...winterMidPeakHours, newRange]);
    }
  };

  const updateHourRange = (type, season, index, field, value) => {
    if (type === 'peak' && season === 'summer') {
      const updated = [...summerPeakHours];
      updated[index][field] = value;
      setSummerPeakHours(updated);
    } else if (type === 'midPeak' && season === 'summer') {
      const updated = [...summerMidPeakHours];
      updated[index][field] = value;
      setSummerMidPeakHours(updated);
    } else if (type === 'peak' && season === 'winter') {
      const updated = [...winterPeakHours];
      updated[index][field] = value;
      setWinterPeakHours(updated);
    } else if (type === 'midPeak' && season === 'winter') {
      const updated = [...winterMidPeakHours];
      updated[index][field] = value;
      setWinterMidPeakHours(updated);
    }
  };

  const removeHourRange = (type, season, index) => {
    if (type === 'peak' && season === 'summer') {
      setSummerPeakHours(summerPeakHours.filter((_, i) => i !== index));
    } else if (type === 'midPeak' && season === 'summer') {
      setSummerMidPeakHours(summerMidPeakHours.filter((_, i) => i !== index));
    } else if (type === 'peak' && season === 'winter') {
      setWinterPeakHours(winterPeakHours.filter((_, i) => i !== index));
    } else if (type === 'midPeak' && season === 'winter') {
      setWinterMidPeakHours(winterMidPeakHours.filter((_, i) => i !== index));
    }
  };

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
      // Convert selected dates to day-of-year numbers
      const convertedHolidays = holidayDates.map(dateObj => {
        const d = new Date(dateObj);
        const start = new Date(d.getFullYear(), 0, 0);
        const diff = d - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
      });
      
      // Prepare rate structure data based on selected type
      let rateStructureData = {};
      switch (rateStructure) {
        case 'flat':
          rateStructureData = { flatPrice };
          break;
        case 'seasonal':
          rateStructureData = { 
            seasonalPrices: JSON.stringify([summerPrice, winterPrice])
          };
          break;
        case 'monthly':
          rateStructureData = { 
            monthlyPrices: JSON.stringify(Object.values(monthlyPrices))
          };
          break;
        case 'tiered':
          rateStructureData = {
            tieredPrices: JSON.stringify([lowTierPrice, mediumTierPrice, highTierPrice]),
            tierMax: JSON.stringify([lowTierMaxLoad, mediumTierMaxLoad, highTierMaxLoad])
          };
          break;
        case 'seasonalTiered':
          rateStructureData = {
            seasonalTieredPrices: JSON.stringify([
              [summerLowTierPrice, summerMediumTierPrice, summerHighTierPrice],
              [winterLowTierPrice, winterMediumTierPrice, winterHighTierPrice]
            ]),
            seasonalTierMax: JSON.stringify([
              [summerLowTierMaxLoad, summerMediumTierMaxLoad, summerHighTierMaxLoad],
              [winterLowTierMaxLoad, winterMediumTierMaxLoad, winterHighTierMaxLoad]
            ])
          };
          break;
        case 'monthlyTiered':
          // Convert monthly tiered data to the format expected by backend
          const monthlyTieredPricesArray = monthNames.map(month => [
            monthlyTieredPrices[month]?.lowTierPrice || 0,
            monthlyTieredPrices[month]?.mediumTierPrice || 0,
            monthlyTieredPrices[month]?.highTierPrice || 0
          ]);
          const monthlyTieredLimitsArray = monthNames.map(month => [
            monthlyTieredMaxLoads[month]?.lowTierMaxLoad || 0,
            monthlyTieredMaxLoads[month]?.mediumTierMaxLoad || 0,
            monthlyTieredMaxLoads[month]?.highTierMaxLoad || 0
          ]);
          rateStructureData = {
            monthlyTieredPrices: JSON.stringify(monthlyTieredPricesArray),
            monthlyTierLimits: JSON.stringify(monthlyTieredLimitsArray)
          };
          break;
        case 'tou':
          // Convert hour ranges to the format expected by backend (hour numbers)
          const convertHourRangesToHours = (ranges) => {
            const hours = [];
            ranges.forEach(range => {
              if (range.start && range.end) {
                const startHour = parseInt(range.start.split(':')[0]);
                const endHour = parseInt(range.end.split(':')[0]);
                for (let h = startHour; h <= endHour; h++) {
                  hours.push(h);
                }
              }
            });
            return hours;
          };
          
          rateStructureData = {
            onPrice: JSON.stringify([summerOnPeakPrice, winterOnPeakPrice]),
            midPrice: JSON.stringify([summerMidPeakPrice, winterMidPeakPrice]),
            offPrice: JSON.stringify([summerOffPeakPrice, winterOffPeakPrice]),
            onHours: JSON.stringify([
              convertHourRangesToHours(summerPeakHours),
              convertHourRangesToHours(winterPeakHours)
            ]),
            midHours: JSON.stringify([
              convertHourRangesToHours(summerMidPeakHours),
              convertHourRangesToHours(winterMidPeakHours)
            ])
          };
          break;
        default:
          rateStructureData = {};
      }
      
      // Send all grid data and new fields
      const payload = {
        ...gridData,
        season: seasonMonths,
        holidays: convertedHolidays,
        rateStructure,
        ...rateStructureData
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
              results: results.result, // Use the comprehensive results object
              generatedFiles: results.generated_files,
              userId: results.user_id,
              status: results.status,
              message: results.message
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
      <Box sx={{ mb: 3 }}>
        <DatePicker
          multiple
          value={holidayDates}
          onChange={setHolidayDates}
          format="YYYY-MM-DD"
          placeholder="Select holiday dates"
          style={{ minWidth: 0, width: '100%', height: 56, fontSize: 18, borderRadius: 4, border: '1px solid #c4c4c4' }}
        />
      </Box>
      <Typography variant="h5" gutterBottom>
        Select a Utility Structure:
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

      {/* Flat Rate */}
      {rateStructure === 'flat' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h4" gutterBottom>
            Flat Rate
          </Typography>
          <TextField
            fullWidth
            label="Flat Price"
            value={flatPrice}
            onChange={e => setFlatPrice(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            placeholder="Enter flat rate price"
          />
        </Box>
      )}

      {/* Seasonal Rate */}
      {rateStructure === 'seasonal' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h4" gutterBottom>
            Seasonal Rate
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Summer Price"
              value={summerPrice}
              onChange={e => setSummerPrice(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              placeholder="Summer Price"
            />
            <TextField
              fullWidth
              label="Winter Price"
              value={winterPrice}
              onChange={e => setWinterPrice(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              placeholder="Winter Price"
            />
          </Box>
        </Box>
      )}

      {/* Monthly Rate */}
      {rateStructure === 'monthly' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h4" gutterBottom>
            Enter Monthly Prices:
          </Typography>
          <Grid container spacing={2}>
            {monthNames.map(month => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={month}>
                <TextField
                  fullWidth
                  label={`${month} Price:`}
                  value={monthlyPrices[month]}
                  onChange={e => setMonthlyPrices(prev => ({ ...prev, [month]: e.target.value }))}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  placeholder={`${month} Price:`}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Tiered Rate */}
      {rateStructure === 'tiered' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h4" gutterBottom>
            Tiered Rate
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Low Tier Price:"
                  value={lowTierPrice}
                  onChange={e => setLowTierPrice(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  placeholder="Low Tier Price:"
                />
                <TextField
                  fullWidth
                  label="Medium Tier Price:"
                  value={mediumTierPrice}
                  onChange={e => setMediumTierPrice(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  placeholder="Medium Tier Price:"
                />
                <TextField
                  fullWidth
                  label="High Tier Price:"
                  value={highTierPrice}
                  onChange={e => setHighTierPrice(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  placeholder="High Tier Price:"
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Low Tier Max Load (kWh):"
                  value={lowTierMaxLoad}
                  onChange={e => setLowTierMaxLoad(e.target.value)}
                  placeholder="Low Tier Max Load (kWh):"
                />
                <TextField
                  fullWidth
                  label="Medium Tier Max Load (kWh):"
                  value={mediumTierMaxLoad}
                  onChange={e => setMediumTierMaxLoad(e.target.value)}
                  placeholder="Medium Tier Max Load (kWh):"
                />
                <TextField
                  fullWidth
                  label="High Tier Max Load (kWh):"
                  value={highTierMaxLoad}
                  onChange={e => setHighTierMaxLoad(e.target.value)}
                  placeholder="High Tier Max Load (kWh):"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Seasonal Tiered Rate */}
      {rateStructure === 'seasonalTiered' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h4" gutterBottom>
            Seasonal Tiered Rate
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" component="h5" gutterBottom>
                Summer Rates
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Low Tier Price"
                  value={summerLowTierPrice}
                  onChange={e => setSummerLowTierPrice(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  placeholder="Low Tier Price"
                />
                <TextField
                  fullWidth
                  label="Low Tier Max Load"
                  value={summerLowTierMaxLoad}
                  onChange={e => setSummerLowTierMaxLoad(e.target.value)}
                  placeholder="Low Tier Max Load"
                />
                <TextField
                  fullWidth
                  label="Medium Tier Price"
                  value={summerMediumTierPrice}
                  onChange={e => setSummerMediumTierPrice(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  placeholder="Medium Tier Price"
                />
                <TextField
                  fullWidth
                  label="Medium Tier Max Load"
                  value={summerMediumTierMaxLoad}
                  onChange={e => setSummerMediumTierMaxLoad(e.target.value)}
                  placeholder="Medium Tier Max Load"
                />
                <TextField
                  fullWidth
                  label="High Tier Price"
                  value={summerHighTierPrice}
                  onChange={e => setSummerHighTierPrice(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  placeholder="High Tier Price"
                />
                <TextField
                  fullWidth
                  label="High Tier Max Load"
                  value={summerHighTierMaxLoad}
                  onChange={e => setSummerHighTierMaxLoad(e.target.value)}
                  placeholder="High Tier Max Load"
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" component="h5" gutterBottom>
                Winter Rates
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Low Tier Price"
                  value={winterLowTierPrice}
                  onChange={e => setWinterLowTierPrice(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  placeholder="Low Tier Price"
                />
                <TextField
                  fullWidth
                  label="Low Tier Max Load"
                  value={winterLowTierMaxLoad}
                  onChange={e => setWinterLowTierMaxLoad(e.target.value)}
                  placeholder="Low Tier Max Load"
                />
                <TextField
                  fullWidth
                  label="Medium Tier Price"
                  value={winterMediumTierPrice}
                  onChange={e => setWinterMediumTierPrice(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  placeholder="Medium Tier Price"
                />
                <TextField
                  fullWidth
                  label="Medium Tier Max Load"
                  value={winterMediumTierMaxLoad}
                  onChange={e => setWinterMediumTierMaxLoad(e.target.value)}
                  placeholder="Medium Tier Max Load"
                />
                <TextField
                  fullWidth
                  label="High Tier Price"
                  value={winterHighTierPrice}
                  onChange={e => setWinterHighTierPrice(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  placeholder="High Tier Price"
                />
                <TextField
                  fullWidth
                  label="High Tier Max Load"
                  value={winterHighTierMaxLoad}
                  onChange={e => setWinterHighTierMaxLoad(e.target.value)}
                  placeholder="High Tier Max Load"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Monthly Tiered Rate */}
      {rateStructure === 'monthlyTiered' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h4" gutterBottom>
            Monthly Tiered Rates
          </Typography>
          {monthNames.map(month => (
            <Box key={month} sx={{ mb: 4 }}>
              <Typography variant="subtitle1" component="h5" gutterBottom>
                {month}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Low Tier Price"
                      value={monthlyTieredPrices[month]?.lowTierPrice || ''}
                      onChange={e => handleMonthlyTieredChange(month, 'lowTierPrice', e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      placeholder="Low Tier Price"
                    />
                    <TextField
                      fullWidth
                      label="Low Tier Max Load"
                      value={monthlyTieredMaxLoads[month]?.lowTierMaxLoad || ''}
                      onChange={e => handleMonthlyTieredMaxLoadChange(month, 'lowTierMaxLoad', e.target.value)}
                      placeholder="Low Tier Max Load"
                    />
                    <TextField
                      fullWidth
                      label="Medium Tier Price"
                      value={monthlyTieredPrices[month]?.mediumTierPrice || ''}
                      onChange={e => handleMonthlyTieredChange(month, 'mediumTierPrice', e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      placeholder="Medium Tier Price"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Medium Tier Max Load"
                      value={monthlyTieredMaxLoads[month]?.mediumTierMaxLoad || ''}
                      onChange={e => handleMonthlyTieredMaxLoadChange(month, 'mediumTierMaxLoad', e.target.value)}
                      placeholder="Medium Tier Max Load"
                    />
                    <TextField
                      fullWidth
                      label="High Tier Price"
                      value={monthlyTieredPrices[month]?.highTierPrice || ''}
                      onChange={e => handleMonthlyTieredChange(month, 'highTierPrice', e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      placeholder="High Tier Price"
                    />
                    <TextField
                      fullWidth
                      label="High Tier Max Load"
                      value={monthlyTieredMaxLoads[month]?.highTierMaxLoad || ''}
                      onChange={e => handleMonthlyTieredMaxLoadChange(month, 'highTierMaxLoad', e.target.value)}
                      placeholder="High Tier Max Load"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>
      )}

      {/* Time of Use */}
      {rateStructure === 'tou' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h4" gutterBottom>
            Time of Use Rates
          </Typography>
          
          {/* Summer Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" component="h5" gutterBottom>
              Summer
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                label="Peak Rate"
                value={summerOnPeakPrice}
                onChange={e => setSummerOnPeakPrice(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                fullWidth
              />
              <TextField
                label="Mid-Peak Rate"
                value={summerMidPeakPrice}
                onChange={e => setSummerMidPeakPrice(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                fullWidth
              />
              <TextField
                label="Off-Peak Rate"
                value={summerOffPeakPrice}
                onChange={e => setSummerOffPeakPrice(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                fullWidth
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" component="h6" gutterBottom>
                Summer Peak Hours
              </Typography>
              <Button
                variant="outlined"
                onClick={() => addHourRange('peak', 'summer')}
                sx={{ borderColor: 'purple', color: 'purple' }}
              >
                ADD PEAK HOUR RANGE
              </Button>
              {summerPeakHours.map((range, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <TextField
                    type="time"
                    value={range.start}
                    onChange={(e) => updateHourRange('peak', 'summer', index, 'start', e.target.value)}
                    placeholder="Start time"
                    sx={{ flex: 1 }}
                  />
                  <Typography variant="body1" sx={{ mx: 1 }}>→</Typography>
                  <TextField
                    type="time"
                    value={range.end}
                    onChange={(e) => updateHourRange('peak', 'summer', index, 'end', e.target.value)}
                    placeholder="End time"
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeHourRange('peak', 'summer', index)}
                    size="small"
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" component="h6" gutterBottom>
                Summer Mid-Peak Hours
              </Typography>
              <Button
                variant="outlined"
                onClick={() => addHourRange('midPeak', 'summer')}
                sx={{ borderColor: 'purple', color: 'purple' }}
              >
                ADD MID-PEAK HOUR RANGE
              </Button>
              {summerMidPeakHours.map((range, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <TextField
                    type="time"
                    value={range.start}
                    onChange={(e) => updateHourRange('midPeak', 'summer', index, 'start', e.target.value)}
                    placeholder="Start time"
                    sx={{ flex: 1 }}
                  />
                  <Typography variant="body1" sx={{ mx: 1 }}>→</Typography>
                  <TextField
                    type="time"
                    value={range.end}
                    onChange={(e) => updateHourRange('midPeak', 'summer', index, 'end', e.target.value)}
                    placeholder="End time"
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeHourRange('midPeak', 'summer', index)}
                    size="small"
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
          
          {/* Winter Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" component="h5" gutterBottom>
              Winter
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                label="Peak Rate"
                value={winterOnPeakPrice}
                onChange={e => setWinterOnPeakPrice(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                fullWidth
              />
              <TextField
                label="Mid-Peak Rate"
                value={winterMidPeakPrice}
                onChange={e => setWinterMidPeakPrice(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                fullWidth
              />
              <TextField
                label="Off-Peak Rate"
                value={winterOffPeakPrice}
                onChange={e => setWinterOffPeakPrice(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                fullWidth
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" component="h6" gutterBottom>
                Winter Peak Hours
              </Typography>
              <Button
                variant="outlined"
                onClick={() => addHourRange('peak', 'winter')}
                sx={{ borderColor: 'purple', color: 'purple' }}
              >
                ADD PEAK HOUR RANGE
              </Button>
              {winterPeakHours.map((range, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <TextField
                    type="time"
                    value={range.start}
                    onChange={(e) => updateHourRange('peak', 'winter', index, 'start', e.target.value)}
                    placeholder="Start time"
                    sx={{ flex: 1 }}
                  />
                  <Typography variant="body1" sx={{ mx: 1 }}>→</Typography>
                  <TextField
                    type="time"
                    value={range.end}
                    onChange={(e) => updateHourRange('peak', 'winter', index, 'end', e.target.value)}
                    placeholder="End time"
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeHourRange('peak', 'winter', index)}
                    size="small"
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" component="h6" gutterBottom>
                Winter Mid-Peak Hours
              </Typography>
              <Button
                variant="outlined"
                onClick={() => addHourRange('midPeak', 'winter')}
                sx={{ borderColor: 'purple', color: 'purple' }}
              >
                ADD MID-PEAK HOUR RANGE
              </Button>
              {winterMidPeakHours.map((range, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <TextField
                    type="time"
                    value={range.start}
                    onChange={(e) => updateHourRange('midPeak', 'winter', index, 'start', e.target.value)}
                    placeholder="Start time"
                    sx={{ flex: 1 }}
                  />
                  <Typography variant="body1" sx={{ mx: 1 }}>→</Typography>
                  <TextField
                    type="time"
                    value={range.end}
                    onChange={(e) => updateHourRange('midPeak', 'winter', index, 'end', e.target.value)}
                    placeholder="End time"
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeHourRange('midPeak', 'winter', index)}
                    size="small"
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
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

export default GridConfig; 