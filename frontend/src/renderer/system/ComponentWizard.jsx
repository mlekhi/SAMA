import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ComponentInfoPV from './Optional/ComponentInfoPV.jsx';
import ComponentInfoWT from './Optional/ComponentInfoWT.jsx';
import ComponentInfoDG from './Optional/ComponentInfoDG.jsx';
import ComponentInfoBattery from './Optional/ComponentInfoBattery.jsx';
import ComponentInfoInverter from './Optional/ComponentInfoInverter.jsx';

const COMPONENTS_MAP = {
  PV: ComponentInfoPV,
  WT: ComponentInfoWT,
  DG: ComponentInfoDG,
  Battery: ComponentInfoBattery,
  Inverter: ComponentInfoInverter,
};

// Define the order of components
const COMPONENT_ORDER = ['PV', 'WT', 'Battery', 'Inverter', 'DG'];

function ComponentWizard() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Get selected systems from localStorage
    const selectedSystems = JSON.parse(localStorage.getItem('selectedSystems')) || {};
    console.log('Selected systems from localStorage:', selectedSystems);
    
    // Filter and order the selected components
    const selectedKeys = COMPONENT_ORDER.filter(key => selectedSystems[key]);
    console.log('Filtered and ordered components:', selectedKeys);
    
    setSelected(selectedKeys);
  }, []);

  const handleNext = () => {
    console.log('Current step:', currentStep);
    console.log('Selected components:', selected);
    
    if (currentStep < selected.length - 1) {
      // Move to next component
      setCurrentStep(prev => prev + 1);
    } else {
      // All components completed, move to grid
      console.log('All components completed, navigating to grid');
      navigate('/grid');
    }
  };

  // If no components are selected, skip to grid
  if (selected.length === 0) {
    console.log('No components selected, skipping to grid');
    navigate('/grid');
    return null;
  }

  const CurrentComponent = COMPONENTS_MAP[selected[currentStep]];
  console.log('Rendering component:', selected[currentStep]);

  return <CurrentComponent onNext={handleNext} />;
}

export default ComponentWizard; 