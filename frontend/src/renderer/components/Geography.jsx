import React, { useState } from 'react'
import { signOut } from 'firebase/auth'

function Geography({ auth, user }) {
  const [geoData, setGeoData] = useState({
    latitude: '',
    longitude: '',
    address: '',
    n_ir_rate: 5.5,
    e_ir_rate: 2.0,
    Tax_rate: 0.0,
    RE_incentives_rate: 30.0
  })

  const handleLogout = () => {
    if (auth) {
      signOut(auth)
    }
  }

  const saveGeoData = async () => {
    if (!user) return
    
    try {
      const token = await user.getIdToken()
      const response = await fetch('/api/geography-economy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(geoData)
      })
      
      if (response.ok) {
        alert('Geography data saved!')
      } else {
        alert('Failed to save data')
      }
    } catch (error) {
      alert('Error saving data: ' + error.message)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Geography & Economy</h1>
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>Location</h2>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Latitude:</label>
          <input
            type="number"
            value={geoData.latitude}
            onChange={(e) => setGeoData({...geoData, latitude: e.target.value})}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Longitude:</label>
          <input
            type="number"
            value={geoData.longitude}
            onChange={(e) => setGeoData({...geoData, longitude: e.target.value})}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Address:</label>
          <input
            type="text"
            value={geoData.address}
            onChange={(e) => setGeoData({...geoData, address: e.target.value})}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Economic Parameters</h2>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Nominal Discount Rate (%):</label>
          <input
            type="number"
            value={geoData.n_ir_rate}
            onChange={(e) => setGeoData({...geoData, n_ir_rate: parseFloat(e.target.value)})}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Expected Inflation Rate (%):</label>
          <input
            type="number"
            value={geoData.e_ir_rate}
            onChange={(e) => setGeoData({...geoData, e_ir_rate: parseFloat(e.target.value)})}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Tax Rate (%):</label>
          <input
            type="number"
            value={geoData.Tax_rate}
            onChange={(e) => setGeoData({...geoData, Tax_rate: parseFloat(e.target.value)})}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Renewable Energy Incentives Rate (%):</label>
          <input
            type="number"
            value={geoData.RE_incentives_rate}
            onChange={(e) => setGeoData({...geoData, RE_incentives_rate: parseFloat(e.target.value)})}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
      </div>

      <button 
        onClick={saveGeoData} 
        style={{ 
          width: '100%',
          padding: '12px', 
          backgroundColor: '#28a745', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Save Data
      </button>
    </div>
  )
}

export default Geography 