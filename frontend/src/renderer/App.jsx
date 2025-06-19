import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import Login from './components/Login'
import Geography from './components/Geography'

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase only if config is provided
let app, auth
try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
} catch (error) {
  console.warn('Firebase not configured:', error.message)
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const handleLoginSuccess = () => {
    // This will trigger the auth state change and redirect to geography
  }

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
  }

  if (!auth) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>SAMA - Geography & Economy</h1>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3>Firebase Configuration Required</h3>
          <p>Please add your Firebase configuration to the <code>firebaseConfig</code> object in <code>App.jsx</code>.</p>
          <p>You can get this from your Firebase Console → Project Settings → General → Your Apps.</p>
        </div>
        
        <Geography auth={null} user={null} />
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/geography" replace /> : <Login auth={auth} onLoginSuccess={handleLoginSuccess} />
          } 
        />
        <Route 
          path="/geography" 
          element={
            user ? <Geography auth={auth} user={user} /> : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/" 
          element={<Navigate to={user ? "/geography" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  )
}

export default App 