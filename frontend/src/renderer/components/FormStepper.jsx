import { Box, Stepper, Step, StepLabel } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Define all possible steps in order
const ALL_STEPS = [
  { label: 'Geography', path: '/geography' },
  { label: 'Optimization', path: '/optimization' },
  { label: 'System Config', path: '/system-config' },
  { label: 'Inverter', path: '/inverter' },
  { label: 'PV', path: '/pv-config' },
  { label: 'Wind', path: '/wind-config' },
  { label: 'Diesel', path: '/dg-config' },
  { label: 'Battery', path: '/battery-config' },
  { label: 'Grid', path: '/grid-config' },
  { label: 'Results', path: '/results' }
];

// Map paths to step indices for exact matching
const PATH_TO_STEP_INDEX = ALL_STEPS.reduce((acc, step, index) => {
  acc[step.path] = index;
  return acc;
}, {});

export default function FormStepper({ auth }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [maxReachedStep, setMaxReachedStep] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get current step index based on exact path match
  const getCurrentStepIndex = () => {
    const currentPath = location.pathname;
    return PATH_TO_STEP_INDEX[currentPath] ?? -1;
  };

  const currentStepIndex = getCurrentStepIndex();

  // Load the highest step reached from API based on existing data
  useEffect(() => {
    const loadMaxStep = async () => {
      if (!auth?.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const token = await auth.currentUser.getIdToken();
        
        // Get current max step from component-selection endpoint
        const getResponse = await fetch('http://127.0.0.1:5000/api/component-selection', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (getResponse.ok) {
          const data = await getResponse.json();
          setMaxReachedStep(data.maxStep || 0);
        }
      } catch (error) {
        console.error('Error loading max step:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMaxStep();
  }, [auth]);

  if (loading) {
    return <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 4, pt: 4 }} />;
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 4, pt: 4 }}>
      <Stepper
        activeStep={currentStepIndex}
        alternativeLabel
        sx={{ width: '100%', maxWidth: 900 }}
      >
        {ALL_STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isReached = index <= maxReachedStep;
          const isFuture = index > maxReachedStep;
          
          return (
            <Step key={step.label}>
              <StepLabel
                onClick={() => {
                  // Allow navigation to any reached step (completed or current)
                  if (isReached) {
                    navigate(step.path);
                  }
                }}
                style={{
                  cursor: isReached ? 'pointer' : 'default',
                  color: isCompleted ? '#1976d2' : isFuture ? '#9e9e9e' : undefined,
                  fontSize: '0.97rem',
                  opacity: isFuture ? 0.6 : 1,
                }}
              >
                {step.label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
} 