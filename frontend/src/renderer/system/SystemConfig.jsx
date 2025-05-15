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
    ListItemButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PVIcon from '@assets/PV.svg';
import DGIcon from '@assets/DG.svg';
import WTIcon from '@assets/WT.svg';
import BattIcon from '@assets/Batt.svg';
import FormInputField from '@components/form/FormInputField';

function SystemConfig(){

    const navigate = useNavigate();
    const [defaults, setDefaults] = useState(null);
    const [errors, setErrors] = useState({});

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
                const response = await fetch('http://127.0.0.1:5000/api/defaults');
                if (!response.ok) throw new Error('Failed to fetch defaults');
                const data = await response.json();
                setDefaults(data);
                setFormData({
                    lifetime: data.lifetime.toString(),
                    maxPL: data.maxPL.toString(),
                    minRenewEC: data.minRenewEC.toString(),
                    annualData: data.annualData.toString()
                });
            } catch (error) {
                console.error('Error fetching defaults:', error);
            }
        };
        fetchDefaults();
    }, []);

    const validateField = (name, value) => {
        const numValue = parseFloat(value);
        if (!value || value.trim() === '') {
            return 'This field is required';
        }
        if (isNaN(numValue)) {
            return 'Must be a valid number';
        }
        if (numValue < 0) {
            return 'Value cannot be negative';
        }
        return '';
    };

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
        // Clear error when user starts typing
        setErrors(prev => ({
            ...prev,
            [name]: ''
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
            const response = await fetch("http://127.0.0.1:5000/upload_csv", {
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





    const validateForm = () => {
        const newErrors = {};
        
        // Validate required fields
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) {
                newErrors[key] = error;
            }
        });

        // Validate data type selection
        if (!hasHourly && !hasMonthly && !hasAnnual) {
            newErrors.dataType = 'Please select at least one data type (Hourly, Monthly, or Annual)';
        }

        // Validate monthly data if selected
        if (hasMonthly) {
            const hasInvalidMonthlyData = monthlyData.some((value, index) => {
                if (!value || value.trim() === '') {
                    newErrors[`month${index}`] = 'Required';
                    return true;
                }
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue < 0) {
                    newErrors[`month${index}`] = 'Must be a valid positive number';
                    return true;
                }
                return false;
            });
        }

        // Validate system selection
        if (!selectedSystems.PV && !selectedSystems.WT && !selectedSystems.DG && !selectedSystems.Battery) {
            newErrors.systems = 'Please select at least one energy system';
        }

        // Validate battery configuration
        if (selectedSystems.Battery && !selectedSystems.PV && !selectedSystems.WT && !selectedSystems.DG) {
            newErrors.battery = 'Please select at least one other energy generation system';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if(!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            // Get the session_id from localStorage
            const session_id = localStorage.getItem('session_id');
            if (!session_id) {
                throw new Error("No session ID found. Please start from the Geography and Economy page.");
            }

            // Prepare data with session_id
            const systemInfo = {
                session_id: session_id,
                lifetime: parseFloat(formData.lifetime),
                maxPL: parseFloat(formData.maxPL),
                minRenewEC: parseFloat(formData.minRenewEC),
                hasHourly,
                csvProvided: hasHourly && csvFile !== null,
                hasMonthly,
                monthlyData: hasMonthly ? monthlyData : null,
                hasAnnual,
                annualData: hasAnnual ? formData.annualData : null,
                selectedSystems,
                batteryType,
            };

            const response = await fetch("http://127.0.0.1:5000/systemConfig", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(systemInfo),
            });

            if (!response.ok) {
                throw new Error("Failed to save system configuration");
            }

            if (hasHourly && csvFile) {
                await sendCSVFile();
            }

            window.scrollTo(0, 0);
            if (selectedSystems.Battery) {
                navigate('/bat');
            } else if (selectedSystems.PV || selectedSystems.WT || selectedSystems.DG) {
                navigate('/inverter');
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage("Failed to save system configuration. Please try again.");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3, ml: '250px' }}>
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
                            error={errors.lifetime}
                            helperText={errors.lifetime}
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
                            error={errors.maxPL}
                            helperText={errors.maxPL}
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
                            error={errors.minRenewEC}
                            helperText={errors.minRenewEC}
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
                                            error={monthlyData[index] === ''}
                                            helperText={monthlyData[index] === '' ? 'Required' : ''}
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
        </Box>
    );
};

export default SystemConfig