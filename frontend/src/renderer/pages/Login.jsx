import React, { useState } from 'react'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { Typography, TextField, Button, Grid, Alert, CircularProgress } from "@mui/material"

function Login({ auth, onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!auth) {
      setError('Firebase not configured. Please add your Firebase config.')
      return
    }

    if (isSignup && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (isSignup && password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      onLoginSuccess()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignup(!isSignup)
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Grid container direction="column" spacing={3}>
          <Grid item>
            <Typography variant="h4" component="h1" align="center" gutterBottom>
              {isSignup ? 'Create Account' : 'Login to SAMA'}
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center">
              Solar Analysis & Management Application
            </Typography>
          </Grid>
          
          <Grid item>
            <form onSubmit={handleSubmit}>
              <Grid container direction="column" spacing={2}>
                {error && (
                  <Grid item>
                    <Alert severity="error">{error}</Alert>
                  </Grid>
                )}
                
                <Grid item>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    variant="outlined"
                    autoComplete="email"
                  />
                </Grid>
                
                <Grid item>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    variant="outlined"
                    autoComplete={isSignup ? "new-password" : "current-password"}
                  />
                </Grid>
                
                {isSignup && (
                  <Grid item>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      variant="outlined"
                      autoComplete="new-password"
                    />
                  </Grid>
                )}
                
                <Grid item>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading}
                    size="large"
                  >
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size="1rem" color="inherit" style={{ marginRight: 8 }} />
                        {isSignup ? 'Creating account...' : 'Logging in...'}
                      </span>
                    ) : (
                      isSignup ? 'Create Account' : 'Sign in'
                    )}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Grid>

          <Grid item>
            <Button
              variant="text"
              color="primary"
              onClick={toggleMode}
              fullWidth
            >
              {isSignup 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </Button>
          </Grid>
        </Grid>
      </div>
    </div>
  )
}

export default Login 