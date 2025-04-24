import React,{useState} from 'react';
import axios from 'axios';
import {
    Button, 
    CircularProgress,
    Checkbox, 
    FormGroup,
    FormControlLabel, 
    TextField, 
    InputAdornment, 
    FormControl, 
    Grid2, 
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
import PVIcon from './assets/PV.svg';
import DGIcon from './assets/DG.svg';
import WTIcon from './assets/WT.svg';
import BattIcon from './assets/Batt.svg';







function SystemConfig(){

    const navigate = useNavigate();

    const [lifetime, setLifetime] = useState(25.0);
    const [maxPL, setMaxPL] = useState(0.0999999);
    const [minRenewEC, setMinRenewEC] = useState(75.0);
    
    const [hasHourly, setHasHourly] = useState(null); // null, true, or false
    const [hasMonthly, setHasMonthly] = useState(null); // null, true, or false
    const [hasAnnual, setHasAnnual] = useState(null); // null, true, or false
    const [ monthlyData, setMonthlyData] = useState(Array(12).fill(""));
    const [annualData, setAnnualData] = useState(9);

    
    const [selectedSystems, setSelectedSystems] = useState({
        PV: false,
        WT: false,
        DG: false,
        Battery: false,
        });
    const [batteryType, setBatteryType] = useState("Li-Ion");
    // const [response, setResponse]= useState('');

    const [csvFile, setCsvFile] = useState(null);
    
  let [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  
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
    console.log("Updated selectedSystems:", updatedSystems);  // Log state to check
    return updatedSystems;
  });
};





  const handlePrev = () => {
    navigate('/')
  };

  
  
  const sendSystemConfig= async() =>{
    let finalAnnualData = annualData; // Default to existing value

    // If they don't have annual, monthly, or hourly, set default value 9
    if (!hasAnnual && !hasMonthly && !hasHourly) {
      finalAnnualData = 9;
    } else if (!hasAnnual) {
      // If hasAnnual is false, but other data exists, set to null
      finalAnnualData = null;
    }
  
    // If they don't have monthly data, set monthlyData to null
    let finalMonthlyData = hasMonthly ? monthlyData : null;

    if (!hasHourly && !hasMonthly && !hasAnnual) {
      setErrorMessage("Please select Hourly, Monthly, or Annual data before proceeding.");
      setSnackbarOpen(true);
      return; // Stop the function from continuing
  }
    const SystemInfo= {
      lifetime,
      maxPL,
      minRenewEC,
      hasHourly,
      hasMonthly,
      monthlyData: finalMonthlyData,
      hasAnnual,
      annualData: finalAnnualData,
      selectedSystems,
      batteryType,

    };
    
    console.log("Sending System Config Info:", JSON.stringify(SystemInfo, null,2));

    try {
    // Send data to backend
      const response = await fetch("http://127.0.0.1:5000/systemConfig",{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(SystemInfo),
      });
        
       
    
      const result = await response.json();
      console.log("Response from server:", result);

      
      if (!response.ok) {
        console.error("Error from server:", result);
        alert(`Error: ${result.error || "Something went wrong"}`);
        return;
      }
      if (hasHourly && csvFile) {
        await sendCSVFile();
    }
 
      
    } catch (error) {
      console.error("Request failed:", error);
      alert("Request failed. Check your internet or backend server.");
    }
  };
    
  // Add this handler
const handleSnackbarClose = () => {
  setSnackbarOpen(false);
};


