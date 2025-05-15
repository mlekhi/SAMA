import React, { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import FormInputField from '@components/form/FormInputField'
import NextButton from '@components/form/NextButton'

function ComponentInfoPV() {
    const navigate = useNavigate()
    const [selectedSystems, setSelectedSystems] = useState({
        PV: false,
        WT: false,
        DG: false,
        Battery: false
    })

    const [isConfigLoaded, setIsConfigLoaded] = useState(false)

    const defaultComponentInfoPV = {
        PVLifetime: '25',
        PVDeratingFactor: '0.8',
        PVTrackingMode: '0',
        PVSlope: '0',
        PVAzimuth: '0',
        capitalCostPV: '1000',
        replacementCostPV: '1000',
        OMCostPV: '10'
    }

    const [myData, setMyData] = useState(defaultComponentInfoPV)

    function handleChange(e) {
        const { value, name } = e.target
        setMyData(prev => ({ ...prev, [name]: value }))
    }

    const handleNext = () => {
        sendComponentInfo()
        window.scrollTo(0, 0)
        if (selectedSystems.WT) {
            navigate('/wt')
        } else if (selectedSystems.DG) {
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
        const PV_Data = {
            PVLifetime: myData.PVLifetime,
            PVDeratingFactor: myData.PVDeratingFactor,
            PVTrackingMode: myData.PVTrackingMode,
            PVSlope: myData.PVSlope,
            PVAzimuth: myData.PVAzimuth,
            capitalCostPV: myData.capitalCostPV,
            replacementCostPV: myData.replacementCostPV,
            OMCostPV: myData.OMCostPV
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
            console.error('Error sending PV info:', error)
        }
    }

    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3, ml: '250px' }}>
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                <Typography variant="h4" gutterBottom>
                    Component Information - PV
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
                        label="PV Lifetime"
                        name="PVLifetime"
                        value={myData.PVLifetime}
                        onChange={handleChange}
                        endAdornment="years"
                    />

                    <FormInputField
                        label="PV Derating Factor"
                        name="PVDeratingFactor"
                        value={myData.PVDeratingFactor}
                        onChange={handleChange}
                    />

                    <FormInputField
                        label="PV Tracking Mode"
                        name="PVTrackingMode"
                        value={myData.PVTrackingMode}
                        onChange={handleChange}
                    />

                    <FormInputField
                        label="PV Slope"
                        name="PVSlope"
                        value={myData.PVSlope}
                        onChange={handleChange}
                        endAdornment="degrees"
                    />

                    <FormInputField
                        label="PV Azimuth"
                        name="PVAzimuth"
                        value={myData.PVAzimuth}
                        onChange={handleChange}
                        endAdornment="degrees"
                    />

                    <Typography variant="h5" gutterBottom>
                        Economic Information
                    </Typography>

                    <FormInputField
                        label="Capital Cost"
                        name="capitalCostPV"
                        value={myData.capitalCostPV}
                        onChange={handleChange}
                        endAdornment="$/kW"
                    />

                    <FormInputField
                        label="Replacement Cost"
                        name="replacementCostPV"
                        value={myData.replacementCostPV}
                        onChange={handleChange}
                        endAdornment="$/kW"
                    />

                    <FormInputField
                        label="O&M Cost"
                        name="OMCostPV"
                        value={myData.OMCostPV}
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

export default ComponentInfoPV