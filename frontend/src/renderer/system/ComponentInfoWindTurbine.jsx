import React, { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import FormInputField from '@components/form/FormInputField'
import NextButton from '@components/form/NextButton'

function ComponentInfoWindTurbine() {
    const navigate = useNavigate()
    const [selectedSystems, setSelectedSystems] = useState({
        PV: false,
        WT: false,
        DG: false,
        Battery: false
    })

    const [isConfigLoaded, setIsConfigLoaded] = useState(false)

    const defaultComponentInfoWindTurbine = {
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
    }

    const [myData, setMyData] = useState(defaultComponentInfoWindTurbine)

    function handleChange(e) {
        const { value, name } = e.target
        setMyData(prev => ({ ...prev, [name]: value }))
    }

    const handleNext = () => {
        sendComponentInfo()
        window.scrollTo(0, 0)
        if (selectedSystems.DG) {
            navigate('/dg')
        } else if (selectedSystems.Battery) {
            navigate('/battery')
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
                    hubHeight: data.hub_height?.toString() || '',
                    anemometerHeight: data.anemometer_height?.toString() || '',
                    windEfficiency: data.wind_efficiency?.toString() || '',
                    cutOutSpeed: data.cut_out_speed?.toString() || '',
                    cutInSpeed: data.cut_in_speed?.toString() || '',
                    ratedSpeed: data.rated_speed?.toString() || '',
                    coefficientFriction: '0.11', // Default value
                    windLifetime: data.wind_lifetime?.toString() || '',
                    capitalCostWT: '1200', // Default cost
                    replacementCostWT: '1200', // Default cost
                    OMCostWT: '40', // Default cost
                    engineeringOtherCosts: '0' // Default cost
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
        const WT_Data = {
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
            console.log(WT_Data)
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
                        endAdornment="($/kW)/year"
                    />

                    <FormInputField
                        label="Engineering/Other Costs"
                        name="engineeringOtherCosts"
                        value={myData.engineeringOtherCosts}
                        onChange={handleChange}
                        endAdornment="$"
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
