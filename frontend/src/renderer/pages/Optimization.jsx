import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Box,
  Alert,
  LinearProgress,
  TextField,
  Divider
} from "@mui/material"
import { 
  TrendingUp, 
  SolarPower, 
  AttachMoney, 
  Settings,
  ArrowBack,
  CheckCircle
} from '@mui/icons-material'

function Optimization({ auth, user }) {
  const navigate = useNavigate()
  const [optimizationComplete, setOptimizationComplete] = useState(false)
  const [optimizationProgress, setOptimizationProgress] = useState(0)
  const [optimizationResults, setOptimizationResults] = useState(null)
  const [optimizationSettings, setOptimizationSettings] = useState({
    maxIterations: 100,
    populationSize: 30,
    inertiaWeight: 0.7,
    inertiaWeightDamping: 0.99,
    personalLearningCoeff: 1.5,
    globalLearningCoeff: 2.0
  })

  const runOptimization = () => {
    setOptimizationProgress(0)
    setOptimizationComplete(false)
    
    // Simulate optimization progress
    const interval = setInterval(() => {
      setOptimizationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setOptimizationComplete(true)
          setOptimizationResults({
            optimalPanelCount: 24,
            optimalBatterySize: '10kWh',
            estimatedCost: 45000,
            annualSavings: 8500,
            roi: 18.9,
            carbonOffset: 15.2
          })
          return 100
        }
        return prev + 8
      })
    }, 300)
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
            Solar System Optimization
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Optimize your solar system configuration for maximum efficiency and cost savings
          </Typography>
        </div>

        {/* Optimization Settings */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Optimization Parameters
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Default values are provided for some questions, but please review and adjust as necessary for more accurate results.
          </Typography>
          
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
          
          <Box sx={{ mt: 3 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={runOptimization}
              disabled={optimizationProgress > 0 && optimizationProgress < 100}
              size="large"
              startIcon={<Settings />}
            >
              Run Optimization
            </Button>
          </Box>
        </Box>

        {/* Progress Bar */}
        {optimizationProgress > 0 && optimizationProgress < 100 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Optimizing System Configuration...
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={optimizationProgress} 
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {optimizationProgress}% Complete
            </Typography>
          </Box>
        )}

        {/* Results */}
        {optimizationComplete && optimizationResults && (
          <>
            <Divider sx={{ my: 4 }} />
            
            <Alert severity="success" sx={{ mb: 4 }} icon={<CheckCircle />}>
              Optimization completed successfully! Here are your optimal system specifications.
            </Alert>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 3, bgcolor: 'primary.50', borderRadius: 2 }}>
                <SolarPower color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" color="primary">
                    Optimal Panel Configuration
                  </Typography>
                  <Typography variant="h3" color="primary">
                    {optimizationResults.optimalPanelCount} Panels
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Optimized panel count for maximum energy production at your location.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', p: 3, bgcolor: 'success.50', borderRadius: 2 }}>
                <AttachMoney color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" color="success.main">
                    System Cost
                  </Typography>
                  <Typography variant="h3" color="success.main">
                    ${optimizationResults.estimatedCost.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total estimated cost for the optimized solar system.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', p: 3, bgcolor: 'info.50', borderRadius: 2 }}>
                <TrendingUp color="info" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" color="info.main">
                    Return on Investment
                  </Typography>
                  <Typography variant="h3" color="info.main">
                    {optimizationResults.roi}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Expected annual return on investment from energy savings.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', p: 3, bgcolor: 'secondary.50', borderRadius: 2 }}>
                <Settings color="secondary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" color="secondary.main">
                    Battery Storage
                  </Typography>
                  <Typography variant="h3" color="secondary.main">
                    {optimizationResults.optimalBatterySize}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Recommended battery capacity for optimal energy storage.
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Action Buttons */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Next Steps
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Your optimized system is ready. Choose your next action.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="contained" color="primary" size="large">
                  Generate Quote
                </Button>
                <Button variant="outlined" color="primary" size="large">
                  Download Specifications
                </Button>
                <Button variant="outlined" color="secondary" size="large">
                  Schedule Consultation
                </Button>
              </Box>
            </Box>
          </>
        )}
      </div>
    </div>
  )
}

export default Optimization 