import React from 'react'
import { Alert } from "@mui/material"

function SaveMessageAlert({ message, sx = { mb: 2 } }) {
  if (!message) return null
  
  const severity = message.includes('successfully') ? 'success' : 'error'
  
  return (
    <Alert severity={severity} sx={sx}>
      {message}
    </Alert>
  )
}

export default SaveMessageAlert 