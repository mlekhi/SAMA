import React, { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import FormInputField from '@components/form/FormInputField'
import NextButton from '@components/form/NextButton'
import { API_URL } from "@utils/config"

function ComponentInfoWindTurbine() {
    const navigate = useNavigate()
    const [defaults, setDefaults] = useState(null)
    const [isConfigLoaded, setIsConfigLoaded] = useState(false)

    const [myData, setMyData] = useState({
        hubHeight: '',
        anemometerHeight: '',
        windEfficiency: '',
        cutOutSpeed: '',
        cutInSpeed: '',
        ratedSpeed: '',
        coefficientFriction: '',
        windLifetime: '',
        capitalCostWT: '',
        replacementCostWT: '',
        OMCostWT: '',
        engineeringOtherCosts: ''
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
                    hubHeight: data.hub_height?.toString() || '',
                    anemometerHeight: data.anemometer_height?.toString() || '',
                    windEfficiency: data.wind_efficiency?.toString() || '',
                    cutOutSpeed: data.cut_out_speed?.toString() || '',
                    cutInSpeed: data.cut_in_speed?.toString() || '',
                    ratedSpeed: data.rated_speed?.toString() || '',
                    coefficientFriction: data.coefficient_friction?.toString() || '0.11',
                    windLifetime: data.wind_lifetime?.toString() || '',
                    capitalCostWT: data.wind_capital_cost?.toString() || '1200',
                    replacementCostWT: data.wind_replacement_cost?.toString() || '1200',
                    OMCostWT: data.wind_om_cost?.toString() || '40',
                    engineeringOtherCosts: data.engineering_other_costs?.toString() || '0'
                })

                setIsConfigLoaded(true)
            } catch (error) {
                console.error('Error fetching defaults:', error)
            }
        }
        fetchDefaults()
    }, [])

    const sendComponentInfo = async () => {
        const WindTurbine_Data = {
            hubHeight: myData.hubHeight,
            anemometerHeight: myData.anemometerHeight,
            windEfficiency: myData.windEfficiency,
            cutOutSpeed: myData.cutOutSpeed,
            cutInSpeed: myData.cutInSpeed,
            ratedSpeed: myData.ratedSpeed,
            coefficientFriction: myData.coefficientFriction,
            windLifetime: myData.windLifetime,
            capitalCostWT: myData.capitalCostWT,
            replacementCostWT: myData.replacementCostWT,
            OMCostWT: myData.OMCostWT,
            engineeringOtherCosts: myData.engineeringOtherCosts
        }

        try {
            const response = await fetch(`${API_URL}/windturbine`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(WindTurbine_Data)
            })

            const result = await response.json()
            console.log('Response from server:', result)
        } catch (error) {
            console.error('Error sending wind turbine info:', error)
        }
    }

    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3, ml: '250px' }}>
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                <Typography variant="h4" gutterBottom>
                    Component Information - Wind Turbine
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
                        label="Hub Height"
                        name="hubHeight"
                        value={myData.hubHeight}
                        onChange={handleChange}
                        endAdornment="m"
                    />

                    <FormInputField
                        label="Anemometer Height"
                        name="anemometerHeight"
                        value={myData.anemometerHeight}
                        onChange={handleChange}
                        endAdornment="m"
                    />

                    <FormInputField
                        label="Wind Turbine Efficiency"
                        name="windEfficiency"
                        value={myData.windEfficiency}
                        onChange={handleChange}
                    />

                    <FormInputField
                        label="Cut-out Speed"
                        name="cutOutSpeed"
                        value={myData.cutOutSpeed}
                        onChange={handleChange}
                        endAdornment="m/s"
                    />

                    <FormInputField
                        label="Cut-in Speed"
                        name="cutInSpeed"
                        value={myData.cutInSpeed}
                        onChange={handleChange}
                        endAdornment="m/s"
                    />

                    <FormInputField
                        label="Rated Speed"
                        name="ratedSpeed"
                        value={myData.ratedSpeed}
                        onChange={handleChange}
                        endAdornment="m/s"
                    />

                    <FormInputField
                        label="Coefficient of Friction"
                        name="coefficientFriction"
                        value={myData.coefficientFriction}
                        onChange={handleChange}
                    />

                    <FormInputField
                        label="Wind Turbine Lifetime"
                        name="windLifetime"
                        value={myData.windLifetime}
                        onChange={handleChange}
                        endAdornment="years"
                    />

                    <Typography variant="h5" gutterBottom>
                        Economic Information
                    </Typography>

                    <FormInputField
                        label="Capital Cost"
                        name="capitalCostWT"
                        value={myData.capitalCostWT}
                        onChange={handleChange}
                        endAdornment="$/kW"
                    />

                    <FormInputField
                        label="Replacement Cost"
                        name="replacementCostWT"
                        value={myData.replacementCostWT}
                        onChange={handleChange}
                        endAdornment="$/kW"
                    />

                    <FormInputField
                        label="O&M Cost"
                        name="OMCostWT"
                        value={myData.OMCostWT}
                        onChange={handleChange}
                        endAdornment="$/kW/year"
                    />

                    <FormInputField
                        label="Engineering and Other Costs"
                        name="engineeringOtherCosts"
                        value={myData.engineeringOtherCosts}
                        onChange={handleChange}
                        endAdornment="$/kW"
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

export default ComponentInfoWindTurbine
