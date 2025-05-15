import React, { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import FormInputField from '@components/form/FormInputField'
import NextButton from '@components/form/NextButton'

function ComponentInfoBattery() {
    const navigate = useNavigate()
    const [selectedSystems, setSelectedSystems] = useState({
        PV: false,
        WT: false,
        DG: false,
        Battery: false
    })

    const [isConfigLoaded, setIsConfigLoaded] = useState(false)

    const defaultComponentInfoBattery = {
        batteryLifetime: '',
        batteryMinSOC: '',
        batteryMaxSOC: '',
        batteryEfficiency: '',
        capitalCostBattery: '',
        replacementCostBattery: '',
        OMCostBattery: ''
    }

    const [myData, setMyData] = useState(defaultComponentInfoBattery)

    function handleChange(e) {
        const { value, name } = e.target
        setMyData(prev => ({ ...prev, [name]: value }))
    }

    const handleNext = () => {
        sendComponentInfo()
        window.scrollTo(0, 0)
        if (selectedSystems.PV) {
            navigate('/pv')
        } else if (selectedSystems.WT) {
            navigate('/wt')
        } else if (selectedSystems.DG) {
            navigate('/dg')
        } else {
            navigate('/grid')
        }
    }

    useEffect(() => {
        const fetchDefaults = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/api/defaults')
                if (!response.ok) throw new Error('Failed to fetch defaults')
                const data = await response.json()
                
                // Set form data with backend defaults
                setMyData({
                    batteryLifetime: data.battery_lifetime?.toString() || '',
                    batteryMinSOC: data.SOC_min?.toString() || '',
                    batteryMaxSOC: data.SOC_max?.toString() || '',
                    batteryEfficiency: '0.9', // Default efficiency
                    capitalCostBattery: '1000', // Default cost
                    replacementCostBattery: '1000', // Default cost
                    OMCostBattery: '10' // Default cost
                })

                // Get system config
                const configResponse = await fetch('http://127.0.0.1:5000/get/routing')
                const configData = await configResponse.json()
                setSelectedSystems(configData["Energy Systems"])
                setIsConfigLoaded(true)
            } catch (error) {
                console.error('Error fetching defaults:', error)
            }
        }
        fetchDefaults()
    }, [])

    const sendComponentInfo = async () => {
        const Battery_Data = {
            batteryLifetime: myData.batteryLifetime,
            batteryMinSOC: myData.batteryMinSOC,
            batteryMaxSOC: myData.batteryMaxSOC,
            batteryEfficiency: myData.batteryEfficiency,
            capitalCostBattery: myData.capitalCostBattery,
            replacementCostBattery: myData.replacementCostBattery,
            OMCostBattery: myData.OMCostBattery
        }

        try {
            console.log(Battery_Data)
            const response = await fetch('http://127.0.0.1:5000/battery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Battery_Data)
            })

            const result = await response.json()
            console.log('Response from server:', result)
        } catch (error) {
            console.error('Error sending battery info:', error)
        }
    }

    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3, ml: '250px' }}>
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                <Typography variant="h4" gutterBottom>
                    Component Information - Battery
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                    <i>
                        Default values are provided for some questions, but please review and adjust as necessary for more accurate results.
                    </i>
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Technical Information
                    </Typography>

                    <FormInputField
                        label="Battery Lifetime"
                        name="batteryLifetime"
                        value={myData.batteryLifetime}
                        onChange={handleChange}
                        endAdornment="years"
                    />

                    <FormInputField
                        label="Battery Minimum State of Charge"
                        name="batteryMinSOC"
                        value={myData.batteryMinSOC}
                        onChange={handleChange}
                    />

                    <FormInputField
                        label="Battery Maximum State of Charge"
                        name="batteryMaxSOC"
                        value={myData.batteryMaxSOC}
                        onChange={handleChange}
                    />

                    <FormInputField
                        label="Battery Efficiency"
                        name="batteryEfficiency"
                        value={myData.batteryEfficiency}
                        onChange={handleChange}
                    />

                    <Typography variant="h5" gutterBottom>
                        Economic Information
                    </Typography>

                    <FormInputField
                        label="Capital Cost"
                        name="capitalCostBattery"
                        value={myData.capitalCostBattery}
                        onChange={handleChange}
                        endAdornment="$/kWh"
                    />

                    <FormInputField
                        label="Replacement Cost"
                        name="replacementCostBattery"
                        value={myData.replacementCostBattery}
                        onChange={handleChange}
                        endAdornment="$/kWh"
                    />

                    <FormInputField
                        label="O&M Cost"
                        name="OMCostBattery"
                        value={myData.OMCostBattery}
                        onChange={handleChange}
                        endAdornment="($/kWh)/year"
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <NextButton
                            label="Next"
                            onClick={handleNext}
                            disabled={!isConfigLoaded}
                            color="secondary"
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default ComponentInfoBattery