// Modify your handleNext function
const handleNext = () => {
  // Check if at least one data type is selected
  if (!hasHourly && !hasMonthly && !hasAnnual) {
    setErrorMessage("Please select Hourly, Monthly, or Annual data before proceeding.");
    setSnackbarOpen(true);
    return; // Stops execution and prevents navigation
  }
  
  // Validate monthly data if hasMonthly is true
  if (hasMonthly) {
    // Check if any monthly data is missing or invalid
    const hasInvalidMonthlyData = monthlyData.some(value => {
      const numValue = parseFloat(value);
      return value === '' || isNaN(numValue);
    });
    
    if (hasInvalidMonthlyData) {
      setErrorMessage("Please enter valid numerical values for all 12 months.");
      setSnackbarOpen(true);
      return; // Stops execution and prevents navigation
    }
  }
  // Check if at least one energy system is selected
  if (!selectedSystems.PV && !selectedSystems.WT && !selectedSystems.DG && !selectedSystems.Battery) {
    setErrorMessage("Please select at least one energy system before proceeding.");
    setSnackbarOpen(true);
    return; // Stops execution and prevents navigation
}
  // If we get here, all validations have passed
  sendSystemConfig();
  setLoading(true);
  
  //Navigate based on the selected system
  if(selectedSystems.Battery){
    window.scrollTo(0, 0);
    navigate('/bat');
  }
  else if (selectedSystems.PV || selectedSystems.WT || selectedSystems.DG) {
    window.scrollTo(0, 0);
    navigate('/inverter')
  }
 
  else {
    console.warn("No energy system selected!");
  }
};
    return(
        <>
      
            <Box component = "main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    ml: `250px`, // Offset content by the width of the sidebar
                }}>
            
            
            <Grid2 container direction = "column"
                spacing = {2}
                alignItems = "start">
                <Grid2 item>
                <Typography variant="h5" component = "h2">
                    System Configuration 
                </Typography>
                
                <Typography variant = "body2" color = "textSecondary">
                    <i>
                        Default values are provided for some questions, but please review
                    </i>
                </Typography>
                </Grid2>
                    <Grid2 item>
                    
                    <FormControl>
                        <Typography gutterBottom>Enter the lifetime of system in simulation. </Typography>
                      <TextField 
                        label = "Lifetime of System in Simulation"
                        type = "number"
                        value = {lifetime}
                        onChange={(e) => setLifetime(parseFloat(e.target.value) || 0)}
                        fullWidth
                        variant = "outlined"
                        sx={{mt:2, mb:3}}
                        slotProps={{
                            input: {
                              endAdornment: (
                                <InputAdornment position="end">
                                  years
                                </InputAdornment>
                              ),
                            },
                          }}
                        >
                        </TextField>

                    </FormControl>
                </Grid2>
                    <Grid2 item>
                    <FormControl>
                        <Typography gutterBottom>Enter the maximum loss of power supply probability percentage</Typography>
                    <TextField
                    label = "Max loss of power %"
                    type = "number"
                    value = {maxPL}
                    onChange ={(e) => setMaxPL(Number(e.target.value))}
                    fullwidthvariant = "outlined"
                    sx = {{mt:2, mb:3}}
                    slotProps = {{
                        input: {
                            endAdornment: (
                                <InputAdornment position = "end">
                                    %
                                </InputAdornment>
                            ),
                        },
                    }}
                    >
                    </TextField>
                    </FormControl>
                </Grid2>
                    <Grid2 item>
                    <FormControl>
                        <Typography gutterBottom>Enter the minimal renewable energy capacity percentage</Typography>
                    <TextField
                    label = "Min renewable energy capacity %"
                    type = "number"
                    value = {minRenewEC}
                    onChange ={(e) => setMinRenewEC(parseFloat(e.target.value) || 0)}
                    fullwidthvariant = "outlined"
                    sx = {{mt:2, mb:3}}
                    slotProps = {{
                        input: {
                            endAdornment: (
                                <InputAdornment position = "end">
                                    %
                                </InputAdornment>
                            ),
                        },
                    }}
                    >
                    </TextField>
                    </FormControl>
                </Grid2>
                <Grid2 item>
                <Typography gutterBottom>
                        Next we will ask for information about the electrical load. 
                    </Typography>
                </Grid2>
                
                                    
                    <Typography  marginTop={2}>
                        Do you have hourly consumption data?
                    </Typography>
                    <FormGroup>
                        <FormControlLabel
                        control={
                            <Checkbox
                            checked={hasHourly === true}
                            onChange={() => {
                                setHasHourly(true)
                                setHasMonthly(false); // Remove Monthly section
                                setMonthlyData(Array(12).fill("")); // Clear Monthly data
                                setHasAnnual(false); // Remove Annual section
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
                            <Typography >Do you have monthly power consumption data?</Typography>
                            <FormGroup>
                            <FormControlLabel
                                control={
                                <Checkbox
                                    checked={hasMonthly === true}
                                    onChange={() => {
                                    setHasMonthly(true);
                                    
                                    }}
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
                                    setMonthlyData(Array(12).fill("")); // Clear monthly data when switching to "No"
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
                            <Box
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)', // 3 columns with equal width
                                gap: 2, // Adds spacing between grid items
                              }}
                               >
                              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                            <TextField
                                key={index}
                                label={month}
                                value={monthlyData[index]}
                                onChange={(e) => {
                                    const newMonthlyData = [...monthlyData];
                                    // Only allow numerical values (including decimals)
                                    const inputValue = e.target.value;
                                    if (inputValue === '' || /^[0-9]*\.?[0-9]*$/.test(inputValue)) {
                                        newMonthlyData[index] = inputValue;
                                        setMonthlyData(newMonthlyData);
                                    }
                                }}
                                fullWidth
                                variant="outlined"
                                margin="normal"
                                required
                                error={monthlyData[index] === ''}
                                helperText={monthlyData[index] === '' ? 'Required' : ''}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            kWh
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        ))}
                            </Box>
                          </Box>
                        )}

                    
                    {hasHourly === false && hasMonthly === false && (
                        <Box marginTop={3}>
                        <Typography >Do you have annual power consumption data?</Typography>
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
                                onChange={() => {
                                    setHasAnnual(false);
                                    
                                    
                                    
                                }
                                }
                                
                                />
                            }
                            label="No"
                            />
                        </FormGroup>
                        </Box>
                    )}

                    {hasAnnual === true && hasMonthly === false && hasHourly === false &&(
                        <Box marginTop={3}>
                        <Typography>Enter your annual power consumption:</Typography>
                        <TextField
                            label="Annual Power Consumption"
                            value={annualData}
                            onChange={(e) => setAnnualData(Number(e.target.value))}
                            fullWidth
                            margin="normal"
                        />

                        </Box>
                    )}
                    {hasAnnual === false && hasMonthly === false && hasHourly === false &&(
                        <Box marginTop={3}>
                        <Typography>Default value for annual power consumption:</Typography>
                        <TextField
                            
                            
                            label="Annual Power Consumption"
                            value={9}
                            disabled
                            fullWidth
                            margin="normal"
                        />
                        </Box>
                    )}
                    
                        <Grid2 item>
                        
                        </Grid2>
                    
                    

               
        {/* Energy Systems Section */}
      <Box marginTop={4}>
        
        <Typography mb= {3}>
                Next we will ask for information about the Energy System you want in the simulations.
        </Typography>
        
        <Typography gutterBottom variant="h6">
          Energy Systems
        </Typography>
        <Typography>Select the energy systems you wish to use:</Typography>
    
        
        <List
    sx={{
      display: "flex",
      gap: 4,
      flexWrap: "wrap",
      padding: 0,
    }}
  >{/* PV System */}
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
          borderColor: selectedSystems.PV ? '#5A3472' : "grey.400",
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
          borderColor: selectedSystems.WT ? '#5A3472' : "grey.400",
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
          borderColor: selectedSystems.DG ? '#5A3472' : "grey.400",
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
          borderColor: selectedSystems.Battery ? '#5A3472' : "grey.400",
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
         {/* Warning Message */}
  {selectedSystems.Battery &&
    !selectedSystems.PV &&
    !selectedSystems.WT &&
    !selectedSystems.DG && (
      <Typography
        color="error"
        variant="body2"
        sx={{ marginTop: 2 }}
      >
        Warning: Please select at least one other energy generation system.
      </Typography>
    )}
    <Snackbar
  open={snackbarOpen}
  autoHideDuration={6000}
  onClose={handleSnackbarClose}
  message={errorMessage}
  action={
    <Button color="secondary" size="small" onClick={handleSnackbarClose}>
      OK
    </Button>
  }
/>
      </Box>
            </Grid2>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    {/* <Button
                        variant="contained"
                        sx={{
                            minWidth: 100,
                            backgroundColor: '#5A3472', // Dark purple color
                            '&:hover': { backgroundColor: '#4A2D61' }, // Slightly darker on hover
                            color: 'white',
                        }}
                        onClick = {handlePrev}
                    >
                        Previous
                    </Button> */}
                    <Button
                    type="submit"
                        variant="contained"
                        sx={{
                            minWidth: 100,
                            backgroundColor: '#5A3472', // Dark purple color
                            '&:hover': { backgroundColor: '#4A2D61' }, // Slightly darker on hover
                            color: 'white',
                        }}
                        onClick = {handleNext}
                        loading={loading}

                    >
                        {loading ? <CircularProgress color="white"/> : "Next"}
                    </Button>
                    
                    
                </Box>
                
            
        </Box>
        
        </>
    );
};

export default SystemConfig