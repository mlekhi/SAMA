import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { 
  Typography, 
  Box, 
  Divider, 
  Paper, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Chip,
  IconButton,
  Tooltip
} from "@mui/material"
import { Download, Image, Refresh } from '@mui/icons-material'

function Results({ auth, user }) {
  const location = useLocation()
  const results = location.state?.results || []
  const [generatedFiles, setGeneratedFiles] = useState(location.state?.generatedFiles || { figures: [] })
  const userId = location.state?.userId || user?.uid
  const [downloading, setDownloading] = useState({})
  const [refreshing, setRefreshing] = useState(false)


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

  const handleDownload = async (fileType, filename, displayName) => {
    if (!user) return

    setDownloading(prev => ({ ...prev, [filename]: true }))

    try {
      const token = await user.getIdToken()
      const response = await fetch(`http://127.0.0.1:5000/api/download/${userId}/${fileType}/${filename}`, {
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
        a.download = filename
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
      setDownloading(prev => ({ ...prev, [filename]: false }))
    }
  }

  const FileCard = ({ file }) => (
    <Card sx={{ height: 220, maxWidth: 320, display: 'flex', flexDirection: 'column', width: '100%' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Image color="primary" sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component="h3"
            noWrap
            sx={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              width: '100%',
            }}
          >
            {file.display_name}
          </Typography>
        </Box>
        <Chip 
          label="PNG Image" 
          size="small" 
          color="primary"
          variant="outlined"
        />
      </CardContent>
      <CardActions>
        <Button
          size="small"
          startIcon={<Download />}
          onClick={() => handleDownload('figure', file.name, file.display_name)}
          disabled={downloading[file.name]}
          fullWidth
        >
          {downloading[file.name] ? 'Downloading...' : 'Download'}
        </Button>
      </CardActions>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                Download the generated figures and data files from your analysis.
              </Typography>

              {/* Figures */}
              {generatedFiles.figures.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Grid container spacing={3} alignItems="stretch" justifyContent="flex-start">
                    {generatedFiles.figures.map((file, index) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={index} sx={{ minWidth: 280, maxWidth: 340 }}>
                        <FileCard file={file} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
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
                No results to display. Please run an analysis.
              </Typography>
            )}
          </Paper>
        </Box>
      </div>
    </div>
  )
}

export default Results 