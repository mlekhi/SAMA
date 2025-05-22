import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
import { API_URL } from '@utils/config';

// System Pages
import GeoAndEconomy from '@system/GeoAndEconomy';
import SystemConfig from '@system/SystemConfig';
import GridInfo from '@system/GridInfo';
import OptimizationParams from '@system/OptimizationParams';

// Component Pages
// import ComponentInfoPV from '@system/Optional/ComponentInfoPV';
// import ComponentInfoBattery from '@system/Optional/ComponentInfoBattery';
// import ComponentInfoDG from '@system/Optional/ComponentInfoDG';
// import ComponentInfoInverter from '@system/Optional/ComponentInfoInverter';
// import ComponentInfoWindTurbine from '@system/Optional/ComponentInfoWindTurbine';

// // Results Pages
// import ResultsGraphs from '@components/results/ResultsGraphs';
// import ResultsSummary from '@components/results/ResultsSummary';
// import ResultsTimeSeries from '@components/results/ResultsTimeSeries';

// FAQ Page
import Faq from '@pages/Faq';

const DRAWER_WIDTH = 280;

// All steps in order
const steps = [
  {
    label: 'Geography & Economy',
    path: '/geo',
    icon: PlaceIcon,
    completedKey: 'geography_economy',
    required: true
  },
  {
    label: 'Optimization',
    path: '/optim',
    icon: BuildIcon,
    completedKey: 'optimization',
    required: true
  },
  {
    label: 'System Configuration',
    path: '/system',
    icon: SettingsIcon,
    completedKey: 'system_config',
    required: true
  },
  {
    label: 'PV System',
    path: '/components',
    icon: SolarIcon,
    completedKey: 'pv_system',
    required: false
  },
  {
    label: 'Wind Turbine',
    path: '/components',
    icon: WindIcon,
    completedKey: 'wind_turbine',
    required: false
  },
  {
    label: 'Battery',
    path: '/components',
    icon: BatteryIcon,
    completedKey: 'battery',
    required: false
  },
  {
    label: 'Inverter',
    path: '/components',
    icon: ElectricIcon,
    completedKey: 'inverter',
    required: false
  },
  {
    label: 'Diesel Generator',
    path: '/components',
    icon: PowerIcon,
    completedKey: 'diesel_generator',
    required: false
  },
  {
    label: 'Grid Information',
    path: '/grid',
    icon: GridIcon,
    completedKey: 'grid',
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
  const [currentStep, setCurrentStep] = useState(0);
  const [completedModels, setCompletedModels] = useState({});

  useEffect(() => {
    const fetchCompletedModels = async () => {
      const sessionId = localStorage.getItem('session_id');
      if (!sessionId) return;
      
      try {
        const response = await fetch(`${API_URL}/api/component/completed_models?session_id=${sessionId}`);
        if (!response.ok) throw new Error('Failed to fetch completed models');
        const data = await response.json();
        console.log('Completed models:', data);
        setCompletedModels(data);
      } catch (error) {
        console.error('Error fetching completed models:', error);
      }
    };
    fetchCompletedModels();
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;
    const stepIndex = steps.findIndex(step => step.path === currentPath);
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex);
    }
  }, [location]);

  const handleStepClick = (stepIndex) => {
    navigate(steps[stepIndex].path);
  };

  // Filter steps to show required ones and completed optional ones
  const visibleSteps = steps.filter(step => step.required || completedModels[step.completedKey]);

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          SAMA Tool
        </Typography>
        <NavLink
          to="/faq"
          style={({ isActive }) => ({
            color: '#888',
            fontSize: '0.95rem',
            fontStyle: 'italic',
            textDecoration: 'underline',
            fontWeight: isActive ? 'bold' : 'normal',
            transition: 'color 0.2s',
          })}
        >
          FAQ & Help
        </NavLink>
      </Box>
      <Divider />
      <List component="nav" sx={{ p: 1 }}>
        <SectionTitle>Configuration Steps</SectionTitle>
        {visibleSteps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = completedModels[step.completedKey];
          return (
            <Box key={step.path}>
              <StyledListItem
                button
                onClick={() => handleStepClick(index)}
              >
                <ListItemIcon>
                  {isCompleted ? (
                    <CheckCircleIcon color="success" />
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
          );
        })}
      </List>
    </>
  );
};

export default function Navigation() {
  return (
    <StyledDrawer variant="permanent" anchor="left">
      <NavigationContent />
      <Divider />
    </StyledDrawer>
  );
}
