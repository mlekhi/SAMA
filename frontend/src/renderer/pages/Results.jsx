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
  const results = location.state?.results || []
  const [generatedFiles, setGeneratedFiles] = useState(location.state?.generatedFiles || { figures: [] })
  const userId = location.state?.userId || user?.uid
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
            Analysis Logs
          </Typography>
          <Paper elevation={2} sx={{ p: 3, fontFamily: 'monospace', whiteSpace: 'pre-wrap', bgcolor: '#f5f5f5' }}>
            {results.length > 0 ? (
              results.map((log, index) => (
                <Typography key={index} component="p" sx={{ mb: 1 }}>
                  {log}
                </Typography>
              ))
            ) : (
              <Typography variant="body1" color="textSecondary">
                Error: No results to display..
              </Typography>
            )}
          </Paper>
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