import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NextPageButton from '../components/NextPageButton'
import SaveMessageAlert from '../components/SaveMessageAlert'
import { 
  Typography, 
  Box,
  TextField
} from "@mui/material"
import { useFormData } from '../hooks/useFormData'

function Optimization({ auth, user }) {
  const navigate = useNavigate()
  
  // Use the simple data persistence hook
  const {
    data: optimizationSettings,
    updateData
  } = useFormData('optimization', {
    maxIterations: 200,
    populationSize: 50,
    inertiaWeight: 1,
    inertiaWeightDamping: 0.99,
    personalLearningCoeff: 2.0,
    globalLearningCoeff: 2.0
  })
  
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const isFormValid = () => {
    return (
      optimizationSettings.maxIterations !== '' &&
      optimizationSettings.populationSize !== '' &&
      optimizationSettings.inertiaWeight !== '' &&
      optimizationSettings.inertiaWeightDamping !== '' &&
      optimizationSettings.personalLearningCoeff !== '' &&
      optimizationSettings.globalLearningCoeff !== ''
    );
  };

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

  const handleSettingChange = (setting) => (event) => {
    updateData({
      [setting]: event.target.value === '' ? '' : parseFloat(event.target.value)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="h3" component="h1" gutterBottom>
            Optimization Parameters
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Configure your optimization settings for the analysis
          </Typography>
        </div>

        {/* Optimization Settings */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Optimization Parameters
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>
                Maximum Number of Iterations
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="Maximum Number of Iterations*"
                value={optimizationSettings.maxIterations}
                onChange={handleSettingChange('maxIterations')}
                variant="outlined"
                inputProps={{ min: 10, max: 1000 }}
              />
            </Box>
            
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>
                Population Size (Swarm Size)
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="Population Size (Swarm Size)*"
                value={optimizationSettings.populationSize}
                onChange={handleSettingChange('populationSize')}
                variant="outlined"
                inputProps={{ min: 5, max: 100 }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>
                Inertia Weight
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="Inertia Weight*"
                value={optimizationSettings.inertiaWeight}
                onChange={handleSettingChange('inertiaWeight')}
                variant="outlined"
                inputProps={{ min: 0.1, max: 1.0, step: 0.1 }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>
                Inertia Weight Damping Ratio
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="Inertia Weight Damping Ratio*"
                value={optimizationSettings.inertiaWeightDamping}
                onChange={handleSettingChange('inertiaWeightDamping')}
                variant="outlined"
                inputProps={{ min: 0.8, max: 1.0, step: 0.01 }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>
                Personal Learning Coefficient
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="Personal Learning Coefficient*"
                value={optimizationSettings.personalLearningCoeff}
                onChange={handleSettingChange('personalLearningCoeff')}
                variant="outlined"
                inputProps={{ min: 0.5, max: 3.0, step: 0.1 }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>
                Global Learning Coefficient
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="Global Learning Coefficient*"
                value={optimizationSettings.globalLearningCoeff}
                onChange={handleSettingChange('globalLearningCoeff')}
                variant="outlined"
                inputProps={{ min: 0.5, max: 3.0, step: 0.1 }}
              />
            </Box>
          </Box>
        </Box>

        {/* Next Page Button */}
        <Box sx={{ mb: 4 }}>
          <SaveMessageAlert message={saveMessage} />
          <NextPageButton
            onClick={saveOptimizationData}
            saving={saving}
            disabled={!isFormValid()}
            text="Next"
            savingText="Saving..."
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

export default Optimization 