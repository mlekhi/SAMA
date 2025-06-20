import React from 'react'
import { useLocation } from 'react-router-dom'
import { Typography, Box, Divider, Paper } from "@mui/material"

function Results() {
  const location = useLocation()
  const results = location.state?.results || []

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
      </div>
    </div>
  )
}

export default Results 