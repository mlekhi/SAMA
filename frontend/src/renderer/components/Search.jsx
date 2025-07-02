import {React, useState, useEffect} from 'react';
import {Typography, TextField, Button, Select, Grid, MenuItem, CircularProgress} from "@mui/material";
import PlaceIcon from '@mui/icons-material/Place';

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search?"
const params = {
  q: '',
  format: 'json',
  addressdetails: 'addressdetails',
}

function Search(props){
  const {selectPosition, setSelectPosition} = props;
    const [searchInput, setSearchInput] = useState("");
    const [listPlace, setListPlace] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      console.log(selectPosition )
    }, [selectPosition])
    // style
    // add box sizing
    const performSearch = () => {
      setIsLoading(true);
      const params = {
        q: searchInput,
        format: 'json',
        addressdetails: 1,
        polygon_geojson: 0,
      }
      const queryString = new URLSearchParams(params).toString();
      const requestOptions = {
        method: "GET",
        redirect: "follow",
      };
      fetch( `${NOMINATIM_BASE_URL}${queryString}`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          setListPlace(JSON.parse(result));
          setSelectPosition("");
          setIsLoading(false);
        })
        .catch((err) => {console.log("error: " + err); setIsLoading(false)});
    }

    return(
        <>
        <Grid container direction="column" spacing={2}>
          <Grid item>
 <Typography> Enter your address:</Typography>
          </Grid>
          <Grid item>
          <TextField   
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}      
          name="address"
          required
          label={"Address"}
          variant="outlined"
          fullWidth
          >
          </TextField>
          </Grid>
          <Grid item>
          <Button 
            variant='contained' 
            onClick={performSearch}   
            color="secondary"       
          >Search Location
          {isLoading && <CircularProgress size="1rem" color="inherit" sx={{ml: 1}}/>}
          </Button>
          </Grid>
          {listPlace.length > 0 && (
            <Grid item>
          <Select 
            value={selectPosition ? selectPosition.display_name : ""} 
            sx={{width: "500px"}} 
            placeholder='Please select a location' 
            displayEmpty
            onChange={(e) => {
              const selectedItem = listPlace.find(item => item.display_name === e.target.value);
              setSelectPosition(selectedItem);
            }}
          >
          <MenuItem disabled value="">
            <em>Please select a location listed below:</em>
          </MenuItem>
          {listPlace.map((item) => {
             return(
                <MenuItem key={item?.place_id} value={item.display_name}> 
                    <PlaceIcon />
                  {item?.display_name}
              </MenuItem>
             );   
            })}
          </Select>  
          </Grid>          
          )}
        </Grid>
        </>
    );
}

export default Search;