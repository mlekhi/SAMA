import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import GeoAndEconomy from './GeoAndEconomy'
import SystemConfig from './SystemConfig'
import Navigation from './components/Navigation'
// import App from './OptimizationParams'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Navigation />
  </React.StrictMode>
)
