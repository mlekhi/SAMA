import React, { useState, useEffect} from 'react'
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  CircularProgress,
  List,
  ListItem,
  Divider,
  Grid2,
  InputAdornment
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

function ComponentInfoWindTurbine() {
  const navigate = useNavigate()
     const [selectedSystems, setSelectedSystems] = useState({
      PV: false,
      WT: false,
      DG: false,
      Battery: false,
    });
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  
  const defaultComponentInfoWindTurbine = {
    hubHeight: '17',
    anemometerHeight: '43.6',
    electricalEfficiency: '1',
    cutOutSpeed: '25',
    cutInSpeed: '2.5',
    ratedSpeed: '9.5',
    coefficientFriction: '0.11',
    lifetimeWT: '20',
    capitalCostWT: '1200',
    replacementCostWT: '1200',
    OMCostWT: '40',
    engineeringOtherCosts: 0
  }
  const [myData, setMyData] = useState(defaultComponentInfoWindTurbine)

  function handleChange(e) {
    let { value, name } = e.target
    setMyData((myData) => ({ ...myData, [name]: value }))
  }

   useEffect(() => {
      getSystemConfig();
    }, []);
  

  const handleNext = () => {
    sendComponentInfo()
    window.scrollTo(0, 0);
    //Navigate based on the selected system
    if (selectedSystems.DG) {
      navigate('/dg')
    } else {
      navigate('/grid')
    }
  }

// Function to fetch system configuration from the backend
const getSystemConfig = async () => {
  try {
    const response = await fetch('http://127.0.0.1:5000/get/routing');
    const data = await response.json();
    // Set the selected systems state based on the data fetched from the backend
    setSelectedSystems(data["Energy Systems"]);
    console.log(data["Energy Systems"]);
    setIsConfigLoaded(true); // Set config loaded flag to true
  } catch (error) {
    console.error('Error fetching system config:', error);
  }
};
  
  //backend connection
  const sendComponentInfo = async () => {
    const WT_Data = {
      hubHeight: myData.hubHeight,
      anemometerHeight: myData.anemometerHeight,
      electricalEfficiency: myData.electricalEfficiency,
      cutOutSpeed: myData.cutOutSpeed,
      cutInSpeed: myData.cutInSpeed,
      ratedSpeed: myData.ratedSpeed,
      coefficientFriction: myData.coefficientFriction,
      lifetimeWT: myData.lifetimeWT,
      capitalCostWT: myData.capitalCostWT,
      replacementCostWT: myData.replacementCostWT,
      OMCostWT: myData.OMCostWT,
      engineeringOtherCosts: myData.engineeringOtherCosts
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/wt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(WT_Data)
      })

      const result = await response.json()
      console.log('Response from server:', result)
    } catch (error) {
      console.error('Error sending wind turbine info:', error)
    }
  }

  return (
    <div style={{ marginLeft: '220px', padding: '20px' }}>
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Component Information - Wind Turbine
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          <i>
            Default values are provided for some questions, but please review and adjust as
            necessary for more accurate results.
          </i>
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', width: 700 }}>
            Technical Information
          </Typography>

          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your hub height
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Hub Height"
              variant="outlined"
              name="hubHeight"
              value={myData.hubHeight}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: 0 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">m</InputAdornment>
              }}
            />
          </FormControl>

          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your anemometer height
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Anemometer Height"
              variant="outlined"
              name="anemometerHeight"
              value={myData.anemometerHeight}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: 0 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">m</InputAdornment>
              }}
            />
          </FormControl>

          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your electrical efficiency
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Electrical Efficiency"
              variant="outlined"
              name="electricalEfficiency"
              value={myData.electricalEfficiency}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: 0 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>
              }}
            />
          </FormControl>

          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your cut out speed
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Cut Out Speed"
              variant="outlined"
              name="cutOutSpeed"
              value={myData.cutOutSpeed}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: 0 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">m/s</InputAdornment>
              }}
            />
          </FormControl>

          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your cut in speed
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Cut In Speed"
              variant="outlined"
              name="cutInSpeed"
              value={myData.cutInSpeed}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: 0 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">m/s</InputAdornment>
              }}
            />
          </FormControl>

          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your rated speed
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Rated Speed"
              variant="outlined"
              name="ratedSpeed"
              value={myData.ratedSpeed}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: 0 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">m/s</InputAdornment>
              }}
            />
          </FormControl>

          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter coefficient of friction
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Coefficient of Friction"
              variant="outlined"
              name="coefficientFriction"
              value={myData.coefficientFriction}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: 0 }}
              InputProps={{
                endAdornment: <InputAdornment position="end"></InputAdornment>
              }}
            />
          </FormControl>

          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your wind turbine lifetime
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Lifetime"
              variant="outlined"
              name="lifetimeWT"
              value={myData.lifetimeWT}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: 0 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">years</InputAdornment>
              }}
            />
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', width: 700 }}>
            Economic Information
          </Typography>

          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your capital cost.
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Capital Cost"
              variant="outlined"
              name="capitalCostWT"
              value={myData.capitalCostWT}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: '10px' }}
              InputProps={{
                endAdornment: <InputAdornment position="end">$/kW</InputAdornment>
              }}
            />
          </FormControl>
          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your replacement cost.
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Wind Turbine Replacement Cost"
              variant="outlined"
              name="replacementCostWT"
              value={myData.replacementCostWT}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: '10px' }}
              InputProps={{
                endAdornment: <InputAdornment position="end">$/kW</InputAdornment>
              }}
            />
          </FormControl>
          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your OM cost.
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="OM Cost"
              variant="outlined"
              name="OMCostWT"
              value={myData.OMCostWT}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: '10px' }}
              InputProps={{
                endAdornment: <InputAdornment position="end">$/kW</InputAdornment>
              }}
            />
          </FormControl>
          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your engineering and other costs.
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Engineering/Other Costs"
              variant="outlined"
              name="engineeringOtherCosts"
              value={myData.engineeringOtherCosts}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: '10px' }}
              InputProps={{
                endAdornment: <InputAdornment position="end">$</InputAdornment>
              }}
            />
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '300px', mt: 4 }}>
          {/* <Button
            variant="contained"
            sx={{
              minWidth: 100,
              backgroundColor: '#5A3472',
              '&:hover': { backgroundColor: '#4A2D61' },
              color: 'white'
            }}
          >
            Previous
          </Button> */}
          <Button
            variant="contained"
            sx={{
              minWidth: 100,
              backgroundColor: '#5A3472',
              '&:hover': { backgroundColor: '#4A2D61' },
              color: 'white'
            }}
            onClick={handleNext}
            disabled={!isConfigLoaded}
          >
            Next
          </Button>
        </Box>
      </Box>
    </div>
  )
}

export default ComponentInfoWindTurbine
