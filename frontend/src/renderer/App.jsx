import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import Login from './pages/Login'
import Geography from './pages/Geography'
import Optimization from './pages/Optimization'
import SystemConfig from './pages/SystemConfig'
import FAQ from './pages/FAQ'
import Grid from './pages/Grid'
import Results from './pages/Results'
import Header from './components/Header'
import Battery from './pages/optional/Battery'
import PV from './pages/optional/PV'
import Diesel from './pages/optional/Diesel'
import Inverter from './pages/optional/Inverter'
import FormStepper from './components/FormStepper'

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Persistent Header */}
        <Header auth={auth} user={user} />
        {user && <FormStepper auth={auth} />}
        {/* Main Content */}
        <main className="pt-0">
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
              path="/optimization" 
              element={
                user ? <Optimization auth={auth} user={user} /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/system-config" 
              element={
                user ? <SystemConfig auth={auth} user={user} /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/faq" 
              element={
                user ? <FAQ /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/grid-config" 
              element={
                user ? <Grid auth={auth} user={user} /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/results" 
              element={
                user ? <Results auth={auth} user={user} /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/battery-config" 
              element={
                user ? <Battery auth={auth} user={user} /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/pv-config" 
              element={
                user ? <PV auth={auth} user={user} /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/dg-config" 
              element={
                user ? <Diesel auth={auth} user={user} /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/inverter" 
              element={
                user ? <Inverter auth={auth} user={user} /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/" 
              element={<Navigate to={user ? "/geography" : "/login"} replace />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App 