import React,{useState} from 'react';
import axios from 'axios';
import {
    Button, 
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
    IconButton,
    InputLabel,
    Select,
    MenuItem,
    List,
    ListItem,
    ListItemButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function faq(){
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
                    FAQ Section 
                </Typography>
                </Grid2>
                </Grid2>
            </Box>
         </>
)        
                
};
export default faq