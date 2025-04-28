import React, { useState } from 'react';
import { TextField, Button, Box, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

function OptimizationParams() {
    // State for each input field with default values
    const [maxIterations, setMaxIterations] = useState(200);
    const [populationSize, setPopulationSize] = useState(50);
    const [inertiaWeight, setInertiaWeight] = useState(1);
    const [inertiaWeightDamping, setInertiaWeightDamping] = useState(0.99);
    const [personalLearningCoeff, setPersonalLearningCoeff] = useState(2);
    const [globalLearningCoeff, setGlobalLearningCoeff] = useState(2);
    let [loading, setLoading] = React.useState(false)

    const navigate = useNavigate();

    // const handleNext = () => {
    //     // then navigate to optim
    //     navigate('/summary'); 
    //   };

      const handlePrev = () => {
        // then navigate to optim
        window.scrollTo(0, 0);
        navigate('/grid'); 
      };

      const sendOptimizationParams = async () => {
        setLoading(true)
        const optimizationData = {
            maxIterations,
            populationSize,
            inertiaWeight,
            inertiaWeightDamping,
            personalLearningCoeff,
            globalLearningCoeff
        };
    
        try {
            const response = await fetch("http://127.0.0.1:5000/process/optim", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(optimizationData),
            });
    
            const result = await response.json();
            console.log("Response from server:", result);
    
            // Navigate to summary after successful submission

        } catch (error) {
            console.error("Error sending optimization parameters:", error);
        }

        try {
            const response = await fetch("http://127.0.0.1:5000/submit/advanced", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                mode: 'cors',
            });
      
            const result = await response.json();
            console.log("Response from server:", result);
            window.scrollTo(0, 0);
            navigate('/summary');
            setLoading(false);
            // Navigate to summary after successful submission
  
          } catch (error) {
               console.error("Error submitting info:", error);
          }
    };
    

    return (
        <div style={{ marginLeft: "220px", padding: "20px" }}>
            <Box
                sx={{
                    maxWidth: 300,
                    padding: 4,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Typography variant="h4" gutterBottom sx={{ mb: '2 !important', width: '400px !important', maxWidth: '400px !important' }}>
                    Optimization Parameters
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, width: '900px !important', maxWidth: '900px !important' }}>
                    <i>
                        Default values are provided for some questions, but please review and adjust as necessary for more accurate
                        results.
                    </i>
                </Typography>


                <Typography variant="body1" sx={{ mb: 2 }}>
                    Enter Maximum Number of Iterations
                </Typography>
                <TextField
                    label="Max # of Iterations"
                    type="number"
                    value={maxIterations}
                    onChange={(e) => setMaxIterations(e.target.value)}
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 3 }}
                />

                <Typography variant="body1" sx={{ mb: 2 }}>
                    Enter Population Size (Swarm Size)
                </Typography>
                <TextField
                    label="Population"
                    type="number"
                    value={populationSize}
                    onChange={(e) => setPopulationSize(e.target.value)}
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 3 }}
                />

                <Typography variant="body1" sx={{ mb: 2 }}>
                    Enter Inertia Weight
                </Typography>
                <TextField
                    label="Inertia Weight"
                    type="number"
                    value={inertiaWeight}
                    onChange={(e) => setInertiaWeight(e.target.value)}
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 3 }}
                />

                <Typography variant="body1" sx={{ mb: 2 }}>
                    Enter Inertia Weight Damping Ratio
                </Typography>
                <TextField
                    label="Inertia Weight Damping Ratio"
                    type="number"
                    value={inertiaWeightDamping}
                    onChange={(e) => setInertiaWeightDamping(e.target.value)}
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 3 }}
                />

                <Typography variant="body1" sx={{ mb: 2 }}>
                    Enter Personal Learning Coefficient
                </Typography>
                <TextField
                    label="Personal Learning Coefficient"
                    type="number"
                    value={personalLearningCoeff}
                    onChange={(e) => setPersonalLearningCoeff(e.target.value)}
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 3 }}
                />

                <Typography variant="body1" sx={{ mb: 2 }}>
                    Enter Global Learning Coefficient
                </Typography>
                <TextField
                    label="Global Learning Coefficient"
                    type="number"
                    value={globalLearningCoeff}
                    onChange={(e) => setGlobalLearningCoeff(e.target.value)}
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 3 }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    {/* <Button
                        variant="contained"
                        sx={{
                            minWidth: 100,
                            backgroundColor: '#5A3472', 
                            '&:hover': { backgroundColor: '#4A2D61' }, 
                            color: 'white',
                        }}
                        onClick={handlePrev}
                    >
                        Previous
                    </Button> */}
                    <Button
                        variant="contained"
                        sx={{
                            minWidth: 100,
                            backgroundColor: '#5A3472', 
                            '&:hover': { backgroundColor: '#4A2D61' }, 
                            color: 'white',
                        }}
                        // onClick={handleNext}
                        onClick={sendOptimizationParams}
                        loading={loading}
                        >
                                {loading ? <CircularProgress color="white"/> : "Submit"}
                    </Button>
                </Box>
            </Box>
        </div>
    );
}

export default OptimizationParams;