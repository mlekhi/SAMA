import React,{useState, useEffect} from 'react';
import axios from 'axios';
import {
    Button, 
    CircularProgress,
    Checkbox, 
    FormGroup,
    FormControlLabel, 
    FormControl, 
    Typography, 
    Box, 
    Input,
    Snackbar,
    IconButton,
    InputLabel,
    Select,
    MenuItem,
    List,
    ListItem,
    ListItemButton,
    Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PVIcon from '@assets/PV.svg';
import DGIcon from '@assets/DG.svg';
import WTIcon from '@assets/WT.svg';
import BattIcon from '@assets/Batt.svg';
import FormInputField from '@components/form/FormInputField';
import { API_URL } from "@utils/config";
import Navigation from '@components/Navigation';

function SystemConfig(){

    const navigate = useNavigate();
    const [defaults, setDefaults] = useState(null);

    // Default values from backend
    const [formData, setFormData] = useState({
        lifetime: '',
        maxPL: '',
        minRenewEC: '',
        annualData: ''
    });

    const [isUsingDefaults, setIsUsingDefaults] = useState({
        lifetime: true,
        maxPL: true,
        minRenewEC: true,
        annualData: true
    });

    const [hasHourly, setHasHourly] = useState(null);
    const [hasMonthly, setHasMonthly] = useState(null);
    const [hasAnnual, setHasAnnual] = useState(null);
    const [monthlyData, setMonthlyData] = useState(Array(12).fill(""));
    const [csvFile, setCsvFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const [selectedSystems, setSelectedSystems] = useState({
        PV: false,
        WT: false,
        DG: false,
        Battery: false,
    });
    const [batteryType, setBatteryType] = useState("Li-Ion");

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
                
                // Set form data with backend defaults from system_config section
                const systemConfigData = data.system_config || {};
                console.log("System config data:", systemConfigData);
                
                setFormData({
                    lifetime: systemConfigData.lifetime?.toString() || '',
                    maxPL: systemConfigData.maxPL?.toString() || '',
                    minRenewEC: systemConfigData.minRenewEC?.toString() || '',
                    annualData: systemConfigData.annualData?.toString() || ''
                });

                // Set selected systems based on backend data
                setSelectedSystems({
                    PV: systemConfigData.PV || false,
                    WT: systemConfigData.WT || false,
                    DG: systemConfigData.DG || false,
                    Battery: systemConfigData.Bat || false
                });

                // Set battery type if battery is selected
                if (systemConfigData.Bat) {
                    setBatteryType(systemConfigData.Li_ion ? 'Li-Ion' : 'Lead-Acid');
                }

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setIsUsingDefaults(prev => ({
            ...prev,
            [name]: false
        }));
    };

    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                const rows = content.split("\n").map(row => row.trim()).filter(row => row !== ""); // Remove empty lines
                
                //Validation: Check if file has exactly 8760 rows
                if (rows.length !== 8760) {
                    setErrorMessage("Invalid file: Must contain exactly 8760 rows (one per hour of the year).");
                    setSnackbarOpen(true);
                    setCsvFile(null);
                    return;
                }
                
                //Validation: Ensure all values are numeric
                const isValid = rows.every(row => !isNaN(row));
                if (!isValid) {
                    setErrorMessage("Invalid file: Each row must contain a single numeric value.");
                    setSnackbarOpen(true);
                    setCsvFile(null);
                    return;
                }
                
                //If Valid, Store the File
                setCsvFile(file);
                setErrorMessage("File is valid and ready for upload.");
                setSnackbarOpen(true);
            };
            reader.readAsText(file);
        }
    };
    
    //Separate function to send CSV File
    const sendCSVFile = async () => {
        if (!csvFile) {
            return; // skip the upload if hourly isnt picked
        }
        const formData = new FormData();
        formData.append("file", csvFile, "Eload.csv"); // Rename file before sending
        console.log("Uploading CSV File...");
        try {
            const response = await fetch(`${API_URL}/upload_csv`, {
                method: "POST",
                body: formData,
            });
            const result = await response.json();
            console.log("CSV Upload Response:", result);
            if (!response.ok) {
                console.error("Error from server:", result);
                setErrorMessage(`Error: ${result.error || "Something went wrong with CSV upload"}`);
                setSnackbarOpen(true);
            }
        } catch (error) {
            console.error("CSV Upload failed:", error);
            setErrorMessage("CSV Upload failed. Check your internet or backend server.");
            setSnackbarOpen(true);
        }
    };
    


    

    const handleCheckboxChange = (system) => {
        setSelectedSystems((prev) => {
            const updatedSystems = { ...prev, [system]: !prev[system] };
            return updatedSystems;
        });
    };

    const handleNext = async () => {
        setLoading(true);
        try {
            // Get the session_id from localStorage
            const session_id = localStorage.getItem('session_id');
            if (!session_id) {
                throw new Error("No session ID found.");
            }

            // Prepare data with session_id
            const systemInfo = {
                session_id: session_id,
                LPSP_max_rate: parseFloat(formData.maxPL),
                RE_min_rate: parseFloat(formData.minRenewEC),
                PV: selectedSystems.PV,
                WT: selectedSystems.WT,
                DG: selectedSystems.DG,
                Bat: selectedSystems.Battery,
                Lead_acid: batteryType === 'Lead-Acid',
                Li_ion: batteryType === 'Li-Ion'
            };

            // Save selected systems to localStorage for the wizard
            localStorage.setItem('selectedSystems', JSON.stringify(selectedSystems));

            const response = await fetch(`${API_URL}/api/component/system_config`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(systemInfo),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to save system configuration");
            }

            if (hasHourly && csvFile) {
                await sendCSVFile();
            }

            window.scrollTo(0, 0);
            // Always go to the wizard after system config
            navigate('/components');
        } catch (error) {
            setErrorMessage(error.message || "Failed to save system configuration. Please try again.");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
            <Navigation />
            <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 6 }}>
                <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        System Configuration
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                        <i>
                            Default values are provided for some questions, but please review and adjust as necessary for more accurate results.
                        </i>
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <FormControl>
                            <Typography gutterBottom>Enter the lifetime of system in simulation.</Typography>
                            <FormInputField
                                label="Lifetime of System"
                                name="lifetime"
                                value={formData.lifetime}
                                onChange={handleChange}
                                isDefault={isUsingDefaults.lifetime}
                                endAdornment="years"
                            />
                        </FormControl>

                        <FormControl>
                            <Typography gutterBottom>Enter the maximum loss of power supply probability percentage</Typography>
                            <FormInputField
                                label="Max Loss of Power %"
                                name="maxPL"
                                value={formData.maxPL}
                                onChange={handleChange}
                                isDefault={isUsingDefaults.maxPL}
                                endAdornment="%"
                            />
                        </FormControl>

                        <FormControl>
                            <Typography gutterBottom>Enter the minimal renewable energy capacity percentage</Typography>
                            <FormInputField
                                label="Min Renewable Energy %"
                                name="minRenewEC"
                                value={formData.minRenewEC}
                                onChange={handleChange}
                                isDefault={isUsingDefaults.minRenewEC}
                                endAdornment="%"
                            />
                        </FormControl>

                        <Typography gutterBottom>
                            Next we will ask for information about the electrical load.
                        </Typography>

                        <Box>
                            <Typography marginTop={2}>
                                Do you have hourly consumption data?
                            </Typography>
                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={hasHourly === true}
                                            onChange={() => {
                                                setHasHourly(true)
                                                setHasMonthly(false);
                                                setMonthlyData(Array(12).fill(""));
                                                setHasAnnual(false);
                                            }}
                                        />
                                    }
                                    label="Yes"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={hasHourly === false}
                                            onChange={() => setHasHourly(false)}
                                        />
                                    }
                                    label="No"
                                />
                            </FormGroup>

                            {hasHourly === true && (
                                <Box marginTop={3}>
                                    <Typography>Upload your CSV file:</Typography>
                                    <input type="file" accept=".csv" onChange={handleFileImport} />
                                </Box>
                            )}

                            {hasHourly === false && (
                                <Box marginTop={3}>
                                    <Typography>Do you have monthly power consumption data?</Typography>
                                    <FormGroup>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={hasMonthly === true}
                                                    onChange={() => setHasMonthly(true)}
                                                />
                                            }
                                            label="Yes"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={hasMonthly === false}
                                                    onChange={() => {
                                                        setHasMonthly(false);
                                                        setMonthlyData(Array(12).fill(""));
                                                    }}
                                                />
                                            }
                                            label="No"
                                        />
                                    </FormGroup>
                                </Box>
                            )}

                            {hasMonthly === true && (
                                <Box marginTop={3}>
                                    <Typography>Enter your monthly power consumption data:</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                                            <FormInputField
                                                key={index}
                                                label={month}
                                                name={`month${index}`}
                                                value={monthlyData[index]}
                                                onChange={(e) => {
                                                    const newMonthlyData = [...monthlyData];
                                                    const inputValue = e.target.value;
                                                    if (inputValue === '' || /^[0-9]*\.?[0-9]*$/.test(inputValue)) {
                                                        newMonthlyData[index] = inputValue;
                                                        setMonthlyData(newMonthlyData);
                                                    }
                                                }}
                                                endAdornment="kWh"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {hasHourly === false && hasMonthly === false && (
                                <Box marginTop={3}>
                                    <Typography>Do you have annual power consumption data?</Typography>
                                    <FormGroup>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={hasAnnual === true}
                                                    onChange={() => setHasAnnual(true)}
                                                />
                                            }
                                            label="Yes"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={hasAnnual === false}
                                                    onChange={() => setHasAnnual(false)}
                                                />
                                            }
                                            label="No"
                                        />
                                    </FormGroup>
                                </Box>
                            )}

                            {hasAnnual === true && hasMonthly === false && hasHourly === false && (
                                <Box marginTop={3}>
                                    <Typography>Enter your annual power consumption:</Typography>
                                    <FormInputField
                                        label="Annual Power Consumption"
                                        name="annualData"
                                        value={formData.annualData}
                                        onChange={(e) => setFormData(prev => ({ ...prev, annualData: Number(e.target.value) }))}
                                        endAdornment="kWh"
                                    />
                                </Box>
                            )}

                            {hasAnnual === false && hasMonthly === false && hasHourly === false && (
                                <Box marginTop={3}>
                                    <Typography>Default value for annual power consumption:</Typography>
                                    <FormInputField
                                        label="Annual Power Consumption"
                                        value={9}
                                        disabled
                                        endAdornment="kWh"
                                    />
                                </Box>
                            )}
                        </Box>

                        {/* Energy Systems Section */}
                        <Box marginTop={4}>
                            <Typography mb={3}>
                                Next we will ask for information about the Energy System you want in the simulations.
                            </Typography>
                            
                            <Typography gutterBottom variant="h6">
                                Energy Systems
                            </Typography>
                            <Typography>Select the energy systems you wish to use:</Typography>
                        
                            <List sx={{ display: "flex", gap: 4, flexWrap: "wrap", padding: 0 }}>
                                {/* PV System */}
                                <ListItem
                                    disablePadding
                                    sx={{
                                        flexDirection: "column",
                                        alignItems: "center",
                                        width: "120px",
                                    }}
                                >
                                    <ListItemButton
                                        onClick={() => handleCheckboxChange("PV")}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            width: 100,
                                            height: 100,
                                            border: "5px solid",
                                            borderColor: selectedSystems.PV ? 'secondary.main' : "grey.400",
                                            borderRadius: 4,
                                            padding: 0,
                                        }}
                                    >
                                        <IconButton>
                                            <img  src={PVIcon}></img>
                                        </IconButton>
                                    </ListItemButton>
                                    <Typography variant="body1" marginTop={1}>
                                        Photo-voltaic
                                    </Typography>
                                </ListItem>

                                {/* WT System */}
                                <ListItem
                                    disablePadding
                                    sx={{
                                        flexDirection: "column",
                                        alignItems: "center",
                                        width: "120px",
                                    }}
                                >
                                    <ListItemButton
                                        onClick={() => handleCheckboxChange("WT")} //call to update state
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            width: 100,
                                            height: 100,
                                            border: "5px solid",
                                            borderColor: selectedSystems.WT ? 'secondary.main' : "grey.400",
                                            borderRadius: 4,
                                            padding: 0,
                                        }}
                                    >
                                        <IconButton>
                                            <img  src={WTIcon}></img>
                                        </IconButton>
                                    </ListItemButton>
                                    <Typography variant="body1" marginTop={1}>
                                        Wind Turbine
                                    </Typography>
                                </ListItem>

                                {/* DG System */}
                                <ListItem
                                    disablePadding
                                    sx={{
                                        flexDirection: "column",
                                        alignItems: "center",
                                        width: "120px",
                                    }}
                                >
                                    <ListItemButton
                                        onClick={() => handleCheckboxChange("DG")}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            width: 100,
                                            height: 100,
                                            border: "5px solid",
                                            borderColor: selectedSystems.DG ? 'secondary.main' : "grey.400",
                                            borderRadius: 4,
                                            padding: 0,
                                        }}
                                    >
                                        <IconButton>
                                            <img  src={DGIcon}></img>
                                        </IconButton>
                                    </ListItemButton>
                                    <Typography variant="body1" marginTop={1}>
                                        Diesel Gen
                                    </Typography>
                                </ListItem>

                                {/* Battery System */}
                                <ListItem
                                    disablePadding
                                    sx={{
                                        flexDirection: "column",
                                        alignItems: "center",
                                        width: "120px",
                                    }}
                                >
                                    <ListItemButton
                                        onClick={() => handleCheckboxChange("Battery")}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            width: 100,
                                            height: 100,
                                            border: "5px solid",
                                            borderColor: selectedSystems.Battery ? 'secondary.main' : "grey.400",
                                            borderRadius: 4,
                                            padding: 0,
                                        }}
                                    >
                                        <IconButton>
                                            <img  src={BattIcon}></img>
                                        </IconButton>
                                    </ListItemButton>
                                    <Typography variant="body1" marginTop={1}>
                                        Battery
                                    </Typography>
                                </ListItem>
                            </List>
                            
                            {selectedSystems.Battery && (
                                <Box marginTop={2} marginBottom={6}>
                                    <FormControl fullWidth>
                                        <InputLabel id="battery-type-label">Battery Type</InputLabel>
                                        <Select
                                            labelId="battery-type-label"
                                            value={batteryType}
                                            onChange={(e) => setBatteryType(e.target.value)}
                                        >
                                            <MenuItem value="Lead-Acid">Lead-Acid</MenuItem>
                                            <MenuItem value="Li-Ion">Li-Ion</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            )}

                            {selectedSystems.Battery && !selectedSystems.PV && !selectedSystems.WT && !selectedSystems.DG && (
                                <Typography color="error" variant="body2" sx={{ marginTop: 2 }}>
                                    Warning: Please select at least one other energy generation system.
                                </Typography>
                            )}
                        </Box>

                        <Snackbar
                            open={snackbarOpen}
                            autoHideDuration={6000}
                            onClose={() => setSnackbarOpen(false)}
                            message={errorMessage}
                            action={
                                <Button color="secondary" size="small" onClick={() => setSnackbarOpen(false)}>
                                    OK
                                </Button>
                            }
                        />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                        <Button
                            variant="contained"
                            sx={{
                                minWidth: 100,
                                backgroundColor: 'secondary.main',
                                '&:hover': { backgroundColor: 'secondary.dark' },
                                color: 'white',
                            }}
                            onClick={handleNext}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Next"}
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default SystemConfig