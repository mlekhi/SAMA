import { Box, Stepper, Step, StepLabel } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const baseSteps = [
  { label: 'Geography', path: '/geography' },
  { label: 'Optimization', path: '/optimization' },
  { label: 'System Config', path: '/system-config' },
  // Component steps will be inserted here
  { label: 'Grid', path: '/grid-config' },
  { label: 'Results', path: '/results' }
];

const componentStepDefs = [
  { key: 'Inverter', label: 'Inverter', path: '/inverter' },

  { key: 'PV', label: 'PV', path: '/pv-config' },
  { key: 'WT', label: 'Wind', path: '/wind-config' },
  { key: 'Bat', label: 'Battery', path: '/battery-config' },
  { key: 'DG', label: 'Diesel', path: '/dg-config' },
];

function getActiveStep(pathname, steps) {
  return steps.findIndex(step => pathname.startsWith(step.path));
}

export default function FormStepper({ auth }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [steps, setSteps] = useState(baseSteps);
  const [loadingComponent, setLoadingComponent] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function fetchComponentSelection() {
      setFetching(true);
      let token = null;
      if (auth && auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }
      try {
        const response = await fetch('http://127.0.0.1:5000/api/component-selection', {
          method: 'GET',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (response.ok) {
          const data = await response.json();
          const selectedComponents = componentStepDefs.filter(def => data[def.key]);
          let newSteps = [
            ...baseSteps.slice(0, 3),
            ...selectedComponents,
            ...baseSteps.slice(3)
          ];
          // Ensure the current route is in the steps array
          const currentPath = location.pathname;
          if (!newSteps.some(step => currentPath.startsWith(step.path))) {
            // Try to find a matching component step definition
            const match = componentStepDefs.find(def => currentPath.startsWith(def.path));
            if (match) {
              // Insert at the correct position (after System Config, before Grid)
              newSteps = [
                ...baseSteps.slice(0, 3),
                ...selectedComponents,
                match,
                ...baseSteps.slice(3)
              ];
            } else {
              // Fallback: insert as a generic step before Grid
              newSteps = [
                ...baseSteps.slice(0, 3),
                { label: currentPath.replace('/', ''), path: currentPath },
                ...baseSteps.slice(3)
              ];
            }
          }
          setSteps(newSteps);
        } else {
          setSteps(baseSteps);
        }
      } catch (e) {
        setSteps(baseSteps);
      } finally {
        setFetching(false);
      }
    }
    fetchComponentSelection();
    // eslint-disable-next-line
  }, [location.pathname]);

  const activeStep = getActiveStep(location.pathname, steps);

  if (fetching) {
    return <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 4, pt: 4 }} />;
  }

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
                  navigate(step.path);
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