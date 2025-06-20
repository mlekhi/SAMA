import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import Login from './pages/Login'
import Geography from './pages/Geography'

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
    <div className="min-h-screen bg-gray-50">
      {/* Persistent Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 font-roboto">
                Solar Alone Multiobjective Advisor
              </h1>
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 font-roboto">
                  Welcome, {user.email}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-0">
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
      </main>
    </div>
  )
}

export default App 