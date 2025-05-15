import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Landing from '@pages/Landing';
import GeoAndEconomy from '@system/GeoAndEconomy';
import GridInfo from '@system/GridInfo';
import OptimizationParams from '@system/OptimizationParams';
import SystemConfig from '@system/SystemConfig';
import Results from '@pages/Results';
import Battery from '@system/Optional/ComponentInfoBattery';
import WindTurbine from '@system/Optional/ComponentInfoWT';
import Inverter from '@system/Optional/ComponentInfoInverter';
import DieselGenerator from '@system/Optional/ComponentInfoDG';
import PhotovoltaicSystem from '@system/Optional/ComponentInfoPV';
import FAQ from '@pages/FAQ';

function App() {
  return (
    <Router>
      <Box sx={{ minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/geo" element={<GeoAndEconomy />} />
          <Route path="/grid" element={<GridInfo />} />
          <Route path="/optim" element={<OptimizationParams />} />
          <Route path="/system" element={<SystemConfig />} />
          <Route path="/results" element={<Results />} />
          <Route path="/battery" element={<Battery />} />
          <Route path="/inverter" element={<Inverter />} />
          <Route path="/wt" element={<WindTurbine />} />
          <Route path="/pv" element={<PhotovoltaicSystem />} />
          <Route path="/dg" element={<DieselGenerator />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App; 