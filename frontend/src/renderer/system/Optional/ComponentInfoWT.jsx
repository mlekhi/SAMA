import React, { useState, useEffect } from 'react'
import { Box, Typography, Container } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import FormInputField from '@components/form/FormInputField'
import NextButton from '@components/form/NextButton'
import { API_URL } from "@utils/config"
import Navigation from '@components/Navigation'

function ComponentInfoWT({ onNext }) {
    const navigate = useNavigate()
    const [defaults, setDefaults] = useState(null)
    const [isConfigLoaded, setIsConfigLoaded] = useState(false)
    const [errorDialog, setErrorDialog] = useState({ open: false, title: '', message: '' })

    const [myData, setMyData] = useState({
        h_hub: '',
        h0: '',
        nw: '',
        v_cut_out: '',
        v_cut_in: '',
        v_rated: '',
        alfa_wind_turbine: '',
        L_WT: '',
        C_WT: '',
        R_WT: '',
        MO_WT: ''
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
                
                // Set form data with backend defaults from wind section
                const windData = data.wind || {};
                console.log("Wind data:", windData);
                
                setMyData({
                    h_hub: windData.hub_height?.toString() || '',
                    h0: windData.anemometer_height?.toString() || '',
                    nw: windData.wind_efficiency?.toString() || '',
                    v_cut_out: windData.cut_out_speed?.toString() || '',
                    v_cut_in: windData.cut_in_speed?.toString() || '',
                    v_rated: windData.rated_speed?.toString() || '',
                    alfa_wind_turbine: windData.alfa_wind_turbine?.toString() || '',
                    L_WT: windData.wind_lifetime?.toString() || '',
                    C_WT: windData.C_WT?.toString() || '',
                    R_WT: windData.R_WT?.toString() || '',
                    MO_WT: windData.MO_WT?.toString() || ''
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
            const response = await fetch(`${API_URL}/api/component/wind_turbine`, {
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
            console.error('Error sending wind turbine info:', error);
            setErrorDialog({
                open: true,
                title: 'Error Saving Data',
                message: error.message || 'Failed to save wind turbine data. Please try again.'
            });
        }
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
            <Navigation />
            <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 6 }}>
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
                            name="h_hub"
                            value={myData.h_hub}
                            onChange={handleChange}
                            endAdornment="m"
                        />

                        <FormInputField
                            label="Anemometer Height"
                            name="h0"
                            value={myData.h0}
                            onChange={handleChange}
                            endAdornment="m"
                        />

                        <FormInputField
                            label="Wind Turbine Efficiency"
                            name="nw"
                            value={myData.nw}
                            onChange={handleChange}
                        />

                        <FormInputField
                            label="Cut-out Speed"
                            name="v_cut_out"
                            value={myData.v_cut_out}
                            onChange={handleChange}
                            endAdornment="m/s"
                        />

                        <FormInputField
                            label="Cut-in Speed"
                            name="v_cut_in"
                            value={myData.v_cut_in}
                            onChange={handleChange}
                            endAdornment="m/s"
                        />

                        <FormInputField
                            label="Rated Speed"
                            name="v_rated"
                            value={myData.v_rated}
                            onChange={handleChange}
                            endAdornment="m/s"
                        />

                        <FormInputField
                            label="Wind Turbine Lifetime"
                            name="L_WT"
                            value={myData.L_WT}
                            onChange={handleChange}
                            endAdornment="years"
                        />

                        <Typography variant="h5" gutterBottom>
                            Economic Information
                        </Typography>

                        <FormInputField
                            label="Capital Cost"
                            name="C_WT"
                            value={myData.C_WT}
                            onChange={handleChange}
                            endAdornment="$/kW"
                        />

                        <FormInputField
                            label="Replacement Cost"
                            name="R_WT"
                            value={myData.R_WT}
                            onChange={handleChange}
                            endAdornment="$/kW"
                        />

                        <FormInputField
                            label="O&M Cost"
                            name="MO_WT"
                            value={myData.MO_WT}
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

export default ComponentInfoWT 