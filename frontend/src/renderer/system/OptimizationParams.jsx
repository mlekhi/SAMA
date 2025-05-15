import React, { useState, useEffect } from 'react';
import { Box, Typography, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FormInputField from '@components/form/FormInputField';
import NextButton from '@components/form/NextButton';
import ErrorMessage from '@components/form/ErrorMessage';
import { API_URL } from "@utils/config";
import Navigation from '@components/Navigation';

function OptimizationParams() {
    const navigate = useNavigate();
    const [defaults, setDefaults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorDialog, setErrorDialog] = useState({
        open: false,
        title: '',
        message: ''
    });

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
                const response = await fetch(`${API_URL}/api/defaults`);
                if (!response.ok) throw new Error('Failed to fetch defaults');
                const data = await response.json();
                setDefaults(data);
                
                // Set default values from backend
                setFormData({
                    maxIterations: data.max_iterations?.toString() || '',
                    populationSize: data.population_size?.toString() || '',
                    inertiaWeight: data.inertia_weight?.toString() || '',
                    inertiaWeightDamping: data.inertia_weight_damping?.toString() || '',
                    personalLearningCoeff: data.personal_learning_coeff?.toString() || '',
                    globalLearningCoeff: data.global_learning_coeff?.toString() || ''
                });
            } catch (error) {
                console.error('Error fetching defaults:', error);
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

    const handleNext = async () => {
        setLoading(true);
        try {
            const session_id = localStorage.getItem('session_id');
            if (!session_id) {
                throw new Error("No session ID found. Please start from the Geography and Economy page.");
            }

            // Transform form data to match backend model field names
            const optimData = {
                session_id: session_id,
                MaxIt: parseInt(formData.maxIterations),
                nPop: parseInt(formData.populationSize),
                w: parseFloat(formData.inertiaWeight),
                wdamp: parseFloat(formData.inertiaWeightDamping),
                c1: parseFloat(formData.personalLearningCoeff),
                c2: parseFloat(formData.globalLearningCoeff)
            };

            // Save optimization parameters
            const response = await fetch(`${API_URL}/api/component/optimization`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(optimData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to save optimization parameters");
            }

            const result = await response.json();
            localStorage.setItem("optimizationId", result.id);

            window.scrollTo(0, 0);
            navigate('/system');
        } catch (error) {
            setErrorDialog({
                open: true,
                title: 'Error Saving Data',
                message: error.message || 'Failed to save your data. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
            <Navigation />
            <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 6 }}>
                <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                    <Typography variant="h4" gutterBottom>
                        Optimization Parameters
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4 }}>
                        <i>
                            Default values are provided for some questions, but please review and adjust as necessary for more accurate results.
                        </i>
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <FormInputField
                            label="Maximum Number of Iterations"
                            name="maxIterations"
                            value={formData.maxIterations}
                            onChange={handleChange}
                            isDefault={isUsingDefaults.maxIterations}
                        />

                        <FormInputField
                            label="Population Size (Swarm Size)"
                            name="populationSize"
                            value={formData.populationSize}
                            onChange={handleChange}
                            isDefault={isUsingDefaults.populationSize}
                        />

                        <FormInputField
                            label="Inertia Weight"
                            name="inertiaWeight"
                            value={formData.inertiaWeight}
                            onChange={handleChange}
                            isDefault={isUsingDefaults.inertiaWeight}
                        />

                        <FormInputField
                            label="Inertia Weight Damping Ratio"
                            name="inertiaWeightDamping"
                            value={formData.inertiaWeightDamping}
                            onChange={handleChange}
                            isDefault={isUsingDefaults.inertiaWeightDamping}
                        />

                        <FormInputField
                            label="Personal Learning Coefficient"
                            name="personalLearningCoeff"
                            value={formData.personalLearningCoeff}
                            onChange={handleChange}
                            isDefault={isUsingDefaults.personalLearningCoeff}
                        />

                        <FormInputField
                            label="Global Learning Coefficient"
                            name="globalLearningCoeff"
                            value={formData.globalLearningCoeff}
                            onChange={handleChange}
                            isDefault={isUsingDefaults.globalLearningCoeff}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <NextButton
                                label="Next"
                                onClick={handleNext}
                                loading={loading}
                            />
                        </Box>
                    </Box>
                </Box>
            </Container>

            <ErrorMessage
                open={errorDialog.open}
                onClose={() => setErrorDialog(prev => ({ ...prev, open: false }))}
                title={errorDialog.title}
                message={errorDialog.message}
            />
        </Box>
    );
}

export default OptimizationParams;