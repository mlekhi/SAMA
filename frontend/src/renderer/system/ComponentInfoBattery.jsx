import React, { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import FormInputField from '@components/form/FormInputField'
import NextButton from '@components/form/NextButton'
import { API_URL } from "@utils/config"

function ComponentInfoBattery() {
    const navigate = useNavigate()
    const [defaults, setDefaults] = useState(null)
    const [isConfigLoaded, setIsConfigLoaded] = useState(false)

    const [myData, setMyData] = useState({
        batteryLifetime: '',
        batteryMinSOC: '',
        batteryMaxSOC: '',
        batteryEfficiency: '',
        capitalCostBattery: '',
        replacementCostBattery: '',
        OMCostBattery: ''
    })

    function handleChange(e) {
        const { value, name } = e.target
        setMyData(prev => ({ ...prev, [name]: value }))
    }

    const handleNext = () => {
        sendComponentInfo()
        window.scrollTo(0, 0)
        navigate('/grid')
    }

    useEffect(() => {
        const fetchDefaults = async () => {
            try {
                const sessionId = localStorage.getItem("session_id");
                if (!sessionId) {
                    console.error("No session ID found");
                    return;
                }

                const response = await fetch(`${API_URL}/api/defaults`)
                if (!response.ok) throw new Error('Failed to fetch defaults')
                const data = await response.json()
                setDefaults(data)
                
                // Set form data with backend defaults
                setMyData({
                    batteryLifetime: data.battery_lifetime?.toString() || '',
                    batteryMinSOC: data.SOC_min?.toString() || '',
                    batteryMaxSOC: data.SOC_max?.toString() || '',
                    batteryEfficiency: data.battery_efficiency?.toString() || '0.9',
                    capitalCostBattery: data.battery_capital_cost?.toString() || '1000',
                    replacementCostBattery: data.battery_replacement_cost?.toString() || '1000',
                    OMCostBattery: data.battery_om_cost?.toString() || '10'
                })

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
            const response = await fetch(`${API_URL}/battery`, {
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
