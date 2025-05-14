import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

function OptimizationParams() {
    const navigate = useNavigate();
    const [defaults, setDefaults] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Initialize state with empty values
    const [formData, setFormData] = useState({
        maxIterations: '',
        populationSize: '',
        inertiaWeight: '',
        inertiaWeightDamping: '',
        personalLearningCoeff: '',
        globalLearningCoeff: ''
    });

    const [isUsingDefaults, setIsUsingDefaults] = useState({
        maxIterations: true,
        populationSize: true,
        inertiaWeight: true,
        inertiaWeightDamping: true,
        personalLearningCoeff: true,
        globalLearningCoeff: true
    });

    useEffect(() => {
        const fetchDefaults = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/api/defaults');
                if (!response.ok) throw new Error('Failed to fetch defaults');
                const data = await response.json();
                setDefaults(data);
                
                // Set default values from backend
                setFormData({
                    maxIterations: data.maxIterations?.toString() || '',
                    populationSize: data.populationSize?.toString() || '',
                    inertiaWeight: data.inertiaWeight?.toString() || '',
                    inertiaWeightDamping: data.inertiaWeightDamping?.toString() || '',
                    personalLearningCoeff: data.personalLearningCoeff?.toString() || '',
                    globalLearningCoeff: data.globalLearningCoeff?.toString() || ''
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

    const validateForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) {
                newErrors[key] = error;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePrev = () => {
        window.scrollTo(0, 0);
        navigate('/grid');
    };

    const handleOptimize = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            // Get the session_id from localStorage
            const session_id = localStorage.getItem('session_id');
            if (!session_id) {
                throw new Error("No session ID found. Please start from the Geography and Economy page.");
            }

            // Add session_id to the form data
            const optimData = {
                session_id: session_id,
                maxIt: parseInt(formData.maxIterations),
                nPop: parseInt(formData.populationSize),
                w: parseFloat(formData.inertiaWeight),
                wdamp: parseFloat(formData.inertiaWeightDamping),
                c1: parseFloat(formData.personalLearningCoeff),
                c2: parseFloat(formData.globalLearningCoeff)
            };

            // First save optimization parameters
            const response = await fetch("http://127.0.0.1:5000/process/optim", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(optimData)
            });

            if (!response.ok) {
                throw new Error("Failed to save optimization parameters");
            }

            // Now submit the entire job for processing
            const submitResponse = await fetch("http://127.0.0.1:5000/submit/advanced", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ session_id })
            });

            if (!submitResponse.ok) {
                throw new Error("Failed to submit job for processing");
            }

            window.scrollTo(0, 0);
            navigate('/summary');
        } catch (error) {
            console.error("Error:", error);
            setErrors(prev => ({ ...prev, submit: 'Failed to save data. Please try again.' }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginLeft: "220px", padding: "20px" }}>
            <Box sx={{ maxWidth: 300, padding: 4, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h4" gutterBottom sx={{ mb: '2 !important', width: '400px !important', maxWidth: '400px !important' }}>
                    Optimization Parameters
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, width: '900px !important', maxWidth: '900px !important' }}>
                    <i>
                        Default values are provided for some questions, but please review and adjust as necessary for more accurate results.
                    </i>
                </Typography>

                <Typography variant="body1" sx={{ mb: 2 }}>
                    Enter Maximum Number of Iterations
                </Typography>
                <TextField
                    name="maxIterations"
                    label="Max # of Iterations"
                    type="number"
                    value={formData.maxIterations}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 3 }}
                    required
                    error={!!errors.maxIterations}
                    helperText={errors.maxIterations}
                    InputProps={{
                        sx: isUsingDefaults.maxIterations ? { color: 'text.secondary' } : {}
                    }}
                />

                <Typography variant="body1" sx={{ mb: 2 }}>
                    Enter Population Size (Swarm Size)
                </Typography>
                <TextField
                    name="populationSize"
                    label="Population"
                    type="number"
                    value={formData.populationSize}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 3 }}
                    required
                    error={!!errors.populationSize}
                    helperText={errors.populationSize}
                    InputProps={{
                        sx: isUsingDefaults.populationSize ? { color: 'text.secondary' } : {}
                    }}
                />

                <Typography variant="body1" sx={{ mb: 2 }}>
                    Enter Inertia Weight
                </Typography>
                <TextField
                    name="inertiaWeight"
                    label="Inertia Weight"
                    type="number"
                    value={formData.inertiaWeight}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 3 }}
                    required
                    error={!!errors.inertiaWeight}
                    helperText={errors.inertiaWeight}
                    InputProps={{
                        sx: isUsingDefaults.inertiaWeight ? { color: 'text.secondary' } : {}
                    }}
                />

                <Typography variant="body1" sx={{ mb: 2 }}>
                    Enter Inertia Weight Damping Ratio
                </Typography>
                <TextField
                    name="inertiaWeightDamping"
                    label="Inertia Weight Damping Ratio"
                    type="number"
                    value={formData.inertiaWeightDamping}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 3 }}
                    required
                    error={!!errors.inertiaWeightDamping}
                    helperText={errors.inertiaWeightDamping}
                    InputProps={{
                        sx: isUsingDefaults.inertiaWeightDamping ? { color: 'text.secondary' } : {}
                    }}
                />

                <Typography variant="body1" sx={{ mb: 2 }}>
                    Enter Personal Learning Coefficient
                </Typography>
                <TextField
                    name="personalLearningCoeff"
                    label="Personal Learning Coefficient"
                    type="number"
                    value={formData.personalLearningCoeff}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 3 }}
                    required
                    error={!!errors.personalLearningCoeff}
                    helperText={errors.personalLearningCoeff}
                    InputProps={{
                        sx: isUsingDefaults.personalLearningCoeff ? { color: 'text.secondary' } : {}
                    }}
                />

                <Typography variant="body1" sx={{ mb: 2 }}>
                    Enter Global Learning Coefficient
                </Typography>
                <TextField
                    name="globalLearningCoeff"
                    label="Global Learning Coefficient"
                    type="number"
                    value={formData.globalLearningCoeff}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 3 }}
                    required
                    error={!!errors.globalLearningCoeff}
                    helperText={errors.globalLearningCoeff}
                    InputProps={{
                        sx: isUsingDefaults.globalLearningCoeff ? { color: 'text.secondary' } : {}
                    }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                        variant="contained"
                        sx={{
                            minWidth: 100,
                            backgroundColor: '#5A3472',
                            '&:hover': { backgroundColor: '#4A2D61' },
                            color: 'white',
                        }}
                        onClick={handleOptimize}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress color="white" size={24} /> : "Submit"}
                    </Button>
                </Box>
            </Box>
        </div>
    );
}

export default OptimizationParams;