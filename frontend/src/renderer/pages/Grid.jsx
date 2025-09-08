import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SaveMessageAlert from '../components/SaveMessageAlert'
import UtilityStructure from '../components/fields/UtilityStructure'
import { useFormData } from '../hooks/useFormData'
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

function GridConfig({ auth, user }) {
  const navigate = useNavigate()
  
  // Use useFormData hook for all form state
  const { data: formData, updateData } = useFormData('grid', {
    // Grid connection data
    Grid: null,
    NEM: null,
    Annual_expenses: 0.0,
    Grid_sale_tax_rate: 0.0,
    Grid_Tax_amount: 0.0,
    Grid_escalation_rate: 2.0,
    Grid_credit: 0.0,
    NEM_fee: 0.0,
    SC_flat: 9.95,
    Pbuy_max: 6.0,
    Psell_max: 200.0,
    compensation_option: '1:1',
    flat_compensation: '',
    monthly_compensation: {},
    
    // UI state
    currentStep: 1, // 1: Grid connected?, 2: Net metered?, 3: Configuration
    compareOffGrid: null, // null, true, or false
    seasonMonths: [],
    holidayDates: [], // Array of Date objects
    rateStructure: '',
    
    // Rate structure specific state
    flatPrice: '',
    summerPrice: '',
    winterPrice: '',
    monthlyPrices: {
      January: '', February: '', March: '', April: '', May: '', June: '',
      July: '', August: '', September: '', October: '', November: '', December: ''
    },
    
    // Tiered rate state
    lowTierPrice: '',
    mediumTierPrice: '',
    highTierPrice: '',
    lowTierMaxLoad: '',
    mediumTierMaxLoad: '',
    highTierMaxLoad: '',
    
    // Seasonal tiered rate state
    summerLowTierPrice: '',
    summerMediumTierPrice: '',
    summerHighTierPrice: '',
    summerLowTierMaxLoad: '',
    summerMediumTierMaxLoad: '',
    summerHighTierMaxLoad: '',
    winterLowTierPrice: '',
    winterMediumTierPrice: '',
    winterHighTierPrice: '',
    winterLowTierMaxLoad: '',
    winterMediumTierMaxLoad: '',
    winterHighTierMaxLoad: '',
    
    // Monthly tiered rate state
    monthlyTieredPrices: {},
    monthlyTieredMaxLoads: {},
    
    // Time of Use state
    summerOnPeakPrice: '',
    summerMidPeakPrice: '',
    summerOffPeakPrice: '',
    winterOnPeakPrice: '',
    winterMidPeakPrice: '',
    winterOffPeakPrice: '',
    summerPeakHours: [],
    summerMidPeakHours: [],
    winterPeakHours: [],
    winterMidPeakHours: []
  });
  
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Initialize monthly tiered data
  React.useEffect(() => {
    if (!formData.monthlyTieredPrices || Object.keys(formData.monthlyTieredPrices).length === 0) {
      const initialMonthlyTiered = {};
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
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
      updateData({
        monthlyTieredPrices: initialMonthlyTiered,
        monthlyTieredMaxLoads: initialMonthlyTiered
      });
    }
  }, [formData.monthlyTieredPrices, updateData]);

  const isFormValid = () => {
    // If grid is not connected and user hasn't answered the comparison question yet
    if (!formData.Grid && formData.currentStep < 3) {
      return false;
    }
    
    // If grid is not connected and user doesn't want to compare, no validation needed
    if (!formData.Grid && formData.compareOffGrid === false) {
      return true;
    }
    
    // If grid is connected OR if off-grid user wants to compare, validate required fields
    if (formData.Grid || (!formData.Grid && formData.compareOffGrid === true)) {
      // Check if all required numeric fields have valid values
      const requiredFields = [
        'Annual_expenses',
        'Grid_sale_tax_rate', 
        'Grid_Tax_amount',
        'Grid_escalation_rate',
        'Grid_credit',
        'SC_flat',
        'Pbuy_max',
        'Psell_max'
      ];
      
      // Validate that all required fields have numeric values (not empty strings or null)
      for (const field of requiredFields) {
        if (formData[field] === '' || formData[field] === null || formData[field] === undefined) {
          return false;
        }
      }
      
      // Only validate NEM_fee if NEM is enabled
      if (formData.NEM && (formData.NEM_fee === '' || formData.NEM_fee === null || formData.NEM_fee === undefined)) {
        return false;
      }
      
      // Validate compensation option if grid is connected
      if (formData.Grid && !formData.compensation_option) {
        return false;
      }
      
      // Validate flat compensation if that option is selected
      if (formData.compensation_option === 'flat' && 
          (formData.flat_compensation === '' || formData.flat_compensation === null || formData.flat_compensation === undefined)) {
        return false;
      }
      
      // Validate monthly compensation if that option is selected
      if (formData.compensation_option === 'monthly') {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];
        
        for (const month of monthNames) {
          const monthlyValue = formData.monthly_compensation?.[month];
          if (monthlyValue === '' || monthlyValue === null || monthlyValue === undefined) {
            return false;
          }
        }
      }
      
      return true;
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
      const convertedHolidays = formData.holidayDates.map(dateObj => {
        const d = new Date(dateObj);
        const start = new Date(d.getFullYear(), 0, 0);
        const diff = d - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
      });
      
      // Map rate structure strings to numbers
      const rateStructureMapping = {
        'flat': 1,
        'seasonal': 2,
        'monthly': 3,
        'tiered': 4,
        'seasonalTiered': 5,
        'monthlyTiered': 6,
        'tou': 7
      };

      // Prepare rate structure data based on selected type
      let rateStructureData = {};
      const rateStructureNumber = rateStructureMapping[formData.rateStructure] || 6; // Default to 6 if not found
      
      switch (formData.rateStructure) {
        case 'flat':
          rateStructureData = { flatPrice: formData.flatPrice };
          break;
        case 'seasonal':
          rateStructureData = { 
            seasonalPrices: JSON.stringify([formData.summerPrice, formData.winterPrice])
          };
          break;
        case 'monthly':
          rateStructureData = { 
            monthlyPrices: JSON.stringify(Object.values(formData.monthlyPrices))
          };
          break;
        case 'tiered':
          rateStructureData = {
            tieredPrices: JSON.stringify([formData.lowTierPrice, formData.mediumTierPrice, formData.highTierPrice]),
            tierMax: JSON.stringify([formData.lowTierMaxLoad, formData.mediumTierMaxLoad, formData.highTierMaxLoad])
          };
          break;
        case 'seasonalTiered':
          rateStructureData = {
            seasonalTieredPrices: JSON.stringify([
              [formData.summerLowTierPrice, formData.summerMediumTierPrice, formData.summerHighTierPrice],
              [formData.winterLowTierPrice, formData.winterMediumTierPrice, formData.winterHighTierPrice]
            ]),
            seasonalTierMax: JSON.stringify([
              [formData.summerLowTierMaxLoad, formData.summerMediumTierMaxLoad, formData.summerHighTierMaxLoad],
              [formData.winterLowTierMaxLoad, formData.winterMediumTierMaxLoad, formData.winterHighTierMaxLoad]
            ])
          };
          break;
        case 'monthlyTiered':
          // Convert monthly tiered data to the format expected by backend
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
          const monthlyTieredPricesArray = monthNames.map(month => [
            formData.monthlyTieredPrices[month]?.lowTierPrice || 0,
            formData.monthlyTieredPrices[month]?.mediumTierPrice || 0,
            formData.monthlyTieredPrices[month]?.highTierPrice || 0
          ]);
          const monthlyTieredLimitsArray = monthNames.map(month => [
            formData.monthlyTieredMaxLoads[month]?.lowTierMaxLoad || 0,
            formData.monthlyTieredMaxLoads[month]?.mediumTierMaxLoad || 0,
            formData.monthlyTieredMaxLoads[month]?.highTierMaxLoad || 0
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
            onPrice: JSON.stringify([formData.summerOnPeakPrice, formData.winterOnPeakPrice]),
            midPrice: JSON.stringify([formData.summerMidPeakPrice, formData.winterMidPeakPrice]),
            offPrice: JSON.stringify([formData.summerOffPeakPrice, formData.winterOffPeakPrice]),
            onHours: JSON.stringify([
              convertHourRangesToHours(formData.summerPeakHours),
              convertHourRangesToHours(formData.winterPeakHours)
            ]),
            midHours: JSON.stringify([
              convertHourRangesToHours(formData.summerMidPeakHours),
              convertHourRangesToHours(formData.winterMidPeakHours)
            ])
          };
          break;
        default:
          rateStructureData = {};
      }
      
      // Convert monthly_compensation to JSON string if it exists and has data
      const monthlyCompensationJson = Object.keys(formData.monthly_compensation || {}).length > 0 
        ? JSON.stringify(formData.monthly_compensation)
        : null;
      
      // Send all grid data and new fields
      const payload = {
        ...formData,
        season: JSON.stringify(formData.seasonMonths),
        holidays: JSON.stringify(convertedHolidays),
        rateStructure: rateStructureNumber, // Send numeric value instead of string
        monthly_compensation: monthlyCompensationJson, // Convert to JSON string or null
        // Ensure all complex objects are JSON stringified
        monthlyPrices: JSON.stringify(formData.monthlyPrices),
        monthlyTieredPrices: JSON.stringify(formData.monthlyTieredPrices),
        monthlyTieredMaxLoads: JSON.stringify(formData.monthlyTieredMaxLoads),
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
    updateData({
      [field]: event.target.value === '' ? '' : parseFloat(event.target.value)
    })
  }

  const handleStringInputChange = (field) => (event) => {
    updateData({
      [field]: event.target.value
    })
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
          value={formData.Grid === null ? '' : formData.Grid}
          onChange={(e) => {
            const isConnected = e.target.value;
            updateData({
              Grid: isConnected,
              // Reset NEM if grid is disconnected
              NEM: isConnected ? formData.NEM : false,
              // Set default compensation option to '1:1' when grid is connected (matches old working code)
              compensation_option: isConnected ? '1:1' : formData.compensation_option,
              currentStep: 2 // Move to net metering question
            });
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
          value={formData.compareOffGrid === null ? '' : formData.compareOffGrid}
          onChange={(e) => {
            updateData({
              compareOffGrid: e.target.value,
              currentStep: 3
            });
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
        {formData.Grid 
          ? "Does your utility offer net metering for your grid connection?"
          : "If you were connected to the grid, would your utility offer net metering?"
        }
      </Typography>
      <FormControl fullWidth>
        <InputLabel id="net-metering-label">Net Metering</InputLabel>
        <Select
          labelId="net-metering-label"
          value={formData.NEM === null ? '' : formData.NEM}
          onChange={(e) => {
            updateData({
              NEM: e.target.value,
              currentStep: 3 // Move to next step (comparison question or configuration)
            });
          }}
          input={<OutlinedInput label="Net Metering" />}
        >
          <MenuItem value={true}>
            {formData.Grid 
              ? "Yes, I have net metering"
              : "Yes, my utility would offer net metering"
            }
          </MenuItem>
          <MenuItem value={false}>
            {formData.Grid 
              ? "No, I don't have net metering"
              : "No, my utility would not offer net metering"
            }
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );

  const renderStep3 = () => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    return (
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
                value={formData.Annual_expenses} 
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
                value={formData.Grid_sale_tax_rate} 
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
                value={formData.Grid_Tax_amount} 
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
                value={formData.Grid_escalation_rate} 
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
                value={formData.Grid_credit} 
                onChange={handleInputChange('Grid_credit')} 
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Box>
            {formData.NEM && (
            <Box>
              <Typography variant="subtitle1" component="h4" gutterBottom>Net Metering Fee</Typography>
              <TextField 
                fullWidth 
                type="number" 
                placeholder="Net Metering Fee*"
                value={formData.NEM_fee} 
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
                value={formData.SC_flat} 
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
              <Typography variant="subtitle1" component="h4" gutterBottom>Compensation Option</Typography>
              <FormControl fullWidth>
                <InputLabel id="compensation-option-label">Compensation Option</InputLabel>
                <Select
                  labelId="compensation-option-label"
                  value={formData.compensation_option}
                  onChange={handleStringInputChange('compensation_option')}
                  input={<OutlinedInput label="Compensation Option" />}
                >
                  <MenuItem value="1:1">1:1 Compensation</MenuItem>
                  <MenuItem value="flat">Flat Compensation</MenuItem>
                  <MenuItem value="monthly">Monthly Compensation</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Flat Compensation Field */}
            {formData.compensation_option === 'flat' && (
              <Box>
                <Typography variant="subtitle1" component="h4" gutterBottom>Flat Compensation</Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="Enter flat compensation value"
                  value={formData.flat_compensation || ''}
                  onChange={handleInputChange('flat_compensation')}
                  variant="outlined"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Box>
            )}

            {/* Monthly Compensation Grid */}
            {formData.compensation_option === 'monthly' && (
              <Box>
                <Typography variant="subtitle1" component="h4" gutterBottom>Enter Monthly Prices:</Typography>
                <Grid container spacing={2}>
                  {monthNames.map(month => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={month}>
                      <TextField
                        fullWidth
                        label={`${month} Price:`}
                        value={formData.monthly_compensation?.[month] || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateData({
                            monthly_compensation: {
                              ...formData.monthly_compensation,
                              [month]: value
                            }
                          });
                        }}
                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                        placeholder={`${month} Price:`}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            <Box>
              <Typography variant="subtitle1" component="h4" gutterBottom>Purchase Capacity</Typography>
              <TextField 
                fullWidth 
                type="number" 
                placeholder="Purchase Capacity*"
                value={formData.Pbuy_max} 
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
                value={formData.Psell_max} 
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
  };

  const renderOffGridExtras = () => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    
    return (
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
            value={formData.seasonMonths}
            onChange={e => updateData({ seasonMonths: e.target.value })}
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
            value={formData.holidayDates}
            onChange={(dates) => updateData({ holidayDates: dates })}
            format="YYYY-MM-DD"
            placeholder="Select holiday dates"
            style={{ 
              minWidth: 0, 
              width: '100%', 
              height: 56, 
              fontSize: 18, 
              borderRadius: 4, 
              border: '1px solid #c4c4c4',
              backgroundColor: 'transparent'
            }}
          />
        </Box>
        
        <UtilityStructure
          rateStructure={formData.rateStructure}
          setRateStructure={(value) => updateData({ rateStructure: value })}
          flatPrice={formData.flatPrice}
          setFlatPrice={(value) => updateData({ flatPrice: value })}
          summerPrice={formData.summerPrice}
          setSummerPrice={(value) => updateData({ summerPrice: value })}
          winterPrice={formData.winterPrice}
          setWinterPrice={(value) => updateData({ winterPrice: value })}
          monthlyPrices={formData.monthlyPrices}
          setMonthlyPrices={(value) => updateData({ monthlyPrices: value })}
          lowTierPrice={formData.lowTierPrice}
          setLowTierPrice={(value) => updateData({ lowTierPrice: value })}
          mediumTierPrice={formData.mediumTierPrice}
          setMediumTierPrice={(value) => updateData({ mediumTierPrice: value })}
          highTierPrice={formData.highTierPrice}
          setHighTierPrice={(value) => updateData({ highTierPrice: value })}
          lowTierMaxLoad={formData.lowTierMaxLoad}
          setLowTierMaxLoad={(value) => updateData({ lowTierMaxLoad: value })}
          mediumTierMaxLoad={formData.mediumTierMaxLoad}
          setMediumTierMaxLoad={(value) => updateData({ mediumTierMaxLoad: value })}
          highTierMaxLoad={formData.highTierMaxLoad}
          setHighTierMaxLoad={(value) => updateData({ highTierMaxLoad: value })}
          summerLowTierPrice={formData.summerLowTierPrice}
          setSummerLowTierPrice={(value) => updateData({ summerLowTierPrice: value })}
          summerMediumTierPrice={formData.summerMediumTierPrice}
          setSummerMediumTierPrice={(value) => updateData({ summerMediumTierPrice: value })}
          summerHighTierPrice={formData.summerHighTierPrice}
          setSummerHighTierPrice={(value) => updateData({ summerHighTierPrice: value })}
          summerLowTierMaxLoad={formData.summerLowTierMaxLoad}
          setSummerLowTierMaxLoad={(value) => updateData({ summerLowTierMaxLoad: value })}
          summerMediumTierMaxLoad={formData.summerMediumTierMaxLoad}
          setSummerMediumTierMaxLoad={(value) => updateData({ summerMediumTierMaxLoad: value })}
          summerHighTierMaxLoad={formData.summerHighTierMaxLoad}
          setSummerHighTierMaxLoad={(value) => updateData({ summerHighTierMaxLoad: value })}
          winterLowTierPrice={formData.winterLowTierPrice}
          setWinterLowTierPrice={(value) => updateData({ winterLowTierPrice: value })}
          winterMediumTierPrice={formData.winterMediumTierPrice}
          setWinterMediumTierPrice={(value) => updateData({ winterMediumTierPrice: value })}
          winterHighTierPrice={formData.winterHighTierPrice}
          setWinterHighTierPrice={(value) => updateData({ winterHighTierPrice: value })}
          winterLowTierMaxLoad={formData.winterLowTierMaxLoad}
          setWinterLowTierMaxLoad={(value) => updateData({ winterLowTierMaxLoad: value })}
          winterMediumTierMaxLoad={formData.winterMediumTierMaxLoad}
          setWinterMediumTierMaxLoad={(value) => updateData({ winterMediumTierMaxLoad: value })}
          winterHighTierMaxLoad={formData.winterHighTierMaxLoad}
          setWinterHighTierMaxLoad={(value) => updateData({ winterHighTierMaxLoad: value })}
          monthlyTieredPrices={formData.monthlyTieredPrices}
          setMonthlyTieredPrices={(value) => updateData({ monthlyTieredPrices: value })}
          monthlyTieredMaxLoads={formData.monthlyTieredMaxLoads}
          setMonthlyTieredMaxLoads={(value) => updateData({ monthlyTieredMaxLoads: value })}
          summerOnPeakPrice={formData.summerOnPeakPrice}
          setSummerOnPeakPrice={(value) => updateData({ summerOnPeakPrice: value })}
          summerMidPeakPrice={formData.summerMidPeakPrice}
          setSummerMidPeakPrice={(value) => updateData({ summerMidPeakPrice: value })}
          summerOffPeakPrice={formData.summerOffPeakPrice}
          setSummerOffPeakPrice={(value) => updateData({ summerOffPeakPrice: value })}
          winterOnPeakPrice={formData.winterOnPeakPrice}
          setWinterOnPeakPrice={(value) => updateData({ winterOnPeakPrice: value })}
          winterMidPeakPrice={formData.winterMidPeakPrice}
          setWinterMidPeakPrice={(value) => updateData({ winterMidPeakPrice: value })}
          winterOffPeakPrice={formData.winterOffPeakPrice}
          setWinterOffPeakPrice={(value) => updateData({ winterOffPeakPrice: value })}
          summerPeakHours={formData.summerPeakHours}
          setSummerPeakHours={(value) => updateData({ summerPeakHours: value })}
          summerMidPeakHours={formData.summerMidPeakHours}
          setSummerMidPeakHours={(value) => updateData({ summerMidPeakHours: value })}
          winterPeakHours={formData.winterPeakHours}
          setWinterPeakHours={(value) => updateData({ winterPeakHours: value })}
          winterMidPeakHours={formData.winterMidPeakHours}
          setWinterMidPeakHours={(value) => updateData({ winterMidPeakHours: value })}
        />
      </Box>
    );
  };

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
        {formData.currentStep >= 2 && (
          formData.Grid === true
            ? renderStep2() // Net Metering
            : renderOffGridCompareQuestion() // Off-grid comparison
        )}

        {/* Show grid parameter fields if grid is connected and both questions are answered, or if off-grid and user wants to compare */}
        {((formData.Grid === true && formData.currentStep >= 3) || (formData.Grid === false && formData.currentStep >= 3 && formData.compareOffGrid === true)) && renderStep3()}

        {/* Always show summer months, holidays, and rate structure after grid params if grid params are shown */}
        {((formData.Grid === true && formData.currentStep >= 3) || (formData.Grid === false && formData.currentStep >= 3 && formData.compareOffGrid === true)) && renderOffGridExtras()}

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
              {!formData.Grid && formData.currentStep < 3 
                ? "Please answer both questions to continue"
                : (formData.Grid || (!formData.Grid && formData.compareOffGrid === true))
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