import React, { useState, useEffect} from 'react'
import { Box, Typography, FormControl, TextField, Button, InputAdornment } from '@mui/material'
import { useNavigate } from 'react-router-dom'

function ComponentInfoPV() {
  const navigate = useNavigate()
   // State to store the configuration data
   const [selectedSystems, setSelectedSystems] = useState({
    PV: false,
    WT: false,
    DG: false,
    Battery: false,
  });
    const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  const defaultComponentInfoPV = {
    //technical information
    azimuthPV: '180',
    tiltPV: '28.1',
    soilingPV: '5',
    deratingFactor: '0.9',
    tempCoefficient: '-0.3',
    tempStandardTestCondition: '25',
    nominalOpCellTemp: '45',
    ambientTemp: '20',
    solarRadiation: '800',
    efficiency: '0.2182',
    referenceIrradianc: '1000',
    moduleLifetime: '25',

    //economic information
    capitalCostPV: '0.00',
    moduleReplacementCostPV: '5.50',
    OMCostPV: '2.00',
    engineeringOtherCosts: '0'
  }
  const [myData, setMyData] = useState(defaultComponentInfoPV)

  function handleChange(e) {
    let { value, name } = e.target
    setMyData((myData) => ({ ...myData, [name]: value }))
  }

 useEffect(() => {
    getSystemConfig();
  }, []);

  const handleNext = () => {
    sendComponentInfo()

    //Navigate based on the selected system
      if (selectedSystems.WT) {
        navigate("/wt");
    } else if (selectedSystems.DG) {
        navigate("/dg");
    } else {
        navigate("/grid")
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
    const PV_Data = {
      azimuthPV: myData.azimuthPV,
      tiltPV: myData.tiltPV,
      soilingPV: myData.soilingPV, 
      deratingFactor: myData.deratingFactor,
      tempCoefficient: myData.tempCoefficient,
      tempStandardTestCondition: myData.tempStandardTestCondition,
      nominalOpCellTemp: myData.nominalOpCellTemp,
      ambientTemp: myData.ambientTemp,
      solarRadiation: myData.solarRadiation,
      efficiency: myData.efficiency,
      referenceIrradianc: myData.referenceIrradianc,
      moduleLifetime: myData.moduleLifetime,
      capitalCostPV: myData.capitalCostPV,
      moduleReplacementCostPV: myData.moduleReplacementCostPV,
      OMCostPV: myData.OMCostPV,
      engineeringOtherCosts: myData.engineeringOtherCosts
    }

    try {
      console.log(PV_Data)
      const response = await fetch('http://127.0.0.1:5000/pv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(PV_Data)
      })

      const result = await response.json()
      console.log('Response from server:', result)
    } catch (error) {
      console.error('Error sending pv info:', error)
    }
  }

  return (
    <div style={{ marginLeft: '220px', padding: '20px' }}>
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Component Information - Photovoltaic
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
            Enter your PV azimuth.
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Azimuth"
              variant="outlined"
              name="azimuthPV"
              value={myData.azimuthPV}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: 0 }}
              InputProps={{
                endAdornment: <InputAdornment position="end"></InputAdornment>
              }}
            />
          </FormControl>
          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your PV tilt angle.
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Tilt"
              variant="outlined"
              name="tiltPV"
              value={myData.tiltPV}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: 0 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">°</InputAdornment>
              }}
            />
          </FormControl>
          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your PV soiling losses.
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Soiling"
              variant="outlined"
              name="soilingPV"
              value={myData.soilingPV}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: 0 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>
              }}
            />
          </FormControl>
          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your PV derating factor.
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Derating Factor"
              variant="outlined"
              name="deratingFactor"
              value={myData.deratingFactor}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: 0 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>
              }}
            />
          </FormControl>

          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your temperature coefficient.
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Temp Coefficient"
              variant="outlined"
              name="tempCoefficient"
              value={myData.tempCoefficient}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: 0 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">%/°C</InputAdornment>
              }}
            />
          </FormControl>

          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your temperature at standard test condition
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Temp at STC"
              variant="outlined"
              name="tempStandardTestCondition"
              value={myData.tempStandardTestCondition}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: 0 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">°C</InputAdornment>
              }}
            />
          </FormControl>

          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your nominal operating cell temperature
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Nominal Cell Temperature"
              variant="outlined"
              name="nominalOpCellTemp"
              value={myData.nominalOpCellTemp}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: 0 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">°C</InputAdornment>
              }}
            />
          </FormControl>

          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your ambient temperature at which the NOCT is defined
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Ambient Temp"
              variant="outlined"
              name="ambientTemp"
              value={myData.ambientTemp}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: 0 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">°C</InputAdornment>
              }}
            />
          </FormControl>

          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your solar radiation at which the NOCT is defined
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Solar Radiation"
              variant="outlined"
              name="solarRadiation"
              value={myData.solarRadiation}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: 0 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">W/m2</InputAdornment>
              }}
            />
          </FormControl>

          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter efficiency of PV module
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Efficiency"
              variant="outlined"
              name="efficiency"
              value={myData.efficiency}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: 0 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">%/100</InputAdornment>
              }}
            />
          </FormControl>

          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your reference irradiance
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Reference Irradiance"
              variant="outlined"
              name="referenceIrradianc"
              value={myData.referenceIrradianc}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: 0 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">W/m2</InputAdornment>
              }}
            />
          </FormControl>

          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your PV modules' lifetime
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Module Lifetime"
              variant="outlined"
              name="moduleLifetime"
              value={myData.moduleLifetime}
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
            Enter your capital cost
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Capital Cost"
              variant="outlined"
              name="capitalCostPV"
              value={myData.capitalCostPV}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: '10px' }}
              InputProps={{
                endAdornment: <InputAdornment position="end">$/kW</InputAdornment>
              }}
            />
          </FormControl>
          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your replacement cost
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="Replacement Cost"
              variant="outlined"
              name="moduleReplacementCostPV"
              value={myData.moduleReplacementCostPV}
              onChange={handleChange}
              fullWidth
              style={{ marginBottom: '10px' }}
              InputProps={{
                endAdornment: <InputAdornment position="end">$/kW</InputAdornment>
              }}
            />
          </FormControl>
          <Typography variant="body1" sx={{ mb: 0, width: 700 }}>
            Enter your OM cost
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
            <TextField
              label="OM Cost"
              variant="outlined"
              name="OMCostPV"
              value={myData.OMCostPV}
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
            disabled={!isConfigLoaded} // Disable button until config is loaded
          >
            Next
          </Button>
        </Box>
      </Box>
    </div>
  )
}

export default ComponentInfoPV