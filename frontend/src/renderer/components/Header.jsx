import React from 'react'
import { Link } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'

function Header({ auth, user }) {
  const handleLogout = () => {
    if (auth) {
      signOut(auth)
    }
  }

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold' }}>
            Solar Alone Multiobjective Advisor
          </Typography>
          <Link to="/faq">
            <Typography sx={{ textDecoration: 'underline', color: 'text.secondary', fontSize: '0.875rem' }}>
              FAQ & About
            </Typography>
          </Link>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {user && (
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleLogout}
              size="small"
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header 