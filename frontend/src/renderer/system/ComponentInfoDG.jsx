import React, { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import FormInputField from '@components/form/FormInputField'
import NextButton from '@components/form/NextButton'

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
        const { value, name } = e.target
        setMyData(prev => ({ ...prev, [name]: value }))
    }

    const handleNext = () => {
        sendComponentInfo()
        window.scrollTo(0, 0)
        navigate('/grid')
    }

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
        <Box component="main" sx={{ flexGrow: 1, p: 3, ml: '250px' }}>
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                <Typography variant="h4" gutterBottom>
                    Component Information - Diesel Generator
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                    <i>
                        Default values are provided for some questions, but please review and adjust as necessary for more accurate results.
                    </i>
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Diesel Generator Fuel Information
                    </Typography>

                    <FormInputField
                        label="Slope"
                        name="slope"
                        value={myData.slope}
                        onChange={handleChange}
                        endAdornment="Liter/hr/kW output"
                    />

                    <FormInputField
                        label="Intercept Coefficient"
                        name="interceptCoefficient"
                        value={myData.interceptCoefficient}
                        onChange={handleChange}
                        endAdornment="Liter/hr/kW rate"
                    />

                    <Typography variant="h5" gutterBottom>
                        Economic Information
                    </Typography>

                    <FormInputField
                        label="Capital Cost"
                        name="capitalCostDG"
                        value={myData.capitalCostDG}
                        onChange={handleChange}
                        endAdornment="$/kW"
                    />

                    <FormInputField
                        label="Replacement Cost"
                        name="replacementCostDG"
                        value={myData.replacementCostDG}
                        onChange={handleChange}
                        endAdornment="$/kW"
                    />

                    <FormInputField
                        label="O&M Cost"
                        name="OMCostDG"
                        value={myData.OMCostDG}
                        onChange={handleChange}
                        endAdornment="$/op.h"
                    />

                    <FormInputField
                        label="Fuel Cost"
                        name="fuelCostDG"
                        value={myData.fuelCostDG}
                        onChange={handleChange}
                        endAdornment="$/L"
                    />

                    <FormInputField
                        label="DG Fuel Cost Yearly Escalation/Reduction Rate"
                        name="DGFuelCostRate"
                        value={myData.DGFuelCostRate}
                        onChange={handleChange}
                        endAdornment="%"
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <NextButton
                            label="Next"
                            onClick={handleNext}
                            color="secondary"
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default ComponentInfoDG
