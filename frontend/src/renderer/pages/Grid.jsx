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

  const saveGridData = async () => {
    if (!user) return
    
    setSaving(true)
    setSaveMessage('')
    
    try {
      const token = await user.getIdToken()
      const response = await fetch('http://127.0.0.1:5000/api/grid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(gridData)
      })
      
      if (response.ok) {
        setSaveMessage('Grid configuration saved successfully!')
        // Navigate to analysis page after successful save
        setTimeout(() => {
          navigate('/analysis') // Or another page as needed
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
    setGridData(prev => ({
      ...prev,
      [field]: event.target.checked
    }))
  }

  const handleInputChange = (field) => (event) => {
    setGridData(prev => ({
      ...prev,
      [field]: parseFloat(event.target.value)
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
              <Typography variant="subtitle1" component="h3" gutterBottom>Annual Expenses ($)</Typography>
              <TextField fullWidth type="number" value={gridData.Annual_expenses} onChange={handleInputChange('Annual_expenses')} variant="outlined" />
            </Box>
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>Grid Sale Tax Rate (%)</Typography>
              <TextField fullWidth type="number" value={gridData.Grid_sale_tax_rate} onChange={handleInputChange('Grid_sale_tax_rate')} variant="outlined" />
            </Box>
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>Grid Tax Amount (kWh)</Typography>
              <TextField fullWidth type="number" value={gridData.Grid_Tax_amount} onChange={handleInputChange('Grid_Tax_amount')} variant="outlined" />
            </Box>
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>Grid Escalation Rate (%)</Typography>
              <TextField fullWidth type="number" value={gridData.Grid_escalation_rate} onChange={handleInputChange('Grid_escalation_rate')} variant="outlined" />
            </Box>
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>Grid Credit ($)</Typography>
              <TextField fullWidth type="number" value={gridData.Grid_credit} onChange={handleInputChange('Grid_credit')} variant="outlined" />
            </Box>
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>Net Metering Fee ($)</Typography>
              <TextField fullWidth type="number" value={gridData.NEM_fee} onChange={handleInputChange('NEM_fee')} variant="outlined" />
            </Box>
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>Grid Monthly Fixed Charge ($/kWh)</Typography>
              <TextField fullWidth type="number" value={gridData.SC_flat} onChange={handleInputChange('SC_flat')} variant="outlined" />
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
              <Typography variant="subtitle1" component="h3" gutterBottom>Purchase Capacity (kW)</Typography>
              <TextField fullWidth type="number" value={gridData.Pbuy_max} onChange={handleInputChange('Pbuy_max')} variant="outlined" />
            </Box>
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>Sell Capacity (kW)</Typography>
              <TextField fullWidth type="number" value={gridData.Psell_max} onChange={handleInputChange('Psell_max')} variant="outlined" />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Save Button */}
        <Box sx={{ mb: 4 }}>
          <SaveMessageAlert message={saveMessage} />
          
          <NextPageButton
            onClick={saveGridData}
            saving={saving}
          />
        </Box>
      </div>
    </div>
  )
}

export default Grid 