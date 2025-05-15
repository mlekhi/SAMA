import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    FormGroup,
    List,
    ListItem,
    Divider,
    Grid2,
    Radio,
    RadioGroup,
    Alert
} from "@mui/material";
import FormInputField from '@components/form/FormInputField';
import NextButton from '@components/form/NextButton';
import { API_URL } from "@utils/config";

function GridInfo() {

    const navigate = useNavigate();
    const [defaults, setDefaults] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // State for the main dropdown selection
    const [isGridConnected, setIsGridConnected] = useState("");
    const [isNetMetered, setIsNetMetered] = useState("");

    // State for the checklist options
    const [summerMonths, setSummerMonths] = useState({
        January: false,
        February: false,
        March: false,
        April: false,
        May: false,
        June: false,
        July: false,
        August: false,
        September: false,
        October: false,
        November: false,
        December: false
    });

    // State for the utility structure dropdown selection
    const [utilityStructure, setUtilityStructure] = useState("");

    // States for Holiday API
    const [country, setCountry] = useState('US');
    const [year, setYear] = useState('2023');
    const [holidays, setHolidays] = useState([]);

    // Initialize state with empty values
    const [annualExpense, setAnnualExpense] = useState('');
    const [saleTaxPrecentage, setSaleTaxPrecentage] = useState('');
    const [gridAdjust, setGridAdjust] = useState('');
    const [yearlyEscRate, setYearlyEscRate] = useState('');
    const [annualCredits, setAnnualCredits] = useState('');
    const [netMetering, setNetMetering] = useState('');
    const [monthlyFixedCharge, setMonthlyFixedCharge] = useState('');
    const [sellCapacity, setSellCapacity] = useState('');
    const [purchaseCapacity, setPurchaseCapacity] = useState('');

    // Initialize prices state with empty values
    const [prices, setPrices] = useState({
        flatPrice: "",
        summerPrice: "",
        winterPrice: "",
        monthlyPrices: {
            January: "",
            February: "",
            March: "",
            April: "",
            May: "",
            June: "",
            July: "",
            August: "",
            September: "",
            October: "",
            November: "",
            December: "",
        },
        timeOfUse: {
            summerPeakRate: "",
            summerMidPeakRate: "",
            summerOffPeakRate: "",
            summerPeakHours: [],
            summerMidPeakHours: [],
            winterPeakRate: "",
            winterMidPeakRate: "",
            winterOffPeakRate: "",
            winterPeakHours: [],
            winterMidPeakHours: [],
        },
        tieredRate: {
            lowTierPrice: "",
            lowTierMaxLoad: "",
            mediumTierPrice: "",
            mediumTierMaxLoad: "",
            highTierPrice: "",
            highTierMaxLoad: "",
        },
        seasonalTieredRate: {
            summer: {
                lowTierPrice: "",
                lowTierMaxLoad: "",
                mediumTierPrice: "",
                mediumTierMaxLoad: "",
                highTierPrice: "",
                highTierMaxLoad: "",
            },
            winter: {
                lowTierPrice: "",
                lowTierMaxLoad: "",
                mediumTierPrice: "",
                mediumTierMaxLoad: "",
                highTierPrice: "",
                highTierMaxLoad: "",
            },
        },
        monthlyTieredRate: {
            January: { lowTierPrice: "", lowTierMaxLoad: "", mediumTierPrice: "", mediumTierMaxLoad: "", highTierPrice: "", highTierMaxLoad: "" },
            February: { lowTierPrice: "", lowTierMaxLoad: "", mediumTierPrice: "", mediumTierMaxLoad: "", highTierPrice: "", highTierMaxLoad: "" },
            March: { lowTierPrice: "", lowTierMaxLoad: "", mediumTierPrice: "", mediumTierMaxLoad: "", highTierPrice: "", highTierMaxLoad: "" },
            April: { lowTierPrice: "", lowTierMaxLoad: "", mediumTierPrice: "", mediumTierMaxLoad: "", highTierPrice: "", highTierMaxLoad: "" },
            May: { lowTierPrice: "", lowTierMaxLoad: "", mediumTierPrice: "", mediumTierMaxLoad: "", highTierPrice: "", highTierMaxLoad: "" },
            June: { lowTierPrice: "", lowTierMaxLoad: "", mediumTierPrice: "", mediumTierMaxLoad: "", highTierPrice: "", highTierMaxLoad: "" },
            July: { lowTierPrice: "", lowTierMaxLoad: "", mediumTierPrice: "", mediumTierMaxLoad: "", highTierPrice: "", highTierMaxLoad: "" },
            August: { lowTierPrice: "", lowTierMaxLoad: "", mediumTierPrice: "", mediumTierMaxLoad: "", highTierPrice: "", highTierMaxLoad: "" },
            September: { lowTierPrice: "", lowTierMaxLoad: "", mediumTierPrice: "", mediumTierMaxLoad: "", highTierPrice: "", highTierMaxLoad: "" },
            October: { lowTierPrice: "", lowTierMaxLoad: "", mediumTierPrice: "", mediumTierMaxLoad: "", highTierPrice: "", highTierMaxLoad: "" },
            November: { lowTierPrice: "", lowTierMaxLoad: "", mediumTierPrice: "", mediumTierMaxLoad: "", highTierPrice: "", highTierMaxLoad: "" },
            December: { lowTierPrice: "", lowTierMaxLoad: "", mediumTierPrice: "", mediumTierMaxLoad: "", highTierPrice: "", highTierMaxLoad: "" },
        },
        flatComp: "",
        monthlyComp: {
            January: "",
            February: "",
            March: "",
            April: "",
            May: "",
            June: "",
            July: "",
            August: "",
            September: "",
            October: "",
            November: "",
            December: "",
        },
    });

    //selling to the grid
    const [compensation, setCompensation] = useState("one-to-one");

    useEffect(() => {
        const fetchDefaults = async () => {
            try {
                const response = await fetch(`${API_URL}/api/defaults`);
                if (!response.ok) throw new Error('Failed to fetch defaults');
                const data = await response.json();
                setDefaults(data);
                
                // Set default values from backend
                setAnnualExpense(data.grid_annual_expense?.toString() || '');
                setSaleTaxPrecentage(data.grid_sale_tax?.toString() || '');
                setGridAdjust(data.grid_adjustment?.toString() || '');
                setYearlyEscRate(data.grid_yearly_esc_rate?.toString() || '');
                setAnnualCredits(data.grid_annual_credits?.toString() || '');
                setNetMetering(data.grid_net_metering?.toString() || '');
                setMonthlyFixedCharge(data.grid_monthly_fixed_charge?.toString() || '');
                setSellCapacity(data.grid_sell_capacity?.toString() || '');
                setPurchaseCapacity(data.grid_purchase_capacity?.toString() || '');
                
                // Set default prices
                setPrices(prev => ({
                    ...prev,
                    flatPrice: data.grid_flat_price?.toString() || '',
                    summerPrice: data.grid_summer_price?.toString() || '',
                    winterPrice: data.grid_winter_price?.toString() || '',
                    flatComp: data.grid_flat_comp?.toString() || '',
                    // Add other price defaults as needed
                }));
            } catch (error) {
                console.error('Error fetching defaults:', error);
            }
        };
        fetchDefaults();
    }, []);

    // Handle changes to the summer months checklist
    const handleMonthChange = (month) => {
        setSummerMonths((prevMonths) => ({
            ...prevMonths,
            [month]: !prevMonths[month]
        }));
    };

    // Handle changes to the utility structure
    const handleUtilityStructureChange = (event) => {
        const value = event.target.value;
        setUtilityStructure(value);

        // Reset prices based on the selected structure
        setPrices((prevPrices) => ({
            ...prevPrices,
            flatPrice: "",
            summerPrice: "",
            winterPrice: "",
            monthlyPrices: {
                January: "",
                February: "",
                March: "",
                April: "",
                May: "",
                June: "",
                July: "",
                August: "",
                September: "",
                October: "",
                November: "",
                December: "",
            },
        }));
    };

    // Handle changes to monthly prices
    const handleMonthlyPriceChange = (month, value) => {
        setPrices((prevPrices) => ({
            ...prevPrices,
            monthlyPrices: {
                ...prevPrices.monthlyPrices,
                [month]: value,
            },
        }));
    };

    const handleTieredRateChange = (field, value) => {
        setPrices((prevPrices) => ({
            ...prevPrices,
            tieredRate: {
                ...prevPrices.tieredRate,
                [field]: value,
            },
        }));
    };

    const handleSeasonalTieredRateChange = (season, field, value) => {
        setPrices((prevPrices) => ({
            ...prevPrices,
            seasonalTieredRate: {
                ...prevPrices.seasonalTieredRate,
                [season]: {
                    ...prevPrices.seasonalTieredRate[season],
                    [field]: value,
                },
            },
        }));
    };

    const handleMonthlyTieredRateChange = (month, field, value) => {
        setPrices((prevPrices) => ({
            ...prevPrices,
            monthlyTieredRate: {
                ...prevPrices.monthlyTieredRate,
                [month]: {
                    ...prevPrices.monthlyTieredRate[month],
                    [field]: value,
                },
            },
        }));
    };


    // Handle changes for Time of Use inputs
    const handleTimeOfUseChange = (season, key, value) => {
        setPrices((prevPrices) => ({
            ...prevPrices,
            timeOfUse: {
                ...prevPrices.timeOfUse,
                [`${season}${key}`]: value
            }
        }));
    };

    // Handle changes for hourly ranges (adds new ranges)
    const handleAddHourRange = (season, key) => {
        setPrices((prevPrices) => ({
            ...prevPrices,
            timeOfUse: {
                ...prevPrices.timeOfUse,
                [`${season}${key}`]: [
                    ...prevPrices.timeOfUse[`${season}${key}`],
                    { start: "", end: "" }
                ]
            }
        }));
    };

    // Handle changes to specific ranges
    const handleHourRangeChange = (season, key, index, rangeKey, value) => {
        setPrices((prevPrices) => ({
            ...prevPrices,
            timeOfUse: {
                ...prevPrices.timeOfUse,
                [`${season}${key}`]: prevPrices.timeOfUse[`${season}${key}`].map((range, i) =>
                    i === index ? { ...range, [rangeKey]: value } : range
                )
            }
        }));
    };

    // Handle changes to the compensation
    const handleCompensationChange = (event) => {
        const value = event.target.value;
        setCompensation(value);
    };

    // Handle changes to monthly compensation
    const handleMonthlyCompChange = (month, value) => {
        setPrices((prevPrices) => ({
            ...prevPrices,
            monthlyComp: {
                ...prevPrices.monthlyComp,
                [month]: value,
            },
        }));
    };

    const handleNext = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Get the session_id from localStorage
            const session_id = localStorage.getItem('session_id');
            if (!session_id) {
                throw new Error("No session ID found. Please start from the Geography and Economy page.");
            }

            // Prepare the grid data with session_id
            const gridData = {
                session_id: session_id,
                ...formData,
                gridConnected,
                useNetMetering,
                adjustForSaleTax,
                sellStructure: selectedSellStructure,
                monthly_sell_prices: monthlySellPrices,
                flat_compensation: parseFloat(flatCompensation),
                one_to_one_compensation: selectedSellStructure === 3
            };

            const response = await fetch(`${API_URL}/gridInfo`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(gridData)
            });

            if (!response.ok) {
                throw new Error("Failed to save grid information.");
            }

            console.log("Grid Info Saved Successfully!");
            window.scrollTo(0, 0);
            navigate('/optim');

        } catch (error) {
            console.error('Error:', error);
            setSnackbarOpen(true);
            setSnackbarMessage("Error saving grid information. Please try again.");
            setSnackbarSeverity("error");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrev = () => {
        // then navigate to comp info
        window.scrollTo(0, 0);
        navigate('/bat');
    };


    //backend connection
    const sendGridInfo = async () => {
        const gridInfoData = {
            isGridConnected,
            isNetMetered,
            utilityStructure,
            annualExpense,
            saleTaxPrecentage,
            gridAdjust,
            yearlyEscRate,
            annualCredits,
            netMetering,
            monthlyFixedCharge,
            purchaseCapacity,
            sellCapacity,
            compensation,
            prices,
            summerMonths: Object.keys(summerMonths).filter((month) => summerMonths[month]),
        };

        console.log("Sending Grid Info:", gridInfoData);

        try {
            const response = await fetch(`${API_URL}/gridInfo`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(gridInfoData),
            });

            const result = await response.json();
            console.log("Response from server:", result);
            // Navigate to summary after successful submission
            navigate('/optim');
        } catch (error) {
            console.error("Error sending grid info:", error);
        }
    };

    const getMissingFields = (structure, prices) => {
        const missingFields = [];

        switch (structure) {
            case "flatrate":
                if (!prices.flatPrice || prices.flatPrice === "") missingFields.push("Flat Price");
                break;

            case "seasonalrate":
                if (!prices.summerPrice || prices.summerPrice === "") missingFields.push("Summer Price");
                if (!prices.winterPrice || prices.winterPrice === "") missingFields.push("Winter Price");
                break;

            case "monthlyrate":
                Object.entries(prices.monthlyPrices).forEach(([month, value]) => {
                    if (!value || value === "") missingFields.push(`${month} Price`);
                });
                break;

            case "timeofuse":
                if (!prices.timeOfUse?.summerPeakRate || prices.timeOfUse.summerPeakRate === "") missingFields.push("Summer Peak Rate");
                if (!prices.timeOfUse?.summerMidPeakRate || prices.timeOfUse.summerMidPeakRate === "") missingFields.push("Summer Mid-Peak Rate");
                if (!prices.timeOfUse?.summerOffPeakRate || prices.timeOfUse.summerOffPeakRate === "") missingFields.push("Summer Off-Peak Rate");
                if (!prices.timeOfUse?.winterPeakRate || prices.timeOfUse.winterPeakRate === "") missingFields.push("Winter Peak Rate");
                if (!prices.timeOfUse?.winterMidPeakRate || prices.timeOfUse.winterMidPeakRate === "") missingFields.push("Winter Mid-Peak Rate");
                if (!prices.timeOfUse?.winterOffPeakRate || prices.timeOfUse.winterOffPeakRate === "") missingFields.push("Winter Off-Peak Rate");
                break;

            case "tieredrate":
                if (!prices.tieredRate?.lowTierPrice || prices.tieredRate.lowTierPrice === "") missingFields.push("Low Tier Price");
                if (!prices.tieredRate?.mediumTierPrice || prices.tieredRate.mediumTierPrice === "") missingFields.push("Medium Tier Price");
                if (!prices.tieredRate?.highTierPrice || prices.tieredRate.highTierPrice === "") missingFields.push("High Tier Price");
                break;

            case "seasonaltier":
                Object.entries(prices.seasonalTieredRate).forEach(([season, rates]) => {
                    if (!rates?.lowTierPrice || rates.lowTierPrice === "") missingFields.push(`${season} Low Tier Price`);
                    if (!rates?.mediumTierPrice || rates.mediumTierPrice === "") missingFields.push(`${season} Medium Tier Price`);
                    if (!rates?.highTierPrice || rates.highTierPrice === "") missingFields.push(`${season} High Tier Price`);
                });
                break;

            case "monthlytier":
                Object.entries(prices.monthlyTieredRate).forEach(([month, rates]) => {
                    if (!rates?.lowTierPrice || rates.lowTierPrice === "") missingFields.push(`${month} Low Tier Price`);
                    if (!rates?.mediumTierPrice || rates.mediumTierPrice === "") missingFields.push(`${month} Medium Tier Price`);
                    if (!rates?.highTierPrice || rates.highTierPrice === "") missingFields.push(`${month} High Tier Price`);
                });
                break;

            default:
                break;
        }

        return missingFields;
    };


    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3, ml: '250px' }}>
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                <Typography variant="h4" gutterBottom>
                    Grid Information
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                    <i>
                        Default values are provided for some questions, but please review and adjust as necessary for more accurate results.
                    </i>
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <FormControl>
                        <Typography gutterBottom>Is your system connected to the grid?</Typography>
                        <RadioGroup
                            value={isGridConnected}
                            onChange={(e) => {
                                setIsGridConnected(e.target.value);
                                if (e.target.value === 'No') {
                                    setIsNetMetered('No');
                                }
                            }}
                        >
                            <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                            <FormControlLabel value="No" control={<Radio />} label="No" />
                        </RadioGroup>
                    </FormControl>

                    {isGridConnected === 'Yes' && (
                        <FormControl>
                            <Typography gutterBottom>Is your system net metered?</Typography>
                            <RadioGroup
                                value={isNetMetered}
                                onChange={(e) => setIsNetMetered(e.target.value)}
                            >
                                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                                <FormControlLabel value="No" control={<Radio />} label="No" />
                            </RadioGroup>
                        </FormControl>
                    )}

                    {isGridConnected === 'Yes' && isNetMetered === 'Yes' && (
                        <FormControl>
                            <Typography gutterBottom>Select your utility structure:</Typography>
                            <Select
                                value={utilityStructure}
                                onChange={(e) => setUtilityStructure(e.target.value)}
                                sx={{ minWidth: 200 }}
                            >
                                <MenuItem value="tiered">Tiered</MenuItem>
                                <MenuItem value="timeOfUse">Time of Use</MenuItem>
                                <MenuItem value="realTime">Real Time</MenuItem>
                            </Select>
                        </FormControl>
                    )}

                    {isGridConnected === 'Yes' && isNetMetered === 'Yes' && utilityStructure && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography gutterBottom>Enter your utility prices:</Typography>
                            {getPriceFields(utilityStructure).map((field, index) => (
                                <FormInputField
                                    key={index}
                                    label={field.label}
                                    name={field.name}
                                    value={prices[field.name] || ''}
                                    onChange={(e) => handlePriceChange(field.name, e.target.value)}
                                    error={!prices[field.name]}
                                    helperText={!prices[field.name] ? 'Required' : ''}
                                    endAdornment={field.unit}
                                />
                            ))}
                        </Box>
                    )}

                    {isGridConnected === 'Yes' && isNetMetered === 'No' && (
                        <FormControl>
                            <Typography gutterBottom>Enter your utility price:</Typography>
                            <FormInputField
                                label="Utility Price"
                                name="utilityPrice"
                                value={prices.utilityPrice || ''}
                                onChange={(e) => handlePriceChange('utilityPrice', e.target.value)}
                                error={!prices.utilityPrice}
                                helperText={!prices.utilityPrice ? 'Required' : ''}
                                endAdornment="$/kWh"
                            />
                        </FormControl>
                    )}

                    {isGridConnected === 'No' && isNetMetered === 'No' && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <NextButton
                                label="Next"
                                onClick={handleNext}
                                loading={loading}
                                color="secondary"
                            />
                        </Box>
                    )}

                    {isGridConnected === 'Yes' && isNetMetered === 'Yes' && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <NextButton
                                label="Next"
                                onClick={handleNext}
                                loading={loading}
                                disabled={!utilityStructure || getMissingFields(utilityStructure, prices).length > 0}
                                color="secondary"
                            />
                        </Box>
                    )}

                    {isGridConnected === 'Yes' && isNetMetered === 'No' && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <NextButton
                                label="Next"
                                onClick={handleNext}
                                loading={loading}
                                color="secondary"
                            />
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}


export default GridInfo