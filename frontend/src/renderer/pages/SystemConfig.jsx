import React, { useState, useEffect } from 'react'
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
import { useFormData } from '../hooks/useFormData'

function SystemConfig({ auth, user }) {
  const navigate = useNavigate()
  
  // Use the simple data persistence hook for all form data
  const {
    data: formData,
    updateData
  } = useFormData('system-config', {
    // System parameters
    lifetime: 25,
    LPSP_max_rate: 0.0999999,
    RE_min_rate: 75.0,
    annualData: 9,
    PV: false,
    WT: false,
    DG: false,
    Bat: false,
    // Consumption path
    consumptionPath: { hourly: null, monthly: null, annual: null },
    // Monthly data
    monthlyData: Array(12).fill(''),
    // Hourly data
    hourlyData: [],
    // File upload state
    uploadedFileName: null
  })
  
  const [uploadedFile, setUploadedFile] = useState(null);
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Restore uploaded file state when component mounts
  useEffect(() => {
    if (formData.uploadedFileName && !uploadedFile) {
      // Create a mock file object to represent the previously uploaded file
      const mockFile = {
        name: formData.uploadedFileName,
        size: 0, // We don't store the actual file size
        type: 'text/csv'
      };
      setUploadedFile(mockFile);
    }
  }, [formData.uploadedFileName, uploadedFile]);

  const isFormValid = () => {
    const isSystemParamsValid =
      formData.lifetime !== '' &&
      formData.LPSP_max_rate !== '' &&
      formData.RE_min_rate !== '';

    if (!isSystemParamsValid) return false;

    if (formData.consumptionPath.hourly === 'yes') {
      return !!uploadedFile;
    }
    if (formData.consumptionPath.hourly === 'no') {
      if (formData.consumptionPath.monthly === 'yes') {
        return formData.monthlyData.every(val => val !== '' && !isNaN(parseFloat(val)));
      }
      if (formData.consumptionPath.monthly === 'no') {
        if (formData.consumptionPath.annual === 'yes') {
          return formData.annualData !== '' && !isNaN(parseFloat(formData.annualData));
        }
        if (formData.consumptionPath.annual === 'no') {
          return formData.annualData !== '' && !isNaN(parseFloat(formData.annualData));
        }
      }
    }
    return false;
  };

  const saveSystemData = async () => {
    if (!user) return
    
    setSaving(true)
    setSaveMessage('')

    const formDataToSend = new FormData();
    
    // Append system data
    Object.keys(formData).forEach(key => {
      if (key !== 'consumptionPath' && key !== 'monthlyData' && key !== 'hourlyData') {
        formDataToSend.append(key, formData[key]);
      }
    });
    
    // Append consumption data source
    const getConsumptionDataSource = () => {
      if (formData.consumptionPath.hourly === 'yes') return 'hourly';
      if (formData.consumptionPath.monthly === 'yes') return 'monthly';
      if (formData.consumptionPath.annual === 'yes') return 'annual';
      return 'manual';
    };
    formDataToSend.append('consumptionDataSource', getConsumptionDataSource());

    // Append monthly data if manually entered or from CSV
    if (formData.consumptionPath.monthly === 'yes') {
      if (formData.monthlyData.length > 0) {
        // Send as JSON string instead of individual fields
        formDataToSend.append('monthlyData', JSON.stringify(formData.monthlyData.map(v => parseFloat(v))));
      } else {
        // Fallback to individual form fields for backward compatibility
        formData.monthlyData.forEach((value, index) => {
          formDataToSend.append(`month_${index}`, value);
        });
      }
    }

    // Append hourly data if uploaded via CSV
    if (formData.consumptionPath.hourly === 'yes' && formData.hourlyData.length > 0) {
      // Send as JSON string instead of individual fields
      formDataToSend.append('hourlyData', JSON.stringify(formData.hourlyData));
    }
    
    try {
      const token = await user.getIdToken()
      const response = await fetch('http://127.0.0.1:5000/api/system-config', {
        method: 'POST',
        headers: {
          // Content-Type is not set, browser will set it for FormData
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      })
      
      if (response.ok) {
        setSaveMessage('System configuration saved successfully!')
        
        // Navigate to the next page based on component selection
        setTimeout(() => {
          const { PV, WT, DG, Bat } = formData
          
          // If PV, WT, or Battery are selected, show inverter first
          if (PV || WT || Bat) {
            navigate('/inverter')
          } else if (DG) {
            navigate('/dg-config')
          } else {
            navigate('/grid-config')
          }
        }, 1500)
      } else {
        const errorData = await response.json();
        setSaveMessage('Failed to save data: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      setSaveMessage('Error saving data: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleConsumptionChoice = (step, choice) => {
    if (step === 'hourly') {
      updateData({ consumptionPath: { hourly: choice, monthly: null, annual: null } });
    } else if (step === 'monthly') {
      updateData({ 
        consumptionPath: { 
          ...formData.consumptionPath, 
          monthly: choice, 
          annual: null 
        } 
      });
    } else if (step === 'annual') {
      updateData({ 
        consumptionPath: { 
          ...formData.consumptionPath, 
          annual: choice 
        } 
      });
      if (choice === 'yes') {
        updateData({ annualData: '' });
      } else if (choice === 'no') {
        updateData({ annualData: 9 }); // default value
      }
    }
    setUploadedFile(null); // Reset file on any choice change
    updateData({ uploadedFileName: null }); // Clear file name from persistent data
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setUploadedFile(file);
      
      // Save the file name to persistent data
      updateData({ uploadedFileName: file.name });
      
      // Read and convert CSV to JSON array
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target.result;
        const lines = csvText.trim().split('\n');
        const values = lines.map(line => parseFloat(line.trim()));
        
        // Validate the data
        if (values.length === 8760) {
          // Store the hourly data
          updateData({ hourlyData: values });
        } else if (values.length === 12) {
          // Store the monthly data
          updateData({ monthlyData: values.map(v => v.toString()) });
        } else if (values.length === 1) {
          // Store the annual data
          updateData({ annualData: values[0] });
        } else {
          alert(`Invalid CSV format. Expected 1, 12, or 8760 values, but got ${values.length}.`);
          setUploadedFile(null);
          updateData({ uploadedFileName: null });
        }
      };
      reader.readAsText(file);
    } else {
      setUploadedFile(null);
      updateData({ uploadedFileName: null });
      alert('Please upload a valid .csv file.');
    }
  };

  const handleCheckboxChange = (field) => (event) => {
    updateData({
      [field]: event.target.checked
    })
  }

  const handleInputChange = (field) => (event) => {
    updateData({
      [field]: event.target.value
    })
  }

  const handleMonthlyDataChange = (index, value) => {
    const newMonthlyData = [...formData.monthlyData];
    newMonthlyData[index] = value;
    updateData({ monthlyData: newMonthlyData });
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
                value={formData.monthlyData[index]}
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
                value={formData.lifetime}
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
                value={formData.LPSP_max_rate}
                onChange={handleInputChange('LPSP_max_rate')}
                variant="outlined"
                inputProps={{ min: 0, max: 100, step: 0.01 }}
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
                value={formData.RE_min_rate}
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
            choice={formData.consumptionPath.hourly}
            onChoiceChange={(choice) => handleConsumptionChoice('hourly', choice)}
          />

          {formData.consumptionPath.hourly === 'yes' && (
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

          {formData.consumptionPath.hourly === 'no' && (
            <YesNoQuestion
              question="Do you have monthly power consumption data?"
              choice={formData.consumptionPath.monthly}
              onChoiceChange={(choice) => handleConsumptionChoice('monthly', choice)}
            />
          )}

          {formData.consumptionPath.hourly === 'no' && formData.consumptionPath.monthly === 'yes' && (
            <MonthlyConsumptionInputs />
          )}

          {formData.consumptionPath.hourly === 'no' && formData.consumptionPath.monthly === 'no' && (
            <YesNoQuestion
              question="Do you have annual power consumption data?"
              choice={formData.consumptionPath.annual}
              onChoiceChange={(choice) => handleConsumptionChoice('annual', choice)}
            />
          )}

          {formData.consumptionPath.hourly === 'no' && formData.consumptionPath.monthly === 'no' && formData.consumptionPath.annual !== null && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" component="h3" gutterBottom>
                Enter your annual power consumption:
              </Typography>
              <TextField
                fullWidth
                type="number"
                label="Annual Power Consumption"
                placeholder="Annual Power Consumption*"
                value={formData.annualData}
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
                  checked={formData.PV}
                  onChange={handleCheckboxChange('PV')}
                />
              }
              label="Photovoltaic System (PV)"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.WT}
                  onChange={handleCheckboxChange('WT')}
                />
              }
              label="Wind Turbine (WT)"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.DG}
                  onChange={handleCheckboxChange('DG')}
                />
              }
              label="Diesel Generator (DG)"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.Bat}
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