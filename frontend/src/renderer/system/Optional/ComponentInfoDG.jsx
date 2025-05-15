import React, { useState, useEffect } from 'react'
import { Box, Typography, Container } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import FormInputField from '@components/form/FormInputField'
import NextButton from '@components/form/NextButton'
import { API_URL } from "@utils/config"
import Navigation from '@components/Navigation'

function ComponentInfoDG() {
    const navigate = useNavigate()
    const [defaults, setDefaults] = useState(null)
    const [isConfigLoaded, setIsConfigLoaded] = useState(false)

    const [myData, setMyData] = useState({
        slope: '',
        interceptCoefficient: '',
        capitalCostDG: '',
        replacementCostDG: '',
        OMCostDG: '',
        fuelCostDG: '',
        DGFuelCostRate: ''
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
                    slope: data.fuel_curve_a?.toString() || '',
                    interceptCoefficient: data.fuel_curve_b?.toString() || '',
                    capitalCostDG: data.dg_capital_cost?.toString() || '1000',
                    replacementCostDG: data.dg_replacement_cost?.toString() || '1000',
                    OMCostDG: data.dg_om_cost?.toString() || '10',
                    fuelCostDG: data.dg_fuel_cost?.toString() || '1',
                    DGFuelCostRate: data.dg_fuel_cost_rate?.toString() || '0'
                })

                setIsConfigLoaded(true)
            } catch (error) {
                console.error('Error fetching defaults:', error)
            }
        }
        fetchDefaults()
    }, [])

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
            const response = await fetch(`${API_URL}/dg`, {
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
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
            <Navigation />
            <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 6 }}>
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
                                disabled={!isConfigLoaded}
                                color="secondary"
                            />
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    )
}

export default ComponentInfoDG
