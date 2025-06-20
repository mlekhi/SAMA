import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, CircularProgress } from "@mui/material"

function NextPageButton({ 
  onClick, 
  navigateTo, 
  disabled = false, 
  saving = false, 
  children = "Next Page" 
}) {
  const navigate = useNavigate()
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (navigateTo) {
      navigate(navigateTo)
    }
  }
  
  return (
    <Button
      fullWidth
      variant="contained"
      color="success"
      onClick={handleClick}
      disabled={disabled || saving}
      size="large"
    >
      {saving ? (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <CircularProgress size="1rem" color="inherit" style={{ marginRight: 8 }} />
          Saving Data...
        </span>
      ) : (
        children
      )}
    </Button>
  )
}

export default NextPageButton 