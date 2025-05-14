import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Collapse, 
  Typography,
  Box,
  Divider,
  useTheme,
  Tooltip,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Place as PlaceIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon,
  HelpCenter as HelpCenterIcon,
  ExpandLess,
  ExpandMore,
  GridOn as GridIcon,
  Build as BuildIcon,
  BatteryChargingFull as BatteryIcon,
  SolarPower as SolarIcon,
  WindPower as WindIcon,
  Power as PowerIcon,
  ElectricBolt as ElectricIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon
} from '@mui/icons-material';

// System Pages
import GeoAndEconomy from '@system/GeoAndEconomy';
import SystemConfig from '@system/SystemConfig';
import GridInfo from '@system/GridInfo';
import OptimizationParams from '@system/OptimizationParams';

// Component Pages
import ComponentInfoPV from '@components/ComponentInfoPV';
import ComponentInfoBattery from '@components/ComponentInfoBattery';
import ComponentInfoDG from '@components/ComponentInfoDG';
import ComponentInfoInverter from '@components/ComponentInfoInverter';
import ComponentInfoWindTurbine from '@components/ComponentInfoWindTurbine';

// Results Pages
import ResultsGraphs from '@components/results/ResultsGraphs';
import ResultsSummary from '@components/results/ResultsSummary';
import ResultsTimeSeries from '@components/results/ResultsTimeSeries';

// FAQ Page
import Faq from '@pages/Faq';

const DRAWER_WIDTH = 280;

const steps = [
  {
    label: 'Geography & Economy',
    path: '/',
    icon: PlaceIcon,
    required: true
  },
  {
    label: 'System Configuration',
    path: '/system',
    icon: SettingsIcon,
    required: true
  },
  {
    label: 'PV System',
    path: '/pv',
    icon: SolarIcon,
    required: true
  },
  {
    label: 'Inverter',
    path: '/inverter',
    icon: ElectricIcon,
    required: true
  },
  {
    label: 'Diesel Generator',
    path: '/dg',
    icon: PowerIcon,
    required: false
  },
  {
    label: 'Battery',
    path: '/bat',
    icon: BatteryIcon,
    required: false
  },
  {
    label: 'Wind Turbine',
    path: '/wt',
    icon: WindIcon,
    required: false
  },
  {
    label: 'Grid Information',
    path: '/grid',
    icon: GridIcon,
    required: false
  },
  {
    label: 'Optimization',
    path: '/optim',
    icon: BuildIcon,
    required: true
  }
];

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
}));

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.text.primary,
  '&.active': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.main,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5),
  padding: theme.spacing(1, 2),
  '& .MuiListItemIcon-root': {
    minWidth: '40px',
    color: theme.palette.text.secondary,
  },
  '& .MuiListItemText-primary': {
    fontWeight: 500,
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1),
  color: theme.palette.text.secondary,
  fontWeight: 600,
  fontSize: '0.875rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}));

const NavigationContent = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [completedSteps, setCompletedSteps] = useState({});
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const currentPath = location.pathname;
    const stepIndex = steps.findIndex(step => step.path === currentPath);
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex);
    }
  }, [location]);

  const handleStepClick = (stepIndex) => {
    // Check if all previous required steps are completed
    const canAccess = steps.slice(0, stepIndex).every((step, index) => {
      if (step.required) {
        return completedSteps[index] === true;
      }
      return true;
    });

    if (canAccess) {
      navigate(steps[stepIndex].path);
    }
  };

  const markStepComplete = (stepIndex) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepIndex]: true
    }));
  };

  const getStepStatus = (index) => {
    if (index < currentStep) {
      return completedSteps[index] ? 'completed' : 'locked';
    }
    if (index === currentStep) {
      return 'current';
    }
    return 'locked';
  };

  const calculateProgress = () => {
    const requiredSteps = steps.filter(step => step.required);
    const completedRequiredSteps = requiredSteps.filter((_, index) => completedSteps[index]);
    return (completedRequiredSteps.length / requiredSteps.length) * 100;
  };

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          SAMA Tool
        </Typography>
        <Box sx={{ mt: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={calculateProgress()} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </Box>
      <Divider />
      
      <List component="nav" sx={{ p: 1 }}>
        <SectionTitle>Configuration Steps</SectionTitle>
        
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const Icon = step.icon;
          
          return (
            <Tooltip 
              key={step.path}
              title={status === 'locked' ? 'Complete previous required steps first' : ''}
              placement="right"
            >
              <Box>
                <StyledListItem
                  button
                  onClick={() => handleStepClick(index)}
                  sx={{
                    opacity: status === 'locked' ? 0.5 : 1,
                    cursor: status === 'locked' ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ListItemIcon>
                    {status === 'completed' ? (
                      <CheckCircleIcon color="success" />
                    ) : status === 'locked' ? (
                      <LockIcon color="disabled" />
                    ) : (
                      <Icon />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={step.label}
                    secondary={step.required ? 'Required' : 'Optional'}
                  />
                </StyledListItem>
              </Box>
            </Tooltip>
          );
        })}
      </List>
    </>
  );
};

export default function Navigation() {
  return (
    <Router>
      <StyledDrawer variant="permanent" anchor="left">
        <NavigationContent />
      </StyledDrawer>

      <Box component="main" sx={{ flexGrow: 1, ml: `${DRAWER_WIDTH}px` }}>
        <Routes>
          <Route path="/" element={<GeoAndEconomy />} />
          <Route path="/system" element={<SystemConfig />} />
          <Route path="/grid" element={<GridInfo />} />
          <Route path="/optim" element={<OptimizationParams />} />
          <Route path="/pv" element={<ComponentInfoPV />} />
          <Route path="/bat" element={<ComponentInfoBattery />} />
          <Route path="/dg" element={<ComponentInfoDG />} />
          <Route path="/wt" element={<ComponentInfoWindTurbine />} />
          <Route path="/inverter" element={<ComponentInfoInverter />} />
          <Route path="/graphs" element={<ResultsGraphs />} />
          <Route path="/summary" element={<ResultsSummary />} />
          <Route path="/timeseries" element={<ResultsTimeSeries />} />
          <Route path="/faq" element={<Faq />} />
        </Routes>
      </Box>
    </Router>
  );
}
