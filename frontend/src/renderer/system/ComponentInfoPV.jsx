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
        pvLifetime: '',
        pvDerating: '',
        tempCoeff: '',
        tempRef: '',
        tempNoct: '',
        pvEfficiency: '',
        capitalCostPV: '',
        replacementCostPV: '',
        OMCostPV: ''
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
                    pvLifetime: data.pv_lifetime?.toString() || '',
                    pvDerating: data.pv_derating?.toString() || '',
                    tempCoeff: data.temp_coef?.toString() || '',
                    tempRef: data.temp_ref?.toString() || '',
                    tempNoct: data.temp_noct?.toString() || '',
                    pvEfficiency: data.pv_efficiency?.toString() || '',
                    capitalCostPV: '1000', // Default cost
                    replacementCostPV: '1000', // Default cost
                    OMCostPV: '10' // Default cost
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
        const PV_Data = {
            pvLifetime: myData.pvLifetime,
            pvDerating: myData.pvDerating,
            tempCoeff: myData.tempCoeff,
            tempRef: myData.tempRef,
            tempNoct: myData.tempNoct,
            pvEfficiency: myData.pvEfficiency,
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
                        name="pvLifetime"
                        value={myData.pvLifetime}
                        onChange={handleChange}
                        endAdornment="years"
                    />

                    <FormInputField
                        label="PV Derating Factor"
                        name="pvDerating"
                        value={myData.pvDerating}
                        onChange={handleChange}
                    />

                    <FormInputField
                        label="Temperature Coefficient"
                        name="tempCoeff"
                        value={myData.tempCoeff}
                        onChange={handleChange}
                        endAdornment="%/°C"
                    />

                    <FormInputField
                        label="Reference Temperature"
                        name="tempRef"
                        value={myData.tempRef}
                        onChange={handleChange}
                        endAdornment="°C"
                    />

                    <FormInputField
                        label="Nominal Operating Cell Temperature"
                        name="tempNoct"
                        value={myData.tempNoct}
                        onChange={handleChange}
                        endAdornment="°C"
                    />

                    <FormInputField
                        label="PV Efficiency"
                        name="pvEfficiency"
                        value={myData.pvEfficiency}
                        onChange={handleChange}
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