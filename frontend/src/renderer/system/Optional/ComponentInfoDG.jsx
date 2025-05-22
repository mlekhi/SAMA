import React, { useState, useEffect } from 'react'
import { Box, Typography, Container } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import FormInputField from '@components/form/FormInputField'
import NextButton from '@components/form/NextButton'
import { API_URL } from "@utils/config"
import Navigation from '@components/Navigation'

function ComponentInfoDG({ onNext }) {
    const navigate = useNavigate()
    const [defaults, setDefaults] = useState(null)
    const [isConfigLoaded, setIsConfigLoaded] = useState(false)
    const [errorDialog, setErrorDialog] = useState({ open: false, title: '', message: '' })

    const [myData, setMyData] = useState({
        a: '',
        b: '',
        C_DG: '',
        R_DG: '',
        MO_DG: '',
        C_fuel: '',
        C_fuel_adj_rate: ''
    })

    function handleChange(e) {
        const { value, name } = e.target
        setMyData(prev => ({ ...prev, [name]: value }))
    }

    const handleNext = () => {
        sendComponentInfo()
        window.scrollTo(0, 0)
        onNext()
    }

    useEffect(() => {
        const fetchDefaults = async () => {
            try {
                const sessionId = localStorage.getItem("session_id");
                if (!sessionId) {
                    console.error("No session ID found");
                    return;
                }

                console.log("Fetching defaults from /api/get");
                const response = await fetch(`${API_URL}/api/get`);
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Error response:", errorData);
                    throw new Error(errorData.error || 'Failed to fetch defaults');
                }
                const data = await response.json();
                console.log("Received data:", data);
                setDefaults(data);
                
                // Set form data with backend defaults from diesel section
                const dieselData = data.diesel || {};
                console.log("Diesel data:", dieselData);
                
                setMyData({
                    a: dieselData.fuel_curve_a?.toString() || '',
                    b: dieselData.fuel_curve_b?.toString() || '',
                    C_DG: dieselData.C_DG?.toString() || '',
                    R_DG: dieselData.R_DG?.toString() || '',
                    MO_DG: dieselData.MO_DG?.toString() || '',
                    C_fuel: dieselData.C_fuel?.toString() || '',
                    C_fuel_adj_rate: dieselData.C_fuel_adj_rate?.toString() || ''
                });

                setIsConfigLoaded(true);
            } catch (error) {
                console.error('Error fetching defaults:', error);
                setErrorDialog({
                    open: true,
                    title: 'Error Loading Defaults',
                    message: error.message || 'Failed to load default values. Please try again.'
                });
            }
        };
        fetchDefaults();
    }, []);

    const sendComponentInfo = async () => {
        try {
            const response = await fetch(`${API_URL}/api/component/diesel_generator`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session_id: localStorage.getItem("session_id"),
                    ...myData
                })
            });

            const result = await response.json();
            console.log('Response from server:', result);
        } catch (error) {
            console.error('Error sending diesel generator info:', error);
            setErrorDialog({
                open: true,
                title: 'Error Saving Data',
                message: error.message || 'Failed to save diesel generator data. Please try again.'
            });
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
                            Technical Information
                        </Typography>

                        <FormInputField
                            label="Fuel Curve Coefficient A"
                            name="a"
                            value={myData.a}
                            onChange={handleChange}
                        />

                        <FormInputField
                            label="Fuel Curve Coefficient B"
                            name="b"
                            value={myData.b}
                            onChange={handleChange}
                        />

                        <Typography variant="h5" gutterBottom>
                            Economic Information
                        </Typography>

                        <FormInputField
                            label="Capital Cost"
                            name="C_DG"
                            value={myData.C_DG}
                            onChange={handleChange}
                            endAdornment="$/kW"
                        />

                        <FormInputField
                            label="Replacement Cost"
                            name="R_DG"
                            value={myData.R_DG}
                            onChange={handleChange}
                            endAdornment="$/kW"
                        />

                        <FormInputField
                            label="O&M Cost"
                            name="MO_DG"
                            value={myData.MO_DG}
                            onChange={handleChange}
                            endAdornment="$/kW/year"
                        />

                        <FormInputField
                            label="Fuel Cost"
                            name="C_fuel"
                            value={myData.C_fuel}
                            onChange={handleChange}
                            endAdornment="$/L"
                        />

                        <FormInputField
                            label="Fuel Cost Adjustment Rate"
                            name="C_fuel_adj_rate"
                            value={myData.C_fuel_adj_rate}
                            onChange={handleChange}
                            endAdornment="%/year"
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
