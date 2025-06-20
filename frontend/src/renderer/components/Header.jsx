import React from 'react'
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
        <Typography variant="h6" component="h1" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Solar Alone Multiobjective Advisor
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user ? (
            <>
              <Typography variant="body2" color="textSecondary">
                Welcome, {user.email}
              </Typography>
              <Button 
                variant="contained" 
                color="error" 
                onClick={handleLogout}
                size="small"
              >
                Logout
              </Button>
            </>
          ) : (
            <Typography variant="body2" color="textSecondary">
              Please log in
            </Typography>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header 