import React, { useState, useEffect } from 'react'
import { Box, Typography, Container } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import FormInputField from '@components/form/FormInputField'
import NextButton from '@components/form/NextButton'
import { API_URL } from "@utils/config"
import Navigation from '@components/Navigation'

function ComponentInfoBattery({ onNext }) {
    const navigate = useNavigate()
    const [defaults, setDefaults] = useState(null)
    const [isConfigLoaded, setIsConfigLoaded] = useState(false)
    const [errorDialog, setErrorDialog] = useState({ open: false, title: '', message: '' })

    const [myData, setMyData] = useState({
        SOC_min: '',
        SOC_max: '',
        SOC_initial: '',
        self_discharge_rate: '',
        L_B: '',
        Cnom_Leadacid: '',
        alfa_battery_leadacid: '',
        c: '',
        k: '',
        Ich_max_leadacid: '',
        Vnom_leadacid: '',
        ef_bat_leadacid: '',
        Q_lifetime_leadacid: '',
        Ich_max_Li_ion: '',
        Idch_max_Li_ion: '',
        alfa_battery_Li_ion: ''
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
                
                // Set form data with backend defaults from battery section
                const batteryData = data.battery || {};
                console.log("Battery data:", batteryData);
                
                setMyData({
                    SOC_min: batteryData.SOC_min?.toString() || '',
                    SOC_max: batteryData.SOC_max?.toString() || '',
                    SOC_initial: batteryData.SOC_initial?.toString() || '',
                    self_discharge_rate: batteryData.self_discharge_rate?.toString() || '',
                    L_B: batteryData.battery_lifetime?.toString() || '',
                    Cnom_Leadacid: batteryData.Cnom_Leadacid?.toString() || '',
                    alfa_battery_leadacid: batteryData.alfa_battery_leadacid?.toString() || '',
                    c: batteryData.c?.toString() || '',
                    k: batteryData.k?.toString() || '',
                    Ich_max_leadacid: batteryData.Ich_max_leadacid?.toString() || '',
                    Vnom_leadacid: batteryData.Vnom_leadacid?.toString() || '',
                    ef_bat_leadacid: batteryData.ef_bat_leadacid?.toString() || '',
                    Q_lifetime_leadacid: batteryData.Q_lifetime_leadacid?.toString() || '',
                    Ich_max_Li_ion: batteryData.Ich_max_Li_ion?.toString() || '',
                    Idch_max_Li_ion: batteryData.Idch_max_Li_ion?.toString() || '',
                    alfa_battery_Li_ion: batteryData.alfa_battery_Li_ion?.toString() || ''
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
            const response = await fetch(`${API_URL}/api/component/battery`, {
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
            console.error('Error sending battery info:', error);
            setErrorDialog({
                open: true,
                title: 'Error Saving Data',
                message: error.message || 'Failed to save battery data. Please try again.'
            });
        }
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
            <Navigation />
            <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 6 }}>
                <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                    <Typography variant="h4" gutterBottom>
                        Component Information - Battery
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
                            label="Minimum State of Charge"
                            name="SOC_min"
                            value={myData.SOC_min}
                            onChange={handleChange}
                        />

                        <FormInputField
                            label="Maximum State of Charge"
                            name="SOC_max"
                            value={myData.SOC_max}
                            onChange={handleChange}
                        />

                        <FormInputField
                            label="Initial State of Charge"
                            name="SOC_initial"
                            value={myData.SOC_initial}
                            onChange={handleChange}
                        />

                        <FormInputField
                            label="Self Discharge Rate"
                            name="self_discharge_rate"
                            value={myData.self_discharge_rate}
                            onChange={handleChange}
                            endAdornment="%/month"
                        />

                        <FormInputField
                            label="Battery Lifetime"
                            name="L_B"
                            value={myData.L_B}
                            onChange={handleChange}
                            endAdornment="years"
                        />

                        <Typography variant="h5" gutterBottom>
                            Lead Acid Battery Parameters
                        </Typography>

                        <FormInputField
                            label="Nominal Capacity"
                            name="Cnom_Leadacid"
                            value={myData.Cnom_Leadacid}
                            onChange={handleChange}
                            endAdornment="Ah"
                        />

                        <FormInputField
                            label="Battery Aging Factor"
                            name="alfa_battery_leadacid"
                            value={myData.alfa_battery_leadacid}
                            onChange={handleChange}
                        />

                        <FormInputField
                            label="Capacity Ratio"
                            name="c"
                            value={myData.c}
                            onChange={handleChange}
                        />

                        <FormInputField
                            label="Rate Constant"
                            name="k"
                            value={myData.k}
                            onChange={handleChange}
                        />

                        <FormInputField
                            label="Maximum Charge Current"
                            name="Ich_max_leadacid"
                            value={myData.Ich_max_leadacid}
                            onChange={handleChange}
                            endAdornment="A"
                        />

                        <FormInputField
                            label="Nominal Voltage"
                            name="Vnom_leadacid"
                            value={myData.Vnom_leadacid}
                            onChange={handleChange}
                            endAdornment="V"
                        />

                        <FormInputField
                            label="Battery Efficiency"
                            name="ef_bat_leadacid"
                            value={myData.ef_bat_leadacid}
                            onChange={handleChange}
                        />

                        <FormInputField
                            label="Lifetime Throughput"
                            name="Q_lifetime_leadacid"
                            value={myData.Q_lifetime_leadacid}
                            onChange={handleChange}
                            endAdornment="Ah"
                        />

                        <Typography variant="h5" gutterBottom>
                            Li-ion Battery Parameters
                        </Typography>

                        <FormInputField
                            label="Maximum Charge Current"
                            name="Ich_max_Li_ion"
                            value={myData.Ich_max_Li_ion}
                            onChange={handleChange}
                            endAdornment="A"
                        />

                        <FormInputField
                            label="Maximum Discharge Current"
                            name="Idch_max_Li_ion"
                            value={myData.Idch_max_Li_ion}
                            onChange={handleChange}
                            endAdornment="A"
                        />

                        <FormInputField
                            label="Battery Aging Factor"
                            name="alfa_battery_Li_ion"
                            value={myData.alfa_battery_Li_ion}
                            onChange={handleChange}
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

export default ComponentInfoBattery
