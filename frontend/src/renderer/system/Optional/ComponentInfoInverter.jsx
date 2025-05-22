import React, { useState, useEffect } from 'react'
import { Box, Typography, Container } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import FormInputField from '@components/form/FormInputField'
import NextButton from '@components/form/NextButton'
import { API_URL } from "@utils/config"
import Navigation from '@components/Navigation'

function ComponentInfoInverter({ onNext }) {
    const navigate = useNavigate()
    const [defaults, setDefaults] = useState(null)
    const [isConfigLoaded, setIsConfigLoaded] = useState(false)
    const [errorDialog, setErrorDialog] = useState({ open: false, title: '', message: '' })

    const [myData, setMyData] = useState({
        n_I: '',
        L_I: '',
        DC_AC_ratio: '',
        C_I: '',
        R_I: '',
        MO_I: ''
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
                
                // Set form data with backend defaults from inverter section
                const inverterData = data.inverter || {};
                console.log("Inverter data:", inverterData);
                
                setMyData({
                    n_I: inverterData.inverter_efficiency?.toString() || '',
                    L_I: inverterData.inverter_lifetime?.toString() || '',
                    DC_AC_ratio: inverterData.dc_ac_ratio?.toString() || '',
                    C_I: inverterData.C_I?.toString() || '',
                    R_I: inverterData.R_I?.toString() || '',
                    MO_I: inverterData.MO_I?.toString() || ''
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
            const response = await fetch(`${API_URL}/api/component/inverter`, {
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
            console.error('Error sending inverter info:', error);
            setErrorDialog({
                open: true,
                title: 'Error Saving Data',
                message: error.message || 'Failed to save inverter data. Please try again.'
            });
        }
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
            <Navigation />
            <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 6 }}>
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
                            name="n_I"
                            value={myData.n_I}
                            onChange={handleChange}
                        />

                        <FormInputField
                            label="Inverter Lifetime"
                            name="L_I"
                            value={myData.L_I}
                            onChange={handleChange}
                            endAdornment="years"
                        />

                        <FormInputField
                            label="DC/AC Ratio"
                            name="DC_AC_ratio"
                            value={myData.DC_AC_ratio}
                            onChange={handleChange}
                        />

                        <Typography variant="h5" gutterBottom>
                            Economic Information
                        </Typography>

                        <FormInputField
                            label="Capital Cost"
                            name="C_I"
                            value={myData.C_I}
                            onChange={handleChange}
                            endAdornment="$/kW"
                        />

                        <FormInputField
                            label="Replacement Cost"
                            name="R_I"
                            value={myData.R_I}
                            onChange={handleChange}
                            endAdornment="$/kW"
                        />

                        <FormInputField
                            label="O&M Cost"
                            name="MO_I"
                            value={myData.MO_I}
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
            </Container>
        </Box>
    )
}

export default ComponentInfoInverter
