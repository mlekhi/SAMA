import React, { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import FormInputField from '@components/form/FormInputField'
import NextButton from '@components/form/NextButton'

function ComponentInfoWT() {
    const navigate = useNavigate()
    const [selectedSystems, setSelectedSystems] = useState({
        PV: false,
        WT: false,
        DG: false,
        Battery: false
    })

    const [isConfigLoaded, setIsConfigLoaded] = useState(false)

    const defaultComponentInfoWT = {
        WTLifetime: '25',
        WTHubHeight: '80',
        WTPowerCurve: '0',
        capitalCostWT: '1000',
        replacementCostWT: '1000',
        OMCostWT: '10'
    }

    const [myData, setMyData] = useState(defaultComponentInfoWT)

    function handleChange(e) {
        const { value, name } = e.target
        setMyData(prev => ({ ...prev, [name]: value }))
    }

    const handleNext = () => {
        sendComponentInfo()
        window.scrollTo(0, 0)
        if (selectedSystems.DG) {
            navigate('/dg')
        } else {
            navigate('/grid')
        }
    }

    useEffect(() => {
        getSystemConfig()
    }, [])

    const getSystemConfig = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/get/routing')
            const data = await response.json()
            setSelectedSystems(data["Energy Systems"])
            console.log(data["Energy Systems"])
            setIsConfigLoaded(true)
        } catch (error) {
            console.error('Error fetching system config:', error)
        }
    }

    const sendComponentInfo = async () => {
        const WT_Data = {
            WTLifetime: myData.WTLifetime,
            WTHubHeight: myData.WTHubHeight,
            WTPowerCurve: myData.WTPowerCurve,
            capitalCostWT: myData.capitalCostWT,
            replacementCostWT: myData.replacementCostWT,
            OMCostWT: myData.OMCostWT
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
                        label="WT Lifetime"
                        name="WTLifetime"
                        value={myData.WTLifetime}
                        onChange={handleChange}
                        endAdornment="years"
                    />

                    <FormInputField
                        label="WT Hub Height"
                        name="WTHubHeight"
                        value={myData.WTHubHeight}
                        onChange={handleChange}
                        endAdornment="m"
                    />

                    <FormInputField
                        label="WT Power Curve"
                        name="WTPowerCurve"
                        value={myData.WTPowerCurve}
                        onChange={handleChange}
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

export default ComponentInfoWT 