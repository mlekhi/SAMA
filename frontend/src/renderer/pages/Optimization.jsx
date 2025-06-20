import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NextPageButton from '../components/NextPageButton'
import SaveMessageAlert from '../components/SaveMessageAlert'
import { 
  Typography, 
  Button, 
  Box,
  TextField
} from "@mui/material"
import { 
  ArrowBack
} from '@mui/icons-material'

function Optimization({ auth, user }) {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [optimizationSettings, setOptimizationSettings] = useState({
    maxIterations: 100,
    populationSize: 30,
    inertiaWeight: 0.7,
    inertiaWeightDamping: 0.99,
    personalLearningCoeff: 1.5,
    globalLearningCoeff: 2.0
  })

  const saveOptimizationData = async () => {
    if (!user) return
    
    setSaving(true)
    setSaveMessage('')
    
    try {
      const token = await user.getIdToken()
      const response = await fetch('http://127.0.0.1:5000/api/optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(optimizationSettings)
      })
      
      if (response.ok) {
        setSaveMessage('Optimization data saved successfully!')
        // Navigate to geography page after successful save
        setTimeout(() => {
          navigate('/system-config')
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

  const goBack = () => {
    navigate('/geography')
  }

  const handleSettingChange = (setting) => (event) => {
    setOptimizationSettings(prev => ({
      ...prev,
      [setting]: event.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            startIcon={<ArrowBack />}
            onClick={goBack}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            Back to Geography
          </Button>
          <Typography variant="h3" component="h1" gutterBottom>
            Optimization Parameters
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Configure your optimization settings for the analysis
          </Typography>
        </div>

        {/* Optimization Settings */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Maximum Number of Iterations *"
              type="number"
              value={optimizationSettings.maxIterations}
              onChange={handleSettingChange('maxIterations')}
              variant="outlined"
              inputProps={{ min: 10, max: 1000 }}
              helperText="Number of optimization iterations (10-1000)"
            />
            
            <TextField
              fullWidth
              label="Population Size (Swarm Size) *"
              type="number"
              value={optimizationSettings.populationSize}
              onChange={handleSettingChange('populationSize')}
              variant="outlined"
              inputProps={{ min: 5, max: 100 }}
              helperText="Number of particles in swarm (5-100)"
            />

            <TextField
              fullWidth
              label="Inertia Weight *"
              type="number"
              value={optimizationSettings.inertiaWeight}
              onChange={handleSettingChange('inertiaWeight')}
              variant="outlined"
              inputProps={{ min: 0.1, max: 1.0, step: 0.1 }}
              helperText="Inertia weight (0.1-1.0)"
            />

            <TextField
              fullWidth
              label="Inertia Weight Damping Ratio *"
              type="number"
              value={optimizationSettings.inertiaWeightDamping}
              onChange={handleSettingChange('inertiaWeightDamping')}
              variant="outlined"
              inputProps={{ min: 0.8, max: 1.0, step: 0.01 }}
              helperText="Damping ratio (0.8-1.0)"
            />

            <TextField
              fullWidth
              label="Personal Learning Coefficient *"
              type="number"
              value={optimizationSettings.personalLearningCoeff}
              onChange={handleSettingChange('personalLearningCoeff')}
              variant="outlined"
              inputProps={{ min: 0.5, max: 3.0, step: 0.1 }}
              helperText="Personal learning coefficient (0.5-3.0)"
            />

            <TextField
              fullWidth
              label="Global Learning Coefficient *"
              type="number"
              value={optimizationSettings.globalLearningCoeff}
              onChange={handleSettingChange('globalLearningCoeff')}
              variant="outlined"
              inputProps={{ min: 0.5, max: 3.0, step: 0.1 }}
              helperText="Global learning coefficient (0.5-3.0)"
            />
          </Box>
        </Box>

        {/* Next Page Button */}
        <Box sx={{ mb: 4 }}>
          <SaveMessageAlert message={saveMessage} />
          
          <NextPageButton
            onClick={saveOptimizationData}
            saving={saving}
          />
        </Box>
      </div>
    </div>
  )
}

export default Optimization 