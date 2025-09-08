import { Box, Stepper, Step, StepLabel } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

// Define all possible steps in order
const ALL_STEPS = [
  { label: 'Geography', path: '/geography' },
  { label: 'Optimization', path: '/optimization' },
  { label: 'System Config', path: '/system-config' },
  { label: 'Inverter', path: '/inverter' },
  { label: 'PV', path: '/pv-config' },
  { label: 'Wind', path: '/wind-config' },
  { label: 'Battery', path: '/battery-config' },
  { label: 'Diesel', path: '/dg-config' },
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

  // Get current step index based on exact path match
  const getCurrentStepIndex = () => {
    const currentPath = location.pathname;
    return PATH_TO_STEP_INDEX[currentPath] ?? -1;
  };

  const currentStepIndex = getCurrentStepIndex();

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
          const isFuture = index > currentStepIndex;
          
          return (
            <Step key={step.label}>
              <StepLabel
                onClick={() => {
                  // Allow navigation to any previous step
                  if (isCompleted) {
                    navigate(step.path);
                  }
                }}
                style={{
                  cursor: isCompleted ? 'pointer' : 'default',
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