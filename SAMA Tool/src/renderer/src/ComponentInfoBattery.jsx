import React, { useState, useEffect} from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

function ComponentInfoBattery() {
  const navigate = useNavigate()
  const defaultComponentInfoBattery = {
    //battery information
    minSoC: '0.1',
    maxSoC: '1',
    initalSoC: '0.5',
    hourlySelfDischarge: '0',
    batteryLifetime: '7.5',

    //lead acid battery information
    nomialCapacityLA: '83.4',
    maxChargeRateLA: '1',
    capacityRatioLA: '0.403',
    rateConstantLA: '0.827',
    maxChargeCurrentLA: '16.7',
    nominalVoltageLA: '12',
    roundTripEfficiencyLA: '0.8',
    throughoutLA: '8000',

    //li-ion battery information
    maxChargeCurrentL: '167',
    maxDischargeCurrentL: '500',
    maxChargeRateL: '1',
    nominalVoltageL: '6',
    nominalCapacityL: '167',
    roundTripEfficiencyL: '0.9',
    throughoutL: '3000',

    //economic information
    capitalCostB: '458.06',
    replacementCostB: '458.06',
    maintenanceCostB: '10.27'

    //charge controller parameters
    // capitalCostCC: '200',
    // replacementCostCC: '200',
    // OMCostCC: '0'
  }

  const [myData, setMyData] = useState(defaultComponentInfoBattery)
  const [batteryType, setBatteryType] = useState('')

  function handleChange(e) {
    const { value, name } = e.target
    setMyData((prevData) => ({ ...prevData, [name]: value }))
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
      //setSelectedSystems(data["Energy Systems"]);
      setBatteryType(data["Battery Type"])
      setIsConfigLoaded(true); // Set config loaded flag to true
    } catch (error) {
      console.error('Error fetching system config:', error);
    }
  };

  const handleNext = () => {
    // then navigate to optim
    window.scrollTo(0, 0);
    navigate('/inverter')
    sendComponentInfo()
  }

  //backend connection
  const sendComponentInfo = async () => {
    const battery_Data = {
      batteryType: batteryType ? 1 : 0,
      minSoC: myData.minSoC,
      maxSoC: myData.maxSoC,
      initalSoC: myData.initalSoC,
      hourlySelfDischarge: myData.hourlySelfDischarge,
      batteryLifetime: myData.batteryLifetime,

      //lead acid battery information
      nomialCapacityLA: myData.nomialCapacityLA,
      maxChargeRateLA: myData.maxChargeRateLA,
      capacityRatioLA: myData.capacityRatioLA,
      rateConstantLA: myData.rateConstantLA,
      maxChargeCurrentLA: myData.maxChargeCurrentLA,
      nominalVoltageLA: myData.nominalVoltageLA,
      roundTripEfficiencyLA: myData.roundTripEfficiencyLA,
      throughoutLA: myData.throughoutLA,

      //li-ion battery information
      maxChargeCurrentL: myData.maxChargeCurrentL,
      maxDischargeCurrentL: myData.maxDischargeCurrentL,
      maxChargeRateL: myData.maxChargeRateL,
      nominalVoltageL: myData.nominalVoltageL,
      nominalCapacityL: myData.nominalCapacityL,
      roundTripEfficiencyL: myData.roundTripEfficiencyL,
      throughoutL: myData.throughoutL,

      //economic information
      capitalCostB: myData.capitalCostB,
      replacementCostB: myData.replacementCostB,
      maintenanceCostB: myData.maintenanceCostB
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/bat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(battery_Data)
      })

      const result = await response.json()
      console.log('Response from server:', result)
    } catch (error) {
      console.error('Error sending battery info:', error)
    }
  }

  return (
    <div style={{ marginLeft: '220px', padding: '20px' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', padding:4}}>
        <Typography variant="h4" gutterBottom>
          Component Information - Battery Bank
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
          Enter your minimum state of charge (SoC)
        </Typography>
        <TextField
          label="Min SoC"
          variant="outlined"
          name="minSoC"
          value={myData.minSoC}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2, width: 300 }}
          InputProps={{
            endAdornment: <InputAdornment position="end"></InputAdornment>
          }}
        />

        <Typography variant="body1" sx={{ mb: 1 }}>
          Enter your maximum state of charge (SoC)
        </Typography>
        <TextField
          label="Max SoC"
          variant="outlined"
          name="maxSoC"
          value={myData.maxSoC}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2, width: 300 }}
          InputProps={{
            endAdornment: <InputAdornment position="end"></InputAdornment>
          }}
        />

        <Typography variant="body1" sx={{ mb: 1 }}>
          Enter your inital state of charge (SoC)
        </Typography>
        <TextField
          label="Initial SoC"
          variant="outlined"
          name="initalSoC"
          value={myData.initalSoC}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2, width: 300 }}
          InputProps={{
            endAdornment: <InputAdornment position="end">%/100</InputAdornment>
          }}
        />

        <Typography variant="body1" sx={{ mb: 1 }}>
          Enter your hourly self-discharge rate
        </Typography>
        <TextField
          label="Self-discharge rate"
          variant="outlined"
          name="hourlySelfDischarge"
          value={myData.hourlySelfDischarge}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2, width: 300 }}
          InputProps={{
            endAdornment: <InputAdornment position="end">%/100</InputAdornment>
          }}
        />

        <Typography variant="body1" sx={{ mb: 1 }}>
          Enter your battery lifetime
        </Typography>
        <TextField
          label="Lifetime"
          variant="outlined"
          name="batteryLifetime"
          value={myData.batteryLifetime}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 3, width: 300 }}
          InputProps={{
            endAdornment: <InputAdornment position="end">years</InputAdornment>
          }}
        />

        {/* Battery Type Selection with Radio Buttons
        <FormControl>
          <Typography variant="body1" sx={{ mb: 1 }}>
            What type of battery are you using?
          </Typography>
          <RadioGroup row value={batteryType} onChange={(e) => setBatteryType(e.target.value)}>
            <FormControlLabel
              value="Lead Acid"
              control={
                <Radio
                  sx={{
                    color: '#5A3472',
                    '&.Mui-checked': {
                      color: '#5A3472'
                    }
                  }}
                />
              }
              label="Lead Acid"
            />
            <FormControlLabel
              value="Li-ion"
              control={
                <Radio
                  sx={{
                    color: '#5A3472',
                    '&.Mui-checked': {
                      color: '#5A3472'
                    }
                  }}
                />
              }
              label="Li-ion"
            />
          </RadioGroup>
        </FormControl> */}

        {batteryType && (
          <>
            {batteryType === 'Lead-Acid' && (
              <>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 4, mb: 2 }}>
                  Lead Acid Battery
                </Typography>

                <Typography variant="body1" sx={{ mb: 1 }}>
                  Enter the lead acid nominal capacity
                </Typography>
                <TextField
                  label="Nominal capacity"
                  variant="outlined"
                  name="nomialCapacityLA"
                  value={myData.nomialCapacityLA}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2, width: 300 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">Ah</InputAdornment>
                  }}
                />

                <Typography variant="body1" sx={{ mb: 1 }}>
                  Enter storage's maximum charge rate
                </Typography>
                <TextField
                  label="Max charge rate"
                  variant="outlined"
                  name="maxChargeRateLA"
                  value={myData.maxChargeRateLA}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2, width: 300 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">A/Ah</InputAdornment>
                  }}
                />

                <Typography variant="body1" sx={{ mb: 1 }}>
                  Enter your storage capacity ratio
                </Typography>
                <TextField
                  label="Capacity ratio"
                  variant="outlined"
                  name="capacityRatioLA"
                  value={myData.capacityRatioLA}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2, width: 300 }}
                />

                <Typography variant="body1" sx={{ mb: 1 }}>
                  Enter your storage rate constant
                </Typography>
                <TextField
                  label="Rate constant"
                  variant="outlined"
                  name="rateConstantLA"
                  value={myData.rateConstantLA}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2, width: 300 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">1/h</InputAdornment>
                  }}
                />

                <Typography variant="body1" sx={{ mb: 1 }}>
                  Enter storage's maximum charge current
                </Typography>
                <TextField
                  label="Max charge current"
                  variant="outlined"
                  name="maxChargeCurrentLA"
                  value={myData.maxChargeCurrentLA}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2, width: 300 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">A</InputAdornment>
                  }}
                />

                <Typography variant="body1" sx={{ mb: 1 }}>
                  Enter storage's nominal voltage
                </Typography>
                <TextField
                  label="Nominal voltage"
                  variant="outlined"
                  name="nominalVoltageLA"
                  value={myData.nominalVoltageLA}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2, width: 300 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">V</InputAdornment>
                  }}
                />

                <Typography variant="body1" sx={{ mb: 1 }}>
                  Enter round trip efficiency
                </Typography>
                <TextField
                  label="Efficiency"
                  variant="outlined"
                  name="roundTripEfficiencyLA"
                  value={myData.roundTripEfficiencyLA}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2, width: 300 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%/100</InputAdornment>
                  }}
                />

                <Typography variant="body1" sx={{ mb: 1 }}>
                  Enter throughout
                </Typography>
                <TextField
                  label="Throughout"
                  variant="outlined"
                  name="throughoutLA"
                  value={myData.throughoutLA}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2, width: 300 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">kWh</InputAdornment>
                  }}
                />
              </>
            )}

            {batteryType === 'Li-Ion' && (
              // Li-ion fields here
              <>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 4, mb: 2 }}>
                  Li-ion Battery
                </Typography>

                <Typography variant="body1" sx={{ mb: 1 }}>
                  Enter storage's maximum charge current
                </Typography>
                <TextField
                  label="Max charge current"
                  variant="outlined"
                  name="maxChargeCurrentL"
                  value={myData.maxChargeCurrentL}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2, width: 300 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">A</InputAdornment>
                  }}
                />

                <Typography variant="body1" sx={{ mb: 1 }}>
                  Enter storage's maximum discharge current
                </Typography>
                <TextField
                  label="Max discharge current"
                  variant="outlined"
                  name="maxDischargeCurrentL"
                  value={myData.maxDischargeCurrentL}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2, width: 300 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">A</InputAdornment>
                  }}
                />

                <Typography variant="body1" sx={{ mb: 1 }}>
                  Enter storage's maximum charge rate
                </Typography>
                <TextField
                  label="Max charge rate"
                  variant="outlined"
                  name="maxChargeRateL"
                  value={myData.maxChargeRateL}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2, width: 300 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">A/Ah</InputAdornment>
                  }}
                />

                <Typography variant="body1" sx={{ mb: 1 }}>
                  Enter storage's nominal voltage
                </Typography>
                <TextField
                  label="Nominal voltage"
                  variant="outlined"
                  name="nominalVoltageL"
                  value={myData.nominalVoltageL}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2, width: 300 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">V</InputAdornment>
                  }}
                />

                <Typography variant="body1" sx={{ mb: 1 }}>
                  Enter Li-ion nominal capacity
                </Typography>
                <TextField
                  label="Nominal capacity"
                  variant="outlined"
                  name="nominalCapacityL"
                  value={myData.nominalCapacityL}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2, width: 300 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">[Ah]</InputAdornment>
                  }}
                />

                <Typography variant="body1" sx={{ mb: 1 }}>
                  Enter round trip efficiency
                </Typography>
                <TextField
                  label="Efficiency"
                  variant="outlined"
                  name="roundTripEfficiencyL"
                  value={myData.roundTripEfficiencyL}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2, width: 300 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%/100</InputAdornment>
                  }}
                />

                <Typography variant="body1" sx={{ mb: 1 }}>
                  Enter throughout
                </Typography>
                <TextField
                  label="Throughout"
                  variant="outlined"
                  name="throughoutL"
                  value={myData.throughoutL}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2, width: 300 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">kWh</InputAdornment>
                  }}
                />
              </>
            )}
          </>
        )}

        <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 4, mb: 2 }}>
          Economic Information
        </Typography>

        <Typography variant="body1" sx={{ mb: 1 }}>
          Enter your capital cost
        </Typography>
        <TextField
          label="Capital cost"
          variant="outlined"
          name="capitalCostB"
          value={myData.capitalCostB}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2, width: 300 }}
          InputProps={{
            endAdornment: <InputAdornment position="end">$/kWh</InputAdornment>
          }}
        />

        <Typography variant="body1" sx={{ mb: 1 }}>
          Enter your replacement cost
        </Typography>
        <TextField
          label="Replacement cost"
          variant="outlined"
          name="replacementCostB"
          value={myData.replacementCostB}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2, width: 300 }}
          InputProps={{
            endAdornment: <InputAdornment position="end">$/kWh</InputAdornment>
          }}
        />

        <Typography variant="body1" sx={{ mb: 1 }}>
          Enter your maintenance cost
        </Typography>
        <TextField
          label="Maintenance cost"
          variant="outlined"
          name="maintenanceCostB"
          value={myData.maintenanceCostB}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2, width: 300 }}
          InputProps={{
            endAdornment: <InputAdornment position="end">$/kw.year</InputAdornment>
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

export default ComponentInfoBattery
