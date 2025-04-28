import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
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
  useTheme
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
  ElectricBolt as ElectricIcon
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

export default function Navigation() {
  const theme = useTheme();
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleDropdownToggle = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <Router>
      <StyledDrawer variant="permanent" anchor="left">
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            SAMA Tool
          </Typography>
        </Box>
        <Divider />
        
        <List component="nav" sx={{ p: 1 }}>
          <SectionTitle>System Configuration</SectionTitle>
          
          <StyledNavLink to="/">
            <StyledListItem>
              <ListItemIcon>
                <PlaceIcon />
              </ListItemIcon>
              <ListItemText primary="Geography & Economy" />
            </StyledListItem>
          </StyledNavLink>

          <StyledNavLink to="/system">
            <StyledListItem>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="System Config" />
            </StyledListItem>
          </StyledNavLink>

          <StyledNavLink to="/grid">
            <StyledListItem>
              <ListItemIcon>
                <GridIcon />
              </ListItemIcon>
              <ListItemText primary="Grid Information" />
            </StyledListItem>
          </StyledNavLink>

          <StyledNavLink to="/optim">
            <StyledListItem>
              <ListItemIcon>
                <BuildIcon />
              </ListItemIcon>
              <ListItemText primary="Optimization" />
            </StyledListItem>
          </StyledNavLink>

          <SectionTitle>Components</SectionTitle>
          
          <StyledListItem 
            button 
            onClick={() => handleDropdownToggle(0)}
          >
            <ListItemIcon>
              <ElectricIcon />
            </ListItemIcon>
            <ListItemText primary="Component Info" />
            {openDropdown === 0 ? <ExpandLess /> : <ExpandMore />}
          </StyledListItem>
          
          <Collapse in={openDropdown === 0} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <StyledNavLink to="/bat">
                <StyledListItem sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <BatteryIcon />
                  </ListItemIcon>
                  <ListItemText primary="Battery Bank" />
                </StyledListItem>
              </StyledNavLink>
              
              <StyledNavLink to="/inverter">
                <StyledListItem sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <ElectricIcon />
                  </ListItemIcon>
                  <ListItemText primary="Inverter" />
                </StyledListItem>
              </StyledNavLink>
              
              <StyledNavLink to="/pv">
                <StyledListItem sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <SolarIcon />
                  </ListItemIcon>
                  <ListItemText primary="Photovoltaic" />
                </StyledListItem>
              </StyledNavLink>
              
              <StyledNavLink to="/wt">
                <StyledListItem sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <WindIcon />
                  </ListItemIcon>
                  <ListItemText primary="Wind Turbine" />
                </StyledListItem>
              </StyledNavLink>
              
              <StyledNavLink to="/dg">
                <StyledListItem sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <PowerIcon />
                  </ListItemIcon>
                  <ListItemText primary="Diesel Generator" />
                </StyledListItem>
              </StyledNavLink>
            </List>
          </Collapse>

          <SectionTitle>Results</SectionTitle>
          
          <StyledListItem 
            button 
            onClick={() => handleDropdownToggle(1)}
          >
            <ListItemIcon>
              <DownloadIcon />
            </ListItemIcon>
            <ListItemText primary="Results" />
            {openDropdown === 1 ? <ExpandLess /> : <ExpandMore />}
          </StyledListItem>
          
          <Collapse in={openDropdown === 1} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <StyledNavLink to="/summary">
                <StyledListItem sx={{ pl: 4 }}>
                  <ListItemText primary="Summary" />
                </StyledListItem>
              </StyledNavLink>
              
              <StyledNavLink to="/timeseries">
                <StyledListItem sx={{ pl: 4 }}>
                  <ListItemText primary="Time Series" />
                </StyledListItem>
              </StyledNavLink>
              
              <StyledNavLink to="/graphs">
                <StyledListItem sx={{ pl: 4 }}>
                  <ListItemText primary="Graphs" />
                </StyledListItem>
              </StyledNavLink>
            </List>
          </Collapse>

          <StyledNavLink to="/faq">
            <StyledListItem>
              <ListItemIcon>
                <HelpCenterIcon />
              </ListItemIcon>
              <ListItemText primary="FAQ" />
            </StyledListItem>
          </StyledNavLink>
        </List>
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
