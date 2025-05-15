import React, { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import FormInputField from '@components/form/FormInputField'
import NextButton from '@components/form/NextButton'
import { API_URL } from "@utils/config"

function ComponentInfoInverter() {
    const navigate = useNavigate()
    const [selectedSystems, setSelectedSystems] = useState({
        PV: false,
        WT: false,
        DG: false,
        Battery: false
    })

    const [isConfigLoaded, setIsConfigLoaded] = useState(false)

    const defaultComponentInfoInverter = {
        inverterEfficiency: '',
        inverterLifetime: '',
        maxAcceptableRatio: '',
        capitalCostI: '',
        replacementCostI: '',
        OMCostI: ''
    }

    const [myData, setMyData] = useState(defaultComponentInfoInverter)

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
                const response = await fetch(`${API_URL}/api/defaults`)
                if (!response.ok) throw new Error('Failed to fetch defaults')
                const data = await response.json()
                
                // Set form data with backend defaults
                setMyData({
                    inverterEfficiency: data.inverter_efficiency?.toString() || '',
                    inverterLifetime: data.inverter_lifetime?.toString() || '',
                    maxAcceptableRatio: data.dc_ac_ratio?.toString() || '',
                    capitalCostI: '1000', // Default cost
                    replacementCostI: '1000', // Default cost
                    OMCostI: '10' // Default cost
                })

                // Get system config
                const configResponse = await fetch(`${API_URL}/get/routing`)
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
        const I_Data = {
            inverterEfficiency: myData.inverterEfficiency,
            inverterLifetime: myData.inverterLifetime,
            maxAcceptableRatio: myData.maxAcceptableRatio,
            capitalCostI: myData.capitalCostI,
            replacementCostI: myData.replacementCostI,
            OMCostI: myData.OMCostI
        }

        try {
            console.log(I_Data)
            const response = await fetch(`${API_URL}/inverter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(I_Data)
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

                    <FormInputField
                        label="Maximum acceptable DC to AC ratio"
                        name="maxAcceptableRatio"
                        value={myData.maxAcceptableRatio}
                        onChange={handleChange}
                    />

                    <Typography variant="h5" gutterBottom>
                        Economic Information
                    </Typography>

                    <FormInputField
                        label="Capital Cost"
                        name="capitalCostI"
                        value={myData.capitalCostI}
                        onChange={handleChange}
                        endAdornment="$/kW"
                    />

                    <FormInputField
                        label="Replacement Cost"
                        name="replacementCostI"
                        value={myData.replacementCostI}
                        onChange={handleChange}
                        endAdornment="$/kW"
                    />

                    <FormInputField
                        label="O&M Cost"
                        name="OMCostI"
                        value={myData.OMCostI}
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

export default ComponentInfoInverter
