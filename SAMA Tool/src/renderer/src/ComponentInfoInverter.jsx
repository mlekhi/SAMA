import React, { useState, useEffect} from 'react'
import { Box, Typography, TextField, Button, InputAdornment } from '@mui/material'
import { useNavigate } from 'react-router-dom'

function ComponentInfoInverter() {
  const navigate = useNavigate()

 // State to store the configuration data
 const [selectedSystems, setSelectedSystems] = useState({
  PV: false,
  WT: false,
  DG: false,
  Battery: false
});

  // State to track if system config has loaded
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  const defaultComponentInfoInverter = {
    inverterEfficiency: '0.96', //technical information
    inverterLifetime: '25',
    maxAcceptableRatio: '1.99',
    capitalCostI: '440', //economic information
    replacementCostI: '440',
    OMCostI: '3.4'
  }

  const [myData, setMyData] = useState(defaultComponentInfoInverter)

  function handleChange(e) {
    const { value, name } = e.target
    setMyData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleNext = () => {
    sendComponentInfo()
    window.scrollTo(0, 0);
    //Navigate based on the selected system
    if (selectedSystems.PV) {
      navigate('/pv')
    } else if (selectedSystems.WT) {
      navigate('/wt')
    } else if (selectedSystems.DG) {
      navigate('/dg')
    }
    else {
      navigate('/grid');
    }
  }

 useEffect(() => {
    getSystemConfig();
  }, []);

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
    const I_Data = {
      inverterEfficiency: myData.inverterEfficiency,
      inverterLifetime: myData.inverterLifetime,
      maxAcceptableRatio: myData.maxAcceptableRatio,
      capitalCostI: myData.capitalCostI, //economic information
      replacementCostI: myData.replacementCostI,
      OMCostI: myData.OMCostI
    }

    try {
      console.log(I_Data)
      const response = await fetch('http://127.0.0.1:5000/inverter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(I_Data)
      })

      const result = await response.json()
      console.log('Response from server:', result)
    } catch (error) {
      console.error('Error sending inverter info:', error)
    }
  }

  return (
    <div style={{ marginLeft: '220px', padding: '20px' }}>
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Component Information - Inverter
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          <i>
            Default values are provided for some questions, but please review and adjust as
            necessary for more accurate results.
          </i>
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          Technical Information
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Enter your inverter efficiency
        </Typography>
        <TextField
          label="Inverter Efficiency"
          variant="outlined"
          name="inverterEfficiency"
          value={myData.inverterEfficiency}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2, width: 300 }}
          InputProps={{
            endAdornment: <InputAdornment position="end"></InputAdornment>
          }}
        />
        <Typography variant="body1" sx={{ mb: 1 }}>
          Enter your inverter lifetime
        </Typography>
        <TextField
          label="Inverter Lifetime"
          variant="outlined"
          name="inverterLifetime"
          value={myData.inverterLifetime}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2, width: 300 }}
          InputProps={{
            endAdornment: <InputAdornment position="end">years</InputAdornment>
          }}
        />
        <Typography variant="body1" sx={{ mb: 1 }}>
          Enter your maximum acceptable DC to AC ratio
        </Typography>
        <TextField
          label="Maximum acceptable DC to AC ratio"
          variant="outlined"
          name="maxAcceptableRatio"
          value={myData.maxAcceptableRatio}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2, width: 300 }}
        />
        <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 4, mb: 2 }}>
          Economic Information
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Enter your capital cost
        </Typography>
        <TextField
          label="Capital Cost"
          variant="outlined"
          name="capitalCostI"
          value={myData.capitalCostI}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2, width: 300 }}
          InputProps={{
            endAdornment: <InputAdornment position="end">$/kW</InputAdornment>
          }}
        />
        <Typography variant="body1" sx={{ mb: 1 }}>
          Enter your replacement cost
        </Typography>
        <TextField
          label="Replacement Cost"
          variant="outlined"
          name="replacementCostI"
          value={myData.replacementCostI}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2, width: 300 }}
          InputProps={{
            endAdornment: <InputAdornment position="end">$/kW</InputAdornment>
          }}
        />
        <Typography variant="body1" sx={{ mb: 1 }}>
          Enter your O&M cost
        </Typography>
        <TextField
          label="O&M Cost"
          variant="outlined"
          name="OMCostI"
          value={myData.OMCostI}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 4, width: 300 }}
          InputProps={{
            endAdornment: <InputAdornment position="end">($/kW)/year</InputAdornment>
          }}
        />
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

export default ComponentInfoInverter
