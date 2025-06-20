import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Map from '../components/Map'
import Search from '../components/Search'
import { Typography, TextField, Button, Grid, Alert, CircularProgress } from "@mui/material"

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

  return (
    <div className="min-h-screen bg-gray-50 font-roboto">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="h3" component="h1" gutterBottom>
            Geography & Economy
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Configure your location and economic parameters
          </Typography>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Form Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <Typography variant="h5" component="h2" gutterBottom>
              Address Search
            </Typography>
            <Search 
              selectPosition={selectedPosition} 
              setSelectPosition={handlePositionSelect}
            />
          </div>

          {/* Map Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <Typography variant="h5" component="h2" gutterBottom>
                Location Map
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Selected location will appear here
              </Typography>
            </div>
            <div className="h-96 relative">
              <Map selectPosition={selectedPosition} />
            </div>
            {selectedPosition && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Latitude: {typeof selectedPosition.lat === 'number' 
                        ? selectedPosition.lat.toFixed(6) 
                        : parseFloat(selectedPosition.lat).toFixed(6)
                      }
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Longitude: {typeof selectedPosition.lon === 'number' 
                        ? selectedPosition.lon.toFixed(6) 
                        : parseFloat(selectedPosition.lon).toFixed(6)
                      }
                    </Typography>
                  </Grid>
                </Grid>
              </div>
            )}
          </div>
        </div>

        {/* Economic Parameters Section */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <Typography variant="h5" component="h2" gutterBottom>
              Economic Parameters
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nominal Discount Rate (%)"
                  type="number"
                  value={geoData.n_ir_rate}
                  onChange={(e) => setGeoData({...geoData, n_ir_rate: e.target.value})}
                  variant="outlined"
                  inputProps={{ step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Expected Inflation Rate (%)"
                  type="number"
                  value={geoData.e_ir_rate}
                  onChange={(e) => setGeoData({...geoData, e_ir_rate: e.target.value})}
                  variant="outlined"
                  inputProps={{ step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tax Rate (%)"
                  type="number"
                  value={geoData.Tax_rate}
                  onChange={(e) => setGeoData({...geoData, Tax_rate: e.target.value})}
                  variant="outlined"
                  inputProps={{ step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Renewable Energy Incentives Rate (%)"
                  type="number"
                  value={geoData.RE_incentives_rate}
                  onChange={(e) => setGeoData({...geoData, RE_incentives_rate: e.target.value})}
                  variant="outlined"
                  inputProps={{ step: 0.1 }}
                />
              </Grid>
            </Grid>
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <Grid container direction="column" spacing={2}>
              {saveMessage && (
                <Grid item>
                  <Alert severity={saveMessage.includes('successfully') ? 'success' : 'error'}>
                    {saveMessage}
                  </Alert>
                </Grid>
              )}
              <Grid item>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={saveGeoData}
                  disabled={!selectedPosition || saving}
                  size="large"
                >
                  {saving ? (
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size="1rem" color="inherit" style={{ marginRight: 8 }} />
                      Saving Data...
                    </span>
                  ) : (
                    'Next Page'
                  )}
                </Button>
              </Grid>
              {!selectedPosition && (
                <Grid item>
                  <Typography variant="body2" color="textSecondary" align="center">
                    Please search and select a location to continue
                  </Typography>
                </Grid>
              )}
            </Grid>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Geography 