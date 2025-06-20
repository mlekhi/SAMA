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
  FormGroup
} from "@mui/material"

function SystemConfig({ auth, user }) {
  const navigate = useNavigate()
  const [systemData, setSystemData] = useState({
    lifetime: 25,
    LPSP_max_rate: 0.0999999,
    RE_min_rate: 75.0,
    annualData: 9,
    PV: true,
    WT: false,
    DG: false,
    Bat: true,
    Lead_acid: true,
    Li_ion: false
  })
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const saveSystemData = async () => {
    if (!user) return
    
    setSaving(true)
    setSaveMessage('')
    
    try {
      const token = await user.getIdToken()
      const response = await fetch('http://127.0.0.1:5000/api/system-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(systemData)
      })
      
      if (response.ok) {
        setSaveMessage('System configuration saved successfully!')
        // Navigate to geography page after successful save
        setTimeout(() => {
          navigate('/geography')
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

  const handleCheckboxChange = (field) => (event) => {
    setSystemData(prev => ({
      ...prev,
      [field]: event.target.checked
    }))
  }

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
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="System Lifetime (years)"
              type="number"
              value={systemData.lifetime}
              onChange={(e) => setSystemData({...systemData, lifetime: e.target.value})}
              variant="outlined"
              inputProps={{ min: 1, max: 50 }}
              helperText="Expected lifetime of the system (1-50 years)"
            />
            
            <TextField
              fullWidth
              label="LPSP Max Rate"
              type="number"
              value={systemData.LPSP_max_rate}
              onChange={(e) => setSystemData({...systemData, LPSP_max_rate: e.target.value})}
              variant="outlined"
              inputProps={{ min: 0, max: 1, step: 0.01 }}
              helperText="Loss of Power Supply Probability maximum rate (0-1)"
            />
            
            <TextField
              fullWidth
              label="RE Min Rate"
              type="number"
              value={systemData.RE_min_rate}
              onChange={(e) => setSystemData({...systemData, RE_min_rate: e.target.value})}
              variant="outlined"
              inputProps={{ min: 0, max: 1, step: 0.01 }}
              helperText="Renewable Energy minimum rate (0-1)"
            />
            
            <TextField
              fullWidth
              label="Annual Data (hours)"
              type="number"
              value={systemData.annualData}
              onChange={(e) => setSystemData({...systemData, annualData: e.target.value})}
              variant="outlined"
              inputProps={{ min: 8760, max: 8760 }}
              helperText="Annual hours (typically 8760 hours)"
            />
          </Box>
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
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={systemData.Lead_acid}
                  onChange={handleCheckboxChange('Lead_acid')}
                />
              }
              label="Lead Acid Battery"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={systemData.Li_ion}
                  onChange={handleCheckboxChange('Li_ion')}
                />
              }
              label="Lithium Ion Battery"
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
          />
        </Box>
      </div>
    </div>
  )
}

export default SystemConfig 