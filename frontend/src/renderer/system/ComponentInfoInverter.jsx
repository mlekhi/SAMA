import React, { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import FormInputField from '@components/form/FormInputField'
import NextButton from '@components/form/NextButton'
import { API_URL } from "@utils/config"

function ComponentInfoInverter() {
    const navigate = useNavigate()
    const [defaults, setDefaults] = useState(null)
    const [isConfigLoaded, setIsConfigLoaded] = useState(false)

    const [myData, setMyData] = useState({
        inverterEfficiency: '',
        inverterLifetime: '',
        capitalCostInverter: '',
        replacementCostInverter: '',
        OMCostInverter: ''
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
                    inverterEfficiency: data.inverter_efficiency?.toString() || '',
                    inverterLifetime: data.inverter_lifetime?.toString() || '',
                    capitalCostInverter: data.inverter_capital_cost?.toString() || '1000',
                    replacementCostInverter: data.inverter_replacement_cost?.toString() || '1000',
                    OMCostInverter: data.inverter_om_cost?.toString() || '10'
                })

                setIsConfigLoaded(true)
            } catch (error) {
                console.error('Error fetching defaults:', error)
            }
        }
        fetchDefaults()
    }, [])

    const sendComponentInfo = async () => {
        const Inverter_Data = {
            inverterEfficiency: myData.inverterEfficiency,
            inverterLifetime: myData.inverterLifetime,
            capitalCostInverter: myData.capitalCostInverter,
            replacementCostInverter: myData.replacementCostInverter,
            OMCostInverter: myData.OMCostInverter
        }

        try {
            const response = await fetch(`${API_URL}/inverter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Inverter_Data)
            })

            const result = await response.json()
            console.log('Response from server:', result)
        } catch (error) {
            console.error('Error sending inverter info:', error)
        }
    }

    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3, ml: '250px' }}>
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                <Typography variant="h4" gutterBottom>
                    Component Information - Inverter
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
                        label="Inverter Efficiency"
                        name="inverterEfficiency"
                        value={myData.inverterEfficiency}
                        onChange={handleChange}
                    />

                    <FormInputField
                        label="Inverter Lifetime"
                        name="inverterLifetime"
                        value={myData.inverterLifetime}
                        onChange={handleChange}
                        endAdornment="years"
                    />

                    <Typography variant="h5" gutterBottom>
                        Economic Information
                    </Typography>

                    <FormInputField
                        label="Capital Cost"
                        name="capitalCostInverter"
                        value={myData.capitalCostInverter}
                        onChange={handleChange}
                        endAdornment="$/kW"
                    />

                    <FormInputField
                        label="Replacement Cost"
                        name="replacementCostInverter"
                        value={myData.replacementCostInverter}
                        onChange={handleChange}
                        endAdornment="$/kW"
                    />

                    <FormInputField
                        label="O&M Cost"
                        name="OMCostInverter"
                        value={myData.OMCostInverter}
                        onChange={handleChange}
                        endAdornment="$/kW/year"
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

export default ComponentInfoInverter
