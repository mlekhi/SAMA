import React from 'react'
import { Button, CircularProgress } from "@mui/material"

function NextPageButton({ 
  onClick, 
  disabled = false, 
  saving = false, 
  text = "Next", 
  savingText = "Saving..." 
}) {
  return (
    <Button
      fullWidth
      variant="contained"
      color="success"
      onClick={onClick}
      disabled={disabled || saving}
      size="large"
    >
      {saving ? (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <CircularProgress size="1rem" color="inherit" style={{ marginRight: 8 }} />
          {savingText}
        </span>
      ) : (
        text
      )}
    </Button>
  )
}

export default NextPageButton 