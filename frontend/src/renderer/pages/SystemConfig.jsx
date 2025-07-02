import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NextPageButton from '../components/NextPageButton'
import SaveMessageAlert from '../components/SaveMessageAlert'
import { 
  Typography, 
  TextField, 
  Box, 
  Divider,
  FormControlLabel,
  Checkbox,
  FormGroup,
  InputAdornment,
  Button
} from "@mui/material"

function SystemConfig({ auth, user }) {
  const navigate = useNavigate()
  const [systemData, setSystemData] = useState({
    lifetime: 25,
    LPSP_max_rate: 0.0999999,
    RE_min_rate: 75.0,
    annualData: 9,
    PV: false,
    WT: false,
    DG: false,
    Bat: false
  })
  const [consumptionPath, setConsumptionPath] = useState({ hourly: null, monthly: null, annual: null });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [monthlyData, setMonthlyData] = useState(Array(12).fill(''));
  const [hourlyData, setHourlyData] = useState([]);

  const isFormValid = () => {
    const isSystemParamsValid =
      systemData.lifetime !== '' &&
      systemData.LPSP_max_rate !== '' &&
      systemData.RE_min_rate !== '';

    if (!isSystemParamsValid) return false;

    if (consumptionPath.hourly === 'yes') {
      return !!uploadedFile;
    }
    if (consumptionPath.hourly === 'no') {
      if (consumptionPath.monthly === 'yes') {
        return monthlyData.every(val => val !== '' && !isNaN(parseFloat(val)));
      }
      if (consumptionPath.monthly === 'no') {
        if (consumptionPath.annual === 'yes') {
          return systemData.annualData !== '' && !isNaN(parseFloat(systemData.annualData));
        }
        if (consumptionPath.annual === 'no') {
          return systemData.annualData !== '' && !isNaN(parseFloat(systemData.annualData));
        }
      }
    }
    return false;
  };

  const saveSystemData = async () => {
    if (!user) return
    
    setSaving(true)
    setSaveMessage('')

    const formData = new FormData();
    
    // Append system data
    Object.keys(systemData).forEach(key => {
      formData.append(key, systemData[key]);
    });
    
    // Append consumption data source
    const getConsumptionDataSource = () => {
      if (consumptionPath.hourly === 'yes') return 'hourly';
      if (consumptionPath.monthly === 'yes') return 'monthly';
      if (consumptionPath.annual === 'yes') return 'annual';
      return 'manual';
    };
    formData.append('consumptionDataSource', getConsumptionDataSource());

    // Append monthly data if manually entered
    if (consumptionPath.monthly === 'yes') {
      monthlyData.forEach((value, index) => {
        formData.append(`month_${index}`, value);
      });
    }

    // Append hourly data if uploaded via CSV
    if (consumptionPath.hourly === 'yes' && hourlyData.length > 0) {
      hourlyData.forEach((value, index) => {
        formData.append(`hour_${index}`, value);
      });
    }
    
    try {
      const token = await user.getIdToken()
      const response = await fetch('http://127.0.0.1:5000/api/system-config', {
        method: 'POST',
        headers: {
          // Content-Type is not set, browser will set it for FormData
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      if (response.ok) {
        setSaveMessage('System configuration saved successfully!')
        
        // Navigate to the next page based on component selection
        setTimeout(() => {
          const { PV, WT, DG, Bat } = systemData
          
          if (PV) {
            navigate('/pv-config')
          } else if (WT) {
            navigate('/wind-config')
          } else if (DG) {
            navigate('/dg-config')
          } else if (Bat) {
            navigate('/battery-config')
          } else {
            navigate('/grid-config')
          }
        }, 1500)
      } else {
        setSaveMessage('Failed to save data')
      }
    } catch (error) {
      setSaveMessage('Error saving data: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleConsumptionChoice = (step, choice) => {
    if (step === 'hourly') {
      setConsumptionPath({ hourly: choice, monthly: null, annual: null });
    } else if (step === 'monthly') {
      setConsumptionPath(p => ({ ...p, monthly: choice, annual: null }));
    } else if (step === 'annual') {
      setConsumptionPath(p => ({ ...p, annual: choice }));
      if (choice === 'yes') {
        setSystemData(prev => ({ ...prev, annualData: '' }));
      } else if (choice === 'no') {
        setSystemData(prev => ({ ...prev, annualData: 9 })); // default value
      }
    }
    setUploadedFile(null); // Reset file on any choice change
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setUploadedFile(file);
      
      // Read and convert CSV to JSON array
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target.result;
        const lines = csvText.trim().split('\n');
        const values = lines.map(line => parseFloat(line.trim()));
        
        // Validate the data
        if (values.length === 8760) {
          // Store the hourly data
          setHourlyData(values);
        } else if (values.length === 12) {
          // Store the monthly data
          setMonthlyData(values.map(v => v.toString()));
        } else if (values.length === 1) {
          // Store the annual data
          setSystemData(prev => ({ ...prev, annualData: values[0] }));
        } else {
          alert(`Invalid CSV format. Expected 1, 12, or 8760 values, but got ${values.length}.`);
          setUploadedFile(null);
        }
      };
      reader.readAsText(file);
    } else {
      setUploadedFile(null);
      alert('Please upload a valid .csv file.');
    }
  };

  const handleCheckboxChange = (field) => (event) => {
    setSystemData(prev => ({
      ...prev,
      [field]: event.target.checked
    }))
  }

  const handleInputChange = (field) => (event) => {
    setSystemData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleMonthlyDataChange = (index, value) => {
    setMonthlyData(prev => {
      const newData = [...prev];
      newData[index] = value;
      return newData;
    });
  };

  const YesNoQuestion = ({ question, choice, onChoiceChange }) => (
    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography variant="subtitle1" component="h3">
        {question}
      </Typography>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox checked={choice === 'yes'} onChange={() => onChoiceChange('yes')} />}
          label="Yes"
        />
        <FormControlLabel
          control={<Checkbox checked={choice === 'no'} onChange={() => onChoiceChange('no')} />}
          label="No"
        />
      </FormGroup>
    </Box>
  );

  const MonthlyConsumptionInputs = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" component="h3" gutterBottom>
          Enter your monthly power consumption data:
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2 }}>
          {months.map((month, index) => (
            <Box key={month}>
              <Typography variant="subtitle2" component="h4" gutterBottom>{month}</Typography>
              <TextField
                fullWidth
                type="number"
                placeholder={`${month}*`}
                value={monthlyData[index]}
                onChange={(e) => handleMonthlyDataChange(index, e.target.value)}
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">kWh</InputAdornment>,
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="h3" component="h1" gutterBottom>
            System Configuration
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Configure your system parameters and component selection
          </Typography>
        </div>

        {/* System Parameters Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            System Parameters
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Lifetime of System */}
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>
                Lifetime of System
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="Lifetime of System*"
                value={systemData.lifetime}
                onChange={handleInputChange('lifetime')}
                variant="outlined"
                inputProps={{ min: 1, max: 50 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">years</InputAdornment>,
                }}
              />
            </Box>
            
            {/* Max Loss of Power */}
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>
                Max Loss of Power
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="Max Loss of Power*"
                value={systemData.LPSP_max_rate}
                onChange={handleInputChange('LPSP_max_rate')}
                variant="outlined"
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Box>
            
            {/* Min Renewable Energy */}
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>
                Min Renewable Energy
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="Min Renewable Energy*"
                value={systemData.RE_min_rate}
                onChange={handleInputChange('RE_min_rate')}
                variant="outlined"
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Consumption Data Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Consumption Data Source
          </Typography>

          <YesNoQuestion
            question="Do you have hourly consumption data?"
            choice={consumptionPath.hourly}
            onChoiceChange={(choice) => handleConsumptionChoice('hourly', choice)}
          />

          {consumptionPath.hourly === 'yes' && (
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" component="label">
                Upload Hourly CSV File
                <input type="file" hidden accept=".csv" onChange={handleFileChange} />
              </Button>
              {uploadedFile && (
                <Typography sx={{ ml: 2, display: 'inline' }}>
                  {uploadedFile.name}
                </Typography>
              )}
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                CSV must contain one column with 8760 numerical values and no headers.
              </Typography>
            </Box>
          )}

          {consumptionPath.hourly === 'no' && (
            <YesNoQuestion
              question="Do you have monthly power consumption data?"
              choice={consumptionPath.monthly}
              onChoiceChange={(choice) => handleConsumptionChoice('monthly', choice)}
            />
          )}

          {consumptionPath.hourly === 'no' && consumptionPath.monthly === 'yes' && (
            <MonthlyConsumptionInputs />
          )}

          {consumptionPath.hourly === 'no' && consumptionPath.monthly === 'no' && (
            <YesNoQuestion
              question="Do you have annual power consumption data?"
              choice={consumptionPath.annual}
              onChoiceChange={(choice) => handleConsumptionChoice('annual', choice)}
            />
          )}

          {consumptionPath.hourly === 'no' && consumptionPath.monthly === 'no' && consumptionPath.annual !== null && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" component="h3" gutterBottom>
                Enter your annual power consumption:
              </Typography>
              <TextField
                fullWidth
                type="number"
                label="Annual Power Consumption"
                placeholder="Annual Power Consumption*"
                value={systemData.annualData}
                onChange={handleInputChange('annualData')}
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">kWh</InputAdornment>,
                }}
              />
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Component Selection Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Component Selection
          </Typography>
          
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={systemData.PV}
                  onChange={handleCheckboxChange('PV')}
                />
              }
              label="Photovoltaic System (PV)"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={systemData.WT}
                  onChange={handleCheckboxChange('WT')}
                />
              }
              label="Wind Turbine (WT)"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={systemData.DG}
                  onChange={handleCheckboxChange('DG')}
                />
              }
              label="Diesel Generator (DG)"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={systemData.Bat}
                  onChange={handleCheckboxChange('Bat')}
                />
              }
              label="Battery Storage (Bat)"
            />
          </FormGroup>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Save Button */}
        <Box sx={{ mb: 4 }}>
          <SaveMessageAlert message={saveMessage} />
          
          <NextPageButton
            onClick={saveSystemData}
            saving={saving}
            disabled={!isFormValid()}
          />
          
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

export default SystemConfig 