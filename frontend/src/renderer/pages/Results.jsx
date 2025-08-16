import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { 
  Typography, 
  Box, 
  Divider, 
  Paper, 
  Button, 
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip
} from "@mui/material"
import { Download, Refresh } from '@mui/icons-material'

function Results({ auth, user }) {
  const location = useLocation()
  const results = location.state?.results || {}
  const [generatedFiles, setGeneratedFiles] = useState(location.state?.generatedFiles || { figures: [] })
  const userId = location.state?.userId || user?.uid
  const status = location.state?.status || 'unknown'
  const message = location.state?.message || 'No message available'
  const [downloading, setDownloading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedFile, setSelectedFile] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)

  const fetchUserFiles = async () => {
    if (!user || !userId) return

    setRefreshing(true)
    try {
      const token = await user.getIdToken()
      const response = await fetch(`http://127.0.0.1:5000/api/files/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedFiles(data.files)
        // Set first file as selected if available
        if (data.files.figures.length > 0 && !selectedFile) {
          setSelectedFile(data.files.figures[0].name)
        }
      } else {
        console.error('Failed to fetch files:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // Fetch files if not available in state
  useEffect(() => {
    if ((!generatedFiles.figures.length) && user && userId) {
      fetchUserFiles()
    }
  }, [user, userId])

  // Load preview when selected file changes
  useEffect(() => {
    if (selectedFile && user) {
      loadPreview()
    }
  }, [selectedFile, user])

  const loadPreview = async () => {
    if (!user || !selectedFile) return

    setPreviewLoading(true)
    setPreviewUrl('')

    try {
      const token = await user.getIdToken()
      const response = await fetch(`http://127.0.0.1:5000/api/download/${userId}/figure/${selectedFile}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        setPreviewUrl(url)
      } else {
        console.error('Failed to load preview:', response.statusText)
      }
    } catch (error) {
      console.error('Error loading preview:', error)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!user || !selectedFile) return

    setDownloading(true)

    try {
      const token = await user.getIdToken()
      const response = await fetch(`http://127.0.0.1:5000/api/download/${userId}/figure/${selectedFile}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = selectedFile
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error('Download failed:', response.statusText)
      }
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      setDownloading(false)
    }
  }

  const getSelectedFileData = () => {
    return generatedFiles.figures.find(file => file.name === selectedFile)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="h3" component="h1" gutterBottom>
            Analysis Results
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Here are the results from your SAMA analysis.
          </Typography>
        </div>

        <Divider sx={{ my: 4 }} />

        {/* Results Content */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Analysis Results
          </Typography>
          
          {/* Status Message */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: status === 'success' ? '#e8f5e8' : status === 'warning' ? '#fff3e0' : '#ffebee' }}>
            <Typography variant="h6" color={status === 'success' ? 'success.main' : status === 'warning' ? 'warning.main' : 'error.main'}>
              Status: {status.toUpperCase()}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {message}
            </Typography>
          </Paper>

          {/* System Size */}
          {results.system_size && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" component="h3" gutterBottom>
                System Configuration
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">PV Capacity</Typography>
                  <Typography variant="h6">{results.system_size.pv_capacity_kw} kW</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Wind Capacity</Typography>
                  <Typography variant="h6">{results.system_size.wind_capacity_kw} kW</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Battery Capacity</Typography>
                  <Typography variant="h6">{results.system_size.battery_capacity_kwh} kWh</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Diesel Capacity</Typography>
                  <Typography variant="h6">{results.system_size.diesel_capacity_kw} kW</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Inverter Capacity</Typography>
                  <Typography variant="h6">{results.system_size.inverter_capacity_kw} kW</Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Financial Metrics */}
          {results.financial_metrics && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" component="h3" gutterBottom>
                Financial Analysis
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Net Present Cost</Typography>
                  <Typography variant="h6" color="primary.main">${results.financial_metrics.npc?.toLocaleString() || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Levelized Cost of Energy</Typography>
                  <Typography variant="h6" color="primary.main">${results.financial_metrics.lcoe || 'N/A'}/kWh</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Initial Cost</Typography>
                  <Typography variant="h6" color="primary.main">${results.financial_metrics.initial_cost?.toLocaleString() || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Operating Cost</Typography>
                  <Typography variant="h6" color="primary.main">${results.financial_metrics.operating_cost?.toLocaleString() || 'N/A'}</Typography>
                </Box>
                {results.financial_metrics.irr && (
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Internal Rate of Return</Typography>
                    <Typography variant="h6" color={results.financial_metrics.irr > 0 ? 'success.main' : 'error.main'}>
                      {(results.financial_metrics.irr * 100).toFixed(2)}%
                    </Typography>
                  </Box>
                )}
                {results.financial_metrics.roi_percent && (
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Return on Investment</Typography>
                    <Typography variant="h6" color={results.financial_metrics.roi_percent > 0 ? 'success.main' : 'error.main'}>
                      {results.financial_metrics.roi_percent.toFixed(2)}%
                    </Typography>
                  </Box>
                )}
                {results.financial_metrics.payback_period_years && (
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Payback Period</Typography>
                    <Typography variant="h6" color="primary.main">{results.financial_metrics.payback_period_years} years</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          )}

          {/* Energy Metrics */}
          {results.energy_metrics && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" component="h3" gutterBottom>
                Energy Analysis
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">PV Energy</Typography>
                  <Typography variant="h6">{results.energy_metrics.pv_energy_kwh?.toLocaleString() || 'N/A'} kWh</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Wind Energy</Typography>
                  <Typography variant="h6">{results.energy_metrics.wind_energy_kwh?.toLocaleString() || 'N/A'} kWh</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Diesel Energy</Typography>
                  <Typography variant="h6">{results.energy_metrics.diesel_energy_kwh?.toLocaleString() || 'N/A'} kWh</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Annual Load</Typography>
                  <Typography variant="h6">{results.energy_metrics.annual_load_kwh?.toLocaleString() || 'N/A'} kWh</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Renewable Energy %</Typography>
                  <Typography variant="h6" color="success.main">{results.energy_metrics.renewable_energy_percentage || 'N/A'}%</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Excess Electricity</Typography>
                  <Typography variant="h6">{results.energy_metrics.excess_electricity_kwh?.toLocaleString() || 'N/A'} kWh</Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Reliability Metrics */}
          {results.reliability_metrics && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" component="h3" gutterBottom>
                Reliability Analysis
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Loss of Power Supply Probability</Typography>
                  <Typography variant="h6" color={results.reliability_metrics.loss_of_power_supply_probability > 10 ? 'error.main' : 'warning.main'}>
                    {results.reliability_metrics.loss_of_power_supply_probability}%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Renewable Energy Fraction</Typography>
                  <Typography variant="h6" color="success.main">{results.reliability_metrics.renewable_energy_fraction}%</Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Emissions */}
          {results.emissions && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" component="h3" gutterBottom>
                Environmental Impact
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">DG Emissions</Typography>
                  <Typography variant="h6">{results.emissions.dg_emissions_kg_per_year?.toFixed(2) || 'N/A'} kg/year</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Grid Emissions</Typography>
                  <Typography variant="h6">{results.emissions.grid_emissions_kg_per_year?.toFixed(2) || 'N/A'} kg/year</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Levelized Emissions</Typography>
                  <Typography variant="h6">{results.emissions.levelized_emissions_kg_per_kwh?.toFixed(4) || 'N/A'} kg/kWh</Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Grid Metrics */}
          {results.grid_metrics && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" component="h3" gutterBottom>
                Grid Interconnection
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Power Bought</Typography>
                  <Typography variant="h6">{results.grid_metrics.annual_power_bought_kwh?.toLocaleString() || 'N/A'} kWh</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Power Sold</Typography>
                  <Typography variant="h6">{results.grid_metrics.annual_power_sold_kwh?.toLocaleString() || 'N/A'} kWh</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Total Grid Costs</Typography>
                  <Typography variant="h6" color="error.main">${results.grid_metrics.total_money_paid_to_grid?.toLocaleString() || 'N/A'}</Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* No Results Message */}
          {Object.keys(results).length === 0 && (
            <Paper elevation={2} sx={{ p: 3, bgcolor: '#ffebee' }}>
              <Typography variant="body1" color="error.main">
                No analysis results available. Please run the optimization first.
              </Typography>
            </Paper>
          )}
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Generated Files Section */}
        {(generatedFiles.figures.length > 0) && (
          <>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h2">
                  Generated Files
                </Typography>
                <Button
                  startIcon={<Refresh />}
                  onClick={fetchUserFiles}
                  disabled={refreshing}
                  variant="outlined"
                  size="small"
                >
                  {refreshing ? 'Refreshing...' : 'Refresh Files'}
                </Button>
              </Box>
              
              {/* File Selection Dropdown */}
              <Box sx={{ mb: 4 }}>
                <FormControl fullWidth>
                  <InputLabel id="file-select-label">Select a file to view</InputLabel>
                  <Select
                    labelId="file-select-label"
                    value={selectedFile}
                    label="Select a file to view"
                    onChange={(e) => setSelectedFile(e.target.value)}
                  >
                    {generatedFiles.figures.map((file, index) => (
                      <MenuItem key={index} value={file.name}>
                        {file.display_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* File Preview and Download */}
              {selectedFile && (
                <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {getSelectedFileData()?.display_name}
                  </Typography>
                  
                  {/* Visual Preview */}
                  <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {previewLoading ? (
                      <Typography variant="body2" color="textSecondary">
                        Loading preview...
                      </Typography>
                    ) : previewUrl ? (
                      <img 
                        src={previewUrl}
                        alt={getSelectedFileData()?.display_name}
                        style={{ 
                          width: '100%', 
                          height: 'auto',
                          maxHeight: '600px',
                          objectFit: 'contain',
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }}
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Preview not available
                      </Typography>
                    )}
                  </Box>

                  {/* Download Button */}
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={handleDownload}
                    disabled={downloading}
                    size="large"
                  >
                    {downloading ? 'Downloading...' : 'Download File'}
                  </Button>
                </Paper>
              )}
            </Box>

            <Divider sx={{ my: 4 }} />
          </>
        )}

        {/* No Files Available Message */}
        {generatedFiles.figures.length === 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Generated Files
            </Typography>
            <Paper elevation={1} sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f9fa' }}>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                No generated files found.
              </Typography>
              <Button
                startIcon={<Refresh />}
                onClick={fetchUserFiles}
                disabled={refreshing}
                variant="outlined"
              >
                {refreshing ? 'Refreshing...' : 'Check for Files'}
              </Button>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                Files will appear here after running an analysis from the Grid Configuration page.
              </Typography>
            </Paper>
          </Box>
        )}
      </div>
    </div>
  )
}

export default Results 