import React, { useState, useEffect } from 'react'
import { Box, Typography, Container } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import FormInputField from '@components/form/FormInputField'
import NextButton from '@components/form/NextButton'
import { API_URL } from "@utils/config"
import Navigation from '@components/Navigation'

function ComponentInfoPV({ onNext }) {
    const navigate = useNavigate()
    const [defaults, setDefaults] = useState(null)
    const [isConfigLoaded, setIsConfigLoaded] = useState(false)
    const [errorDialog, setErrorDialog] = useState({ open: false, title: '', message: '' })

    const [myData, setMyData] = useState({
        pv_lifetime: '',
        pv_derating: '',
        temp_coef: '',
        temp_ref: '',
        temp_noct: '',
        pv_efficiency: '',
        C_PV: '',
        R_PV: '',
        MO_PV: '',
        Ta_noct: '',
        G_noct: '',
        gama: '',
        Gref: ''
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
                
                // Set form data with backend defaults from pv section
                const pvData = data.pv || {};
                console.log("PV data:", pvData);
                
                setMyData({
                    pv_lifetime: pvData.pv_lifetime?.toString() || '',
                    pv_derating: pvData.pv_derating?.toString() || '',
                    temp_coef: pvData.temp_coef?.toString() || '',
                    temp_ref: pvData.temp_ref?.toString() || '',
                    temp_noct: pvData.temp_noct?.toString() || '',
                    pv_efficiency: pvData.pv_efficiency?.toString() || '',
                    C_PV: pvData.C_PV?.toString() || '',
                    R_PV: pvData.R_PV?.toString() || '',
                    MO_PV: pvData.MO_PV?.toString() || '',
                    Ta_noct: pvData.Ta_noct?.toString() || '',
                    G_noct: pvData.G_noct?.toString() || '',
                    gama: pvData.gama?.toString() || '0.0',
                    Gref: pvData.Gref?.toString() || ''
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
            const response = await fetch(`${API_URL}/api/component/pv_system`, {
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
            console.error('Error sending PV info:', error);
            setErrorDialog({
                open: true,
                title: 'Error Saving Data',
                message: error.message || 'Failed to save PV data. Please try again.'
            });
        }
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
            <Navigation />
            <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 6 }}>
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
                            name="pv_lifetime"
                            value={myData.pv_lifetime}
                            onChange={handleChange}
                            endAdornment="years"
                        />

                        <FormInputField
                            label="PV Derating"
                            name="pv_derating"
                            value={myData.pv_derating}
                            onChange={handleChange}
                        />

                        <FormInputField
                            label="Temperature Coefficient"
                            name="temp_coef"
                            value={myData.temp_coef}
                            onChange={handleChange}
                            endAdornment="%/°C"
                        />

                        <FormInputField
                            label="Reference Temperature"
                            name="temp_ref"
                            value={myData.temp_ref}
                            onChange={handleChange}
                            endAdornment="°C"
                        />

                        <FormInputField
                            label="Nominal Operating Cell Temperature"
                            name="temp_noct"
                            value={myData.temp_noct}
                            onChange={handleChange}
                            endAdornment="°C"
                        />

                        <FormInputField
                            label="PV Efficiency"
                            name="pv_efficiency"
                            value={myData.pv_efficiency}
                            onChange={handleChange}
                        />

                        <Typography variant="h5" gutterBottom>
                            Economic Information
                        </Typography>

                        <FormInputField
                            label="Capital Cost"
                            name="C_PV"
                            value={myData.C_PV}
                            onChange={handleChange}
                            endAdornment="$/kW"
                        />

                        <FormInputField
                            label="Replacement Cost"
                            name="R_PV"
                            value={myData.R_PV}
                            onChange={handleChange}
                            endAdornment="$/kW"
                        />

                        <FormInputField
                            label="O&M Cost"
                            name="MO_PV"
                            value={myData.MO_PV}
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

export default ComponentInfoPV