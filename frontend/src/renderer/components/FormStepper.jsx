import { Box, Stepper, Step, StepLabel } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const steps = [
  { label: 'Geography', path: '/geography' },
  { label: 'Optimization', path: '/optimization' },
  { label: 'System Config', path: '/system-config' },
  { label: 'Component Modules', path: '/pv-config' },
  { label: 'Grid', path: '/grid-config' },
  { label: 'Results', path: '/results' }
];

// Map component keys to their routes
const componentRoutes = {
  PV: '/pv-config',
  DG: '/dg-config',
  Bat: '/battery-config',
  Inverter: '/inverter',
};

function getActiveStep(pathname) {
  // All component module routes
  const componentModulePaths = [
    '/pv-config',
    '/dg-config',
    '/battery-config',
    '/inverter'
  ];
  if (componentModulePaths.some(path => pathname.startsWith(path))) {
    return 3; // "Component Modules" step index
  }
  return steps.findIndex(step => pathname.startsWith(step.path));
}

export default function FormStepper({ auth }) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeStep = getActiveStep(location.pathname);
  const [loadingComponent, setLoadingComponent] = useState(false);

  // Handler for Component Modules step
  const handleComponentModulesClick = async () => {
    setLoadingComponent(true);
    try {
      let token = null;
      if (auth && auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }
      const response = await fetch('http://127.0.0.1:5000/api/component-selection', {
        method: 'GET',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        for (const key of Object.keys(componentRoutes)) {
          if (data[key]) {
            navigate(componentRoutes[key]);
            return;
          }
        }
        navigate('/system-config');
      } else {
        navigate('/system-config');
      }
    } catch (e) {
      navigate('/system-config');
    } finally {
      setLoadingComponent(false);
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 4, pt: 4 }}>
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{ width: '100%', maxWidth: 900 }}
      >
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              onClick={async () => {
                if (index < activeStep) {
                  if (step.label === 'Component Modules') {
                    await handleComponentModulesClick();
                  } else {
                    navigate(step.path);
                  }
                }
              }}
              style={{
                cursor: index < activeStep ? 'pointer' : 'default',
                color: index < activeStep ? '#1976d2' : undefined,
                fontSize: '0.97rem',
                opacity: loadingComponent && step.label === 'Component Modules' ? 0.5 : 1,
              }}
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
} 