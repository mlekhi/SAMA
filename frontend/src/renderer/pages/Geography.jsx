import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Map from '../components/Map'
import Search from '../components/Search'
import NextPageButton from '../components/NextPageButton'
import SaveMessageAlert from '../components/SaveMessageAlert'
import { Typography, TextField, Box, Divider, InputAdornment } from "@mui/material"

function Geography({ auth, user }) {
  const navigate = useNavigate()
  const [geoData, setGeoData] = useState({
    latitude: '',
    longitude: '',
    address: '',
    n_ir_rate: 5.5,
    e_ir_rate: 2.0,
    Tax_rate: 0.0,
    RE_incentives_rate: 30.0
  })
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const handlePositionSelect = (position) => {
    setSelectedPosition({
      ...position,
      lat: parseFloat(position.lat),
      lon: parseFloat(position.lon)
    })
    setGeoData(prev => ({
      ...prev,
      latitude: parseFloat(position.lat),
      longitude: parseFloat(position.lon),
      address: position.display_name
    }))
  }

  const saveGeoData = async () => {
    if (!user) return
    
    setSaving(true)
    setSaveMessage('')
    
    try {
      const token = await user.getIdToken()
      const response = await fetch('http://127.0.0.1:5000/api/geography-economy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(geoData)
      })
      
      if (response.ok) {
        setSaveMessage('Geography data saved successfully!')
        // Navigate to optimization page after successful save
        setTimeout(() => {
          navigate('/optimization')
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

  const isFormValid = () => {
    return (
      selectedPosition &&
      geoData.n_ir_rate !== '' &&
      geoData.e_ir_rate !== '' &&
      geoData.Tax_rate !== '' &&
      geoData.RE_incentives_rate !== ''
    );
  };

  const handleEconomicDataChange = (field, value) => {
    setGeoData(prev => ({
      ...prev,
      [field]: value === '' ? '' : parseFloat(value)
    }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="h3" component="h1" gutterBottom>
            Geography & Economy
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Configure your location and economic parameters
          </Typography>
        </div>
        
        {/* Address Search Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Address Search
          </Typography>
          <Search 
            selectPosition={selectedPosition} 
            setSelectPosition={handlePositionSelect}
          />
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Map Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Location Map
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Selected location will appear here
          </Typography>
          <div className="h-96 relative">
            <Map selectPosition={selectedPosition} />
          </div>
          {selectedPosition && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Latitude: {typeof selectedPosition.lat === 'number' 
                  ? selectedPosition.lat.toFixed(6) 
                  : parseFloat(selectedPosition.lat).toFixed(6)
                } | Longitude: {typeof selectedPosition.lon === 'number' 
                  ? selectedPosition.lon.toFixed(6) 
                  : parseFloat(selectedPosition.lon).toFixed(6)
                }
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Economic Parameters Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Economic Parameters
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>
                Nominal Discount Rate
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="Nominal Discount Rate*"
                value={geoData.n_ir_rate}
                onChange={(e) => handleEconomicDataChange('n_ir_rate', e.target.value)}
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                inputProps={{ step: 0.1 }}
              />
            </Box>
            
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>
                Expected Inflation Rate
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="Expected Inflation Rate*"
                value={geoData.e_ir_rate}
                onChange={(e) => handleEconomicDataChange('e_ir_rate', e.target.value)}
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                inputProps={{ step: 0.1 }}
              />
            </Box>
            
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>
                Tax Rate
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="Tax Rate*"
                value={geoData.Tax_rate}
                onChange={(e) => handleEconomicDataChange('Tax_rate', e.target.value)}
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                inputProps={{ step: 0.1 }}
              />
            </Box>
            
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>
                Renewable Energy Incentives Rate
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="Renewable Energy Incentives Rate*"
                value={geoData.RE_incentives_rate}
                onChange={(e) => handleEconomicDataChange('RE_incentives_rate', e.target.value)}
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                inputProps={{ step: 0.1 }}
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Save Button */}
        <Box sx={{ mb: 4 }}>
          <SaveMessageAlert message={saveMessage} />
          
          <NextPageButton
            onClick={saveGeoData}
            disabled={!isFormValid()}
            saving={saving}
          />
          
          {!isFormValid() && (
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
              Please select a location and fill in all fields to continue
            </Typography>
          )}
        </Box>
      </div>
    </div>
  )
}

export default Geography 