import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemText, Collapse, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import GeoAndEconomy from '../GeoAndEconomy';
import SystemConfig from '../SystemConfig';
import GridInfo from '../GridInfo';
import OptimizationParams from '../OptimizationParams';
import ComponentInfoPV from '../ComponentInfoPV';
import ComponentInfoBattery from '../ComponentInfoBattery';
import ComponentInfoDG from '../ComponentInfoDG';
import ComponentInfoInverter from '../ComponentInfoInverter';
import ResultsGraphs from '../ResultsGraphs';
import ResultsSummary from '../ResultsSummary';
import ResultsTimeSeries from '../ResultsTimeSeries';
import optimIcon from '../assets/optimIcon.svg';
import gridIcon from '../assets/gridIcon.svg';
import compInfoIcon from '../assets/compInfoIcon.svg';
import PlaceIcon from '@mui/icons-material/Place';
import SettingsIcon from '@mui/icons-material/Settings';
import DownloadIcon from '@mui/icons-material/Download';
import ComponentInfoWindTurbine from '../ComponentInfoWindTurbine';
import Faq from '../Faq';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  '&.active': {
    border: '2px solid purple',
    borderRadius: "25px",
  },
  '&:hover':{
    backgroundColor: '#E8DEF8',
    borderRadius: "25px",
    color: "purple",
  },
  color: "purple",
  textDecoration: 'none', // Remove underline
  pointerEvents: 'none', // Disable clicks
}));

export default function Navigation() {
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleDropdownToggle = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <Router>
    <Drawer variant="permanent" anchor="left"sx={{ pr: 2}}>
      <List sx={{backgroundColor:"#F7F2FA" }} >
        <ListItemText sx={{pl: 2}}>Progress</ListItemText>
        <StyledListItem component={NavLink} to="/">
        <PlaceIcon sx={{margin: 1, color: "black"}}></PlaceIcon>
          <ListItemText primary="Geography and Economy" />
        </StyledListItem>

        <StyledListItem component={NavLink} to="/system">
        <SettingsIcon sx={{margin: 1, color: "black"}}></SettingsIcon>
          <ListItemText primary="System Configuration" />
        </StyledListItem>

        <StyledListItem onClick={() => handleDropdownToggle(0)}>
        <IconButton >
          <img  src={compInfoIcon} ></img>
        </IconButton>
          <ListItemText primary="Component Information" />
        </StyledListItem>
        <Collapse in={openDropdown === 0} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
          <StyledListItem component={NavLink} to="/bat" sx={{ pl: 4 }}>
              <ListItemText primary="Battery Bank" />
            </StyledListItem>
            <StyledListItem component={NavLink} to="/inverter" sx={{ pl: 4 }}>
              <ListItemText primary="Inverter" />
            </StyledListItem>
            <StyledListItem component={NavLink} to="/pv"sx={{ pl: 4 }}>
              <ListItemText primary="Photovoltaic" />
            </StyledListItem>
            <StyledListItem component={NavLink} to="/wt" sx={{ pl: 4 }}>
              <ListItemText primary="Wind Turbine" />
            </StyledListItem>
            <StyledListItem component={NavLink} to="/dg" sx={{ pl: 4 }}>
              <ListItemText primary="Diesel Generator" />
            </StyledListItem>
          </List>
        </Collapse>

        <StyledListItem component={NavLink} to="/grid">
        <IconButton>
          <img  src={gridIcon}></img>
        </IconButton>
          <ListItemText primary="Grid Information" />
        </StyledListItem>

        <StyledListItem  component={NavLink} to="/optim">
        <IconButton>
          <img  src={optimIcon}></img>
        </IconButton>
          <ListItemText primary="Optimization" />
        </StyledListItem>

        <StyledListItem  onClick={() => handleDropdownToggle(1)}>
          <DownloadIcon sx={{margin: 1, color: "black"}}></DownloadIcon>
          <ListItemText primary="Results" />
        </StyledListItem>
        <Collapse in={openDropdown === 1} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
          <StyledListItem  component={NavLink} to="/summary" sx={{ pl: 4 }}>
              <ListItemText primary="Summary" />
            </StyledListItem>
            <StyledListItem  component={NavLink} to="/timeseries" sx={{ pl: 4 }}>
              <ListItemText primary="Time Series" />
            </StyledListItem>
            <StyledListItem  component={NavLink} to="/graphs" sx={{ pl: 4 }}>
              <ListItemText primary="Graphs" />
            </StyledListItem>
          </List>
        </Collapse>
        <StyledListItem component={NavLink} to="/faq">
            <HelpCenterIcon sx={{margin: 1, color: "black"}}></HelpCenterIcon>
            <ListItemText primary="FAQ" />
            </StyledListItem>
      </List>
    </Drawer>
    <Routes>
          <Route path="/" element={<GeoAndEconomy />} />
          <Route path = "/system" element = {<SystemConfig/>}/>
          <Route path="/grid" element={<GridInfo />} />
          <Route path="/optim" element={<OptimizationParams />} />
          <Route path="/pv" element={<ComponentInfoPV />} />
          <Route path="/bat" element={<ComponentInfoBattery />} />
          <Route path="/dg" element={<ComponentInfoDG />} />
          <Route path="wt" element={<ComponentInfoWindTurbine/>} />
          <Route path="/inverter" element={<ComponentInfoInverter />} />
          <Route path="/graphs" element={<ResultsGraphs />} />
          <Route path="/summary" element={<ResultsSummary />} />
          <Route path="/timeseries" element={<ResultsTimeSeries />} /> 
          <Route path ="/faq" element={<Faq />} />
        </Routes>
    </Router>
  );
}
