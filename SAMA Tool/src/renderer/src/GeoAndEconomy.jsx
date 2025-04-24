import React, { useState, useEffect } from "react";
import {TextField, Button, InputAdornment, FormControl, Box, Grid2, Typography, CircularProgress, Alert} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Search from "./components/Search";
import Map from "./components/Map";


function GeoAndEconomy() {

/**
 * @typedef {Object} GeoAndEconmyInfo
 * @property {string} nomDiscRate - Nominal Discount Rate
 * @property {string} expInfRate - Expected Inflation Rate
 * @property {string} equipSalePercent - Equipment Sale Percentage
 * @property {string} invTaxCredit - Investment Tax Credit Percentage
 */

/** @type {GeoAndEconmyInfo} */
const defaultGeoAndEcon = { nomDiscRate: '5.50', expInfRate: '2.00', equipSalePercent: '0.00',  invTaxCredit: '0.00'};

 /** @type {[GeoAndEconmyInfo, React.Dispatch<React.SetStateAction<GeoAndEconmyInfo>>]} */
  const [myData, setMyData] = useState(defaultGeoAndEcon);
  const [selectPosition, setSelectPosition] = useState({lon: -81.27534792946753, lat: 43.0043086});   // what should be the default??
  const navigate = useNavigate();
  let [loading, setLoading] = React.useState(false)

  
  const sendGeoInfo = async () => {
    try {
        const response = await fetch("http://127.0.0.1:5000/process/geo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            mode: 'cors',
            body: JSON.stringify(myData),
        });

        const result = await response.json();
        console.log("Response from server:", result);
    } catch (error) {
        console.error("Error sending grid info:", error);
    }
};

  const handleNext = async(e) => {
    e.preventDefault();
   
    if(selectPosition && selectPosition.address.country_code !== null){
      setLoading(true)
          //get holidays
          sendGeoInfo();
          console.log(selectPosition.address.country)
          const response = await fetch(`http://127.0.0.1:5000/fetch-holidays?country=${selectPosition.address.country_code}`, {
            mode: 'cors',
        });

        const result = await response.json();    
          
      
      fetch(`http://127.0.0.1:5000/mapAPI?lat=${selectPosition.lat}&long=${selectPosition.lon}`) // Use full URL
      .then(res => {
        if (!res.ok) {
          setLoading(false);
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        window.scrollTo(0, 0);
        navigate('/system'); 
        setLoading(false);
        return res.json();
      })
      .then(data => {
        // then navigate to System Configuration
        navigate('/system'); 
      })
      .catch(err => console.error("Error fetching map api data:", err));      
    }else{
      // display error message
      alert("Error: Select a valid address");
    }    
  };



  function handleChange(e) {
    let {value, name} = e.target;
    switch (name) {
      case "nomDiscRate":
        setMyData(myData => ({...myData, nomDiscRate: value}));
        break;
        
      case "expInfRate":
        setMyData(myData => ({...myData, expInfRate: value}));
        break;
        
      case "equipSalePercent":
        setMyData(myData => ({...myData, equipSalePercent: value}));
        break;
        
      case "invTaxCredit":
        setMyData(myData => ({...myData, invTaxCredit: value}));
        break;
    
      default:
        break;
    }
  }

  return (
    <>
    <Box component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            ml: `250px`, // Offset content by the width of the sidebar
          }}>
    <Grid2 container direction="column" 
      spacing={2}
      alignItems="start" >
        <Grid2 item>
        <Typography variant="h5" component="h2">
            Geography and Economy
        </Typography>
        <Typography variant="body2" color="textSecondary">
          <i>
            Default values are provided for some questions, but please review and adjust as necessary for more accurate results.
          </i>
        </Typography>
        </Grid2>
        <Grid2 item>    

          <Grid2 container sx={{ width: "500px"}} spacing={2}>
          <Grid2 item sx={{ width:"100%"}}>
            <Search selectPosition={selectPosition} setSelectPosition={setSelectPosition}/>
          </Grid2>
          <Grid2 item sx={{ width:"100%", height:"500px"}}>
            <Map selectPosition={selectPosition} />
          </Grid2>
          </Grid2>

    </Grid2>
    <Grid2 item>
      <FormControl>
      <Typography>Enter the nominal discount rate:</Typography>
      <TextField
          value={myData.nomDiscRate}
          name="nomDiscRate"
          onChange={handleChange}
          type="number"
         // onBlur={onBlur}
         // error={!!error}
          // helperText={"error ? error.message : null"}
          required
          label={"Nominal Discount Rate"}
          variant="outlined"
          style={{  margin: '10px'}}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  %
                </InputAdornment>
              ),
            },
          }}
        />
      </FormControl>
        </Grid2>
        <Grid2 item>
        <FormControl>
        <Typography>Enter the expected inflation rate:</Typography>
      <TextField
          value={myData.expInfRate}
          name="expInfRate"
          onChange={handleChange}
          type="number"
         // onBlur={onBlur}
         // error={!!error}
          // helperText={"error ? error.message : null"}
          required
          label={"Expected Inflation Rate"}
          variant="outlined"
          style={{ margin: '10px'}}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  %
                </InputAdornment>
              ),
            },
          }}
        />
      </FormControl>
        </Grid2>
        <Grid2 item>
        <FormControl>
      <Typography>Enter the equipment sale tax percentage:</Typography>
      <TextField
          value={myData.equipSalePercent}
          name="equipSalePercent"
          onChange={handleChange}
          type="number"
         // onBlur={onBlur}
         // error={!!error}
          // helperText={"error ? error.message : null"}
          required
          label={"Equipment Tax"}
          variant="outlined"
          style={{ margin: '10px'}}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  %
                </InputAdornment>
              ),
            },
          }}
        />
      </FormControl> 
        </Grid2>
        <Grid2 item>
           <FormControl>
           <Typography>Enter the investment tax credit (ITC) percentage:</Typography>
      <TextField
          value={myData.invTaxCredit}
          name="invTaxCredit"
          onChange={handleChange}
          type="number"
         // onBlur={onBlur}
         // error={!!error}
          // helperText={"error ? error.message : null"}
          required
          label={"ITC"}
          variant="outlined"
          style={{ margin: '10px'}}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  %
                </InputAdornment>
              ),
            },
          }}
        />
      </FormControl>
        </Grid2>
        <Grid2>
        {
          selectPosition.address ? null: 
          <Alert severity="warning" sx={{mb: 2}}>
          Select a valid address.
        </Alert> 
      }
      <Grid2>

      </Grid2>
        <Button 
        variant="contained" 
        color="secondary" 
        onClick={handleNext}
        loading={loading}
      >
        {loading ? <CircularProgress color="white"/> : "Next"}
      </Button>
        </Grid2>
    </Grid2>
      </Box>
    </>
  )
}

export default GeoAndEconomy