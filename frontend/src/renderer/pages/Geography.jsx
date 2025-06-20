import React, { useState } from 'react'
import { signOut } from 'firebase/auth'
import Map from '../components/Map'
import Search from '../components/Search'

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
  const [selectedPosition, setSelectedPosition] = useState(null)

  const handleLogout = () => {
    if (auth) {
      signOut(auth)
    }
  }

  const handlePositionSelect = (position) => {
    setSelectedPosition({
      ...position,
      lat: parseFloat(position.lat),
      lon: parseFloat(position.lon)
    })
    setGeoData(prev => ({
      ...prev,
      latitude: parseFloat(position.lat),
      longitude: parseFloat(position.lon),
      address: position.display_name
    }))
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
    <div className="min-h-screen bg-gray-50 font-roboto">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-roboto">Geography & Economy</h1>
            <p className="text-gray-600 font-roboto">Configure your location and economic parameters</p>
          </div>
          <button 
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 font-roboto"
          >
            Logout
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 font-roboto mb-2">Location Selection</h2>
              <p className="text-sm text-gray-600 font-roboto">Search for an address to see it on the map</p>
            </div>
            <div className="h-96 relative">
              <Map selectPosition={selectedPosition} />
            </div>
            {selectedPosition && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Latitude:</span>
                    <span className="ml-2 text-gray-900">
                      {typeof selectedPosition.lat === 'number' 
                        ? selectedPosition.lat.toFixed(6) 
                        : parseFloat(selectedPosition.lat).toFixed(6)
                      }
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Longitude:</span>
                    <span className="ml-2 text-gray-900">
                      {typeof selectedPosition.lon === 'number' 
                        ? selectedPosition.lon.toFixed(6) 
                        : parseFloat(selectedPosition.lon).toFixed(6)
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Section */}
          <div className="bg-white shadow rounded-lg">
            {/* Address Search Section */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 font-roboto mb-4">Address Search</h2>
              <Search 
                selectPosition={selectedPosition} 
                setSelectPosition={handlePositionSelect}
              />
            </div>

            {/* Economic Parameters Section */}
            <div className="px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900 font-roboto mb-4">Economic Parameters</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-roboto mb-2">
                    Nominal Discount Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={geoData.n_ir_rate}
                    onChange={(e) => setGeoData({...geoData, n_ir_rate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-roboto"
                    placeholder="Enter discount rate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-roboto mb-2">
                    Expected Inflation Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={geoData.e_ir_rate}
                    onChange={(e) => setGeoData({...geoData, e_ir_rate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-roboto"
                    placeholder="Enter inflation rate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-roboto mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={geoData.Tax_rate}
                    onChange={(e) => setGeoData({...geoData, Tax_rate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-roboto"
                    placeholder="Enter tax rate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-roboto mb-2">
                    Renewable Energy Incentives Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={geoData.RE_incentives_rate}
                    onChange={(e) => setGeoData({...geoData, RE_incentives_rate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-roboto"
                    placeholder="Enter incentives rate"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
              <button 
                onClick={saveGeoData}
                disabled={!selectedPosition}
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-roboto"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Data
              </button>
              {!selectedPosition && (
                <p className="mt-2 text-sm text-gray-500 text-center font-roboto">
                  Please search and select a location to save data
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Geography 