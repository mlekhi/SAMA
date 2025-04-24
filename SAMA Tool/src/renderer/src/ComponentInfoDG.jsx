import React, { useState, useEffect } from 'react'
import { Box, Typography, TextField, Button, InputAdornment } from '@mui/material'
import { useNavigate } from 'react-router-dom'

function ComponentInfoDG() {
    const navigate = useNavigate()
  const defaultComponentInfoDG = {
    slope: '0.273',
    interceptCoefficient: '0.033',
    capitalCostDG: '240.45',
    replacementCostDG: '240.45',
    OMCostDG: '0.066',
    fuelCostDG: '1.428',
    DGFuelCostRate: '2'
  }

  const [myData, setMyData] = useState(defaultComponentInfoDG)

  function handleChange(e) {
    let { value, name } = e.target
    switch (name) {
      case 'slope':
        setMyData((myData) => ({ ...myData, slope: value }))
        break
      case 'interceptCoefficient':
        setMyData((myData) => ({ ...myData, interceptCoefficient: value }))
        break
      case 'capitalCostDG':
        setMyData((myData) => ({ ...myData, capitalCostDG: value }))
        break
      case 'replacementCostDG':
        setMyData((myData) => ({ ...myData, replacementCostDG: value }))
        break
      case 'OMCostDG':
        setMyData((myData) => ({ ...myData, OMCostDG: value }))
        break
      case 'fuelCostDG':
        setMyData((myData) => ({ ...myData, fuelCostDG: value }))
        break
      case 'DGFuelCostRate':
        setMyData((myData) => ({ ...myData, DGFuelCostRate: value }))
        break
      default:
        break
    }
  }

  const handleNext = () => {
    sendComponentInfo()
    window.scrollTo(0, 0);
    navigate('/grid')
  }

  //backend connection
  const sendComponentInfo = async () => {
    const DG_Data = {
      slope: myData.slope,
    interceptCoefficient: myData.interceptCoefficient,
    capitalCostDG: myData.capitalCostDG,
    replacementCostDG: myData.replacementCostDG,
    OMCostDG: myData.OMCostDG,
    fuelCostDG: myData.fuelCostDG,
    DGFuelCostRate: myData.DGFuelCostRate
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/dg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(DG_Data)
      })

      const result = await response.json()
      console.log('Response from server:', result)
    } catch (error) {
      console.error('Error sending diesel generator info:', error)
    }
  }

  return (
    <div style={{ marginLeft: '220px', padding: '20px' }}>
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Component Information - Diesel Generator
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          <i>
            Default values are provided for some questions, but please review and adjust as
            necessary for more accurate results.
          </i>
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          Diesel Generator Fuel Information
        </Typography>

        <Typography variant="body1" sx={{ mb: 1 }}>
          Enter your slope for the diesel generator fuel curve
        </Typography>
        <TextField
          label="Slope"
          variant="outlined"
          name="slope"
          value={myData.slope}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2, width: 300 }}
          InputProps={{
            endAdornment: <InputAdornment position="end">Liter/hr/kW output</InputAdornment>
          }}
        />

        <Typography variant="body1" sx={{ mb: 1 }}>
          Enter your intercept coefficient
        </Typography>
        <TextField
          label="Intercept Coefficient"
          variant="outlined"
          name="interceptCoefficient"
          value={myData.interceptCoefficient}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2, width: 300 }}
          InputProps={{
            endAdornment: <InputAdornment position="end">Liter/hr/kW rate</InputAdornment>
          }}
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
          name="capitalCostDG"
          value={myData.capitalCostDG}
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
          name="replacementCostDG"
          value={myData.replacementCostDG}
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
          name="OMCostDG"
          value={myData.OMCostDG}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2, width: 300 }}
          InputProps={{
            endAdornment: <InputAdornment position="end">$/op.h</InputAdornment>
          }}
        />

        <Typography variant="body1" sx={{ mb: 1 }}>
          Enter your fuel cost
        </Typography>
        <TextField
          label="Fuel Cost"
          variant="outlined"
          name="fuelCostDG"
          value={myData.fuelCostDG}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2, width: 300 }}
          InputProps={{
            endAdornment: <InputAdornment position="end">$/L</InputAdornment>
          }}
        />

        <Typography variant="body1" sx={{ mb: 1 }}>
          Enter your DG Fuel Cost Yearly Escalation/Reduction Rate
        </Typography>
        <TextField
          label="Fuel Rate"
          variant="outlined"
          name="DGFuelCostRate"
          value={myData.DGFuelCostRate}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2, width: 300 }}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>
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
          >
            Next
          </Button>
        </Box>
      </Box>
    </div>
  )
}

export default ComponentInfoDG
