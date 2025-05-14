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

function GridInfo() {

    const navigate = useNavigate();
    const [defaults, setDefaults] = useState(null);
    const [errors, setErrors] = useState({});

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
                const response = await fetch('http://127.0.0.1:5000/api/defaults');
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

            const response = await fetch("http://127.0.0.1:5000/gridInfo", {
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

        console.log("Sending Grid Info:", gridInfoData); // Add this line for debugging


        try {
            const response = await fetch("http://127.0.0.1:5000/gridInfo", {
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
        <div style={{ marginLeft: "220px", padding: "20px" }}>


            <Box sx={{ padding: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Grid Information
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    <i>
                        Default values are provided for some questions, but please review and adjust as necessary for more accurate
                        results.
                    </i>
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {/* First Question: Is the system connected to the grid */}
                    <FormControl>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            Is your energy system connected to the grid?
                        </Typography>
                        <RadioGroup
                            row
                            value={isGridConnected}
                            onChange={(e) => setIsGridConnected(e.target.value)}
                        >
                            <FormControlLabel
                                value="Yes"
                                control={<Radio sx={{
                                    color: '#5A3472',
                                    '&.Mui-checked': {
                                        color: '#5A3472',
                                    },
                                }} />}
                                label="Yes"
                            />
                            <FormControlLabel
                                value="No"
                                control={<Radio sx={{
                                    color: '#5A3472',
                                    '&.Mui-checked': {
                                        color: '#5A3472',
                                    },
                                }} />}
                                label="No"
                            />
                        </RadioGroup>
                    </FormControl>

                    {/* Second Question */}
                    {isGridConnected === 'Yes' && (
                        <FormControl>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                Is your energy system net metered?
                            </Typography>
                            <RadioGroup
                                row
                                value={isNetMetered}
                                onChange={(e) => setIsNetMetered(e.target.value)}
                            >
                                <FormControlLabel
                                    value="Yes"
                                    control={<Radio sx={{
                                        color: '#5A3472',
                                        '&.Mui-checked': {
                                            color: '#5A3472',
                                        },
                                    }} />}
                                    label="Yes"
                                />
                                <FormControlLabel
                                    value="No"
                                    control={<Radio sx={{
                                        color: '#5A3472',
                                        '&.Mui-checked': {
                                            color: '#5A3472',
                                        },
                                    }} />}
                                    label="No"
                                />
                            </RadioGroup>
                        </FormControl>
                    )}

                    {isGridConnected === 'No' && (
                        <FormControl>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                Do you want to compare your off-grid system with the time you only buy electricity from the grid?
                            </Typography>
                            <RadioGroup
                                row
                                value={isNetMetered}
                                onChange={(e) => setIsNetMetered(e.target.value)}
                            >
                                <FormControlLabel
                                    value="Yes"
                                    control={<Radio sx={{
                                        color: '#5A3472',
                                        '&.Mui-checked': {
                                            color: '#5A3472',
                                        },
                                    }} />}
                                    label="Yes"
                                />
                                <FormControlLabel
                                    value="No"
                                    control={<Radio sx={{
                                        color: '#5A3472',
                                        '&.Mui-checked': {
                                            color: '#5A3472',
                                        },
                                    }} />}
                                    label="No"
                                />
                            </RadioGroup>
                        </FormControl>
                    )}

                    {/* If the second question is No */}
                    {isGridConnected === 'No' && isNetMetered === 'No' && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, maxWidth: 300 }}>
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
                                onClick={handleNext}
                            >
                                Next
                            </Button>
                        </Box>
                    )}
                </Box>


                {((isGridConnected === 'Yes' && isNetMetered === 'Yes') || (isGridConnected === 'Yes' && isNetMetered === 'No') || (isGridConnected === 'No' && isNetMetered === 'Yes')) && (
                    <>
                        < Typography variant="body1" sx={{ mt: 3, mb: 1 }}>
                            Which months of the year are considered summer by your electricity utility company?
                        </Typography>
                        <FormGroup row>
                            {Object.keys(summerMonths).map((month) => (
                                <FormControlLabel
                                    key={month}
                                    control={
                                        <Checkbox
                                            checked={summerMonths[month]}
                                            onChange={() => handleMonthChange(month)}
                                            sx={{
                                                color: '#5A3472', // Default unchecked color
                                                '&.Mui-checked': {
                                                    color: '#5A3472', // Checked state color
                                                },
                                            }}
                                        />
                                    }
                                    label={month}
                                />
                            ))}
                        </FormGroup>

                        {/* Holidays */}
                        {/* <Typography variant="body1" sx={{ mt: 3, mb: 2 }}>
                            Which dates of the year are considered holidays by your electricity utility company? Select your country:
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel id="country-label">Country</InputLabel>
                                <Select sx={{ maxWidth: 300, width: '100%' }}
                                    label="country-label"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                >
                                    {[
                                        { value: "AR", label: "Argentina" },
                                        { value: "AU", label: "Australia" },
                                        { value: "CA", label: "Canada" },
                                        { value: "AE", label: "United Arab Emirates" },
                                        { value: "GB", label: "United Kingdom" },
                                        { value: "US", label: "United States" },
                                    ].map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box> */}

                        {/* <Button
                            onClick={fetchHolidays}
                            variant="contained"
                            sx={{
                                minWidth: 100,
                                backgroundColor: '#5A3472',
                                '&:hover': { backgroundColor: '#4A2D61' },
                                color: 'white',
                            }}
                        >
                            Fetch Holidays
                        </Button>

                        {loading && <CircularProgress sx={{ mt: 2 }} />}
                        {error && (
                            <Typography color="error" sx={{ mt: 2 }}>
                                {error}
                            </Typography>
                        )} */}

                        <List>
                            {holidays.map((holiday, index) => (
                                <ListItem key={index}>
                                    {holiday}
                                </ListItem>
                            ))}
                        </List>

                        <Divider sx={{ my: 4 }} />
                        <Box
                            sx={{
                                maxWidth: 450,
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                Enter annual expenses for grid interconnection in $ (if any)
                            </Typography>
                            <TextField
                                label="Annual Expenses"
                                type="number"
                                value={annualExpense}
                                onChange={(e) => setAnnualExpense(e.target.value)}
                                fullWidth
                                variant="outlined"
                                sx={{ maxWidth: 300, width: '100%', mb: 3 }}
                            />

                            <Typography variant="body1" sx={{ mb: 2 }}>
                                Enter sale tax percentage of grid electricity
                            </Typography>
                            <TextField
                                label="Sale Tax Percentage"
                                type="number"
                                value={saleTaxPrecentage}
                                onChange={(e) => setSaleTaxPrecentage(e.target.value)}
                                fullWidth
                                variant="outlined"
                                sx={{ maxWidth: 300, width: '100%', mb: 3 }}
                            />

                            <Typography variant="body1" sx={{ mb: 2 }}>
                                Enter grid adjusments in kWh
                            </Typography>
                            <TextField
                                label="Grid Adjusments"
                                type="number"
                                value={gridAdjust}
                                onChange={(e) => setGridAdjust(e.target.value)}
                                fullWidth
                                variant="outlined"
                                sx={{ maxWidth: 300, width: '100%', mb: 3 }}
                            />

                            <Typography variant="body1" sx={{ mb: 2 }}>
                                Enter yearly escalation rate in grid electricity prices
                            </Typography>
                            <TextField
                                label="Yearly escalation rate"
                                type="number"
                                value={yearlyEscRate}
                                onChange={(e) => setYearlyEscRate(e.target.value)}
                                fullWidth
                                variant="outlined"
                                sx={{ maxWidth: 300, width: '100%', mb: 3 }}
                            />

                            <Typography variant="body1" sx={{ mb: 2 }}>
                                Enter annual credits offered by utility grid to users
                            </Typography>
                            <TextField
                                label="Annual Credits"
                                type="number"
                                value={annualCredits}
                                onChange={(e) => setAnnualCredits(e.target.value)}
                                fullWidth
                                variant="outlined"
                                sx={{ maxWidth: 300, width: '100%', mb: 3 }}
                            />

                            {isNetMetered === "Yes" && (
                                <>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        Enter net metering one-time setup fee
                                    </Typography>
                                    <TextField
                                        label="Net Metering"
                                        type="number"
                                        value={netMetering}
                                        onChange={(e) => setNetMetering(e.target.value)}
                                        fullWidth
                                        variant="outlined"
                                        sx={{ maxWidth: 300, width: '100%', mb: 3 }}
                                    />
                                </>
                            )}

                            <Typography variant="body1" sx={{ mb: 2 }}>
                                Enter grid monthly fixed charge
                            </Typography>
                            <TextField
                                label="Monthly Fixed Charge"
                                type="number"
                                value={monthlyFixedCharge}
                                onChange={(e) => setMonthlyFixedCharge(e.target.value)}
                                fullWidth
                                variant="outlined"
                                sx={{ maxWidth: 300, width: '100%', mb: 3 }}
                            />
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        {/* Utility structure */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, margin: 'auto', }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                Select a Utility Structure:
                            </Typography>
                            <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
                                <InputLabel id="rate-structure-label">Rate Structure</InputLabel>
                                <Select
                                    label='rate-structure-label'
                                    id='rate-structure-select'
                                    value={utilityStructure}
                                    onChange={handleUtilityStructureChange}
                                >
                                    <MenuItem value="flatrate">Flat Rate</MenuItem>
                                    <MenuItem value="seasonalrate">Seasonal Rate</MenuItem>
                                    <MenuItem value="monthlyrate">Monthly Rate</MenuItem>
                                    <MenuItem value="tieredrate">Tiered Rate</MenuItem>
                                    <MenuItem value="seasonaltier">Seasonal Tiered Rate</MenuItem>
                                    <MenuItem value="monthlytier">Monthly Tiered Rate</MenuItem>
                                    <MenuItem value="timeofuse">Time of Use</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Conditional input fields */}
                            {utilityStructure === "flatrate" && (
                                <TextField
                                    label="Flat Price"
                                    type="number"
                                    value={prices.flatPrice}
                                    onChange={(e) =>
                                        setPrices({ ...prices, flatPrice: e.target.value })
                                    }
                                    sx={{ maxWidth: 300, width: '100%' }}
                                />
                            )}

                            {utilityStructure === "seasonalrate" && (
                                <>
                                    <TextField
                                        label="Summer Price"
                                        type="number"
                                        value={prices.summerPrice}
                                        onChange={(e) => setPrices({ ...prices, summerPrice: e.target.value })}
                                        sx={{ maxWidth: 300, width: '100%' }}
                                    />
                                    <TextField
                                        label="Winter Price"
                                        type="number"
                                        value={prices.winterPrice}
                                        onChange={(e) => setPrices({ ...prices, winterPrice: e.target.value })}
                                        sx={{ maxWidth: 300, width: '100%' }}
                                    />
                                </>
                            )}

                            {utilityStructure === "monthlyrate" && (
                                <Box>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        Enter Monthly Prices:
                                    </Typography>

                                    <Grid2 container spacing={2} sx={{ maxWidth: 1000 }}>
                                        {Object.keys(prices.monthlyPrices).map((month) => (
                                            <Box key={month} sx={{ mb: 2 }}>

                                                <TextField
                                                    label={`${month} Price:`}
                                                    type="number"
                                                    value={prices.monthlyPrices[month]}
                                                    onChange={(e) => handleMonthlyPriceChange(month, e.target.value)}
                                                    fullWidth
                                                    sx={{ maxWidth: 300 }}
                                                />
                                            </Box>
                                        ))}
                                    </Grid2>
                                </Box>
                            )}

                            {utilityStructure === "tieredrate" && (
                                <Box sx={{ display: 'flex', mt: 2 }}>
                                    <Grid2 container spacing={2} sx={{ maxWidth: 800 }}>
                                        {/* Low Tier Price */}
                                        <Grid2 item xs={6}>
                                            <TextField
                                                label="Low Tier Price:"
                                                type="number"
                                                value={prices.tieredRate.lowTierPrice}
                                                onChange={(e) => handleTieredRateChange("lowTierPrice", e.target.value)}
                                                fullWidth
                                                sx={{ width: '300px !important', maxWidth: '300px !important' }}
                                            />
                                        </Grid2>

                                        {/* Low Tier Max Load */}
                                        <Grid2 item xs={6}>
                                            <TextField
                                                label="Low Tier Max Load (kWh):"
                                                type="number"
                                                value={prices.tieredRate.lowTierMaxLoad}
                                                onChange={(e) => handleTieredRateChange("lowTierMaxLoad", e.target.value)}
                                                fullWidth
                                                sx={{ width: '300px !important', maxWidth: '300px !important' }}
                                            />
                                        </Grid2>

                                        {/* Medium Tier Price */}
                                        <Grid2 item xs={6}>
                                            <TextField
                                                label="Medium Tier Price:"
                                                type="number"
                                                value={prices.tieredRate.mediumTierPrice}
                                                onChange={(e) => handleTieredRateChange("mediumTierPrice", e.target.value)}
                                                fullWidth
                                                sx={{ width: '300px !important', maxWidth: '300px !important' }}
                                            />
                                        </Grid2>

                                        {/* Medium Tier Max Load */}
                                        <Grid2 item xs={6}>
                                            <TextField
                                                label="Medium Tier Max Load (kWh):"
                                                type="number"
                                                value={prices.tieredRate.mediumTierMaxLoad}
                                                onChange={(e) => handleTieredRateChange("mediumTierMaxLoad", e.target.value)}
                                                fullWidth
                                                sx={{ width: '300px !important', maxWidth: '300px !important' }}
                                            />
                                        </Grid2>

                                        {/* High Tier Price */}
                                        <Grid2 item xs={6}>
                                            <TextField
                                                label="High Tier Price:"
                                                type="number"
                                                value={prices.tieredRate.highTierPrice}
                                                onChange={(e) => handleTieredRateChange("highTierPrice", e.target.value)}
                                                fullWidth
                                                sx={{ width: '300px !important', maxWidth: '300px !important' }}
                                            />
                                        </Grid2>

                                        {/* High Tier Max Load */}
                                        <Grid2 item xs={6}>
                                            <TextField
                                                label="High Tier Max Load (kWh):"
                                                type="number"
                                                value={prices.tieredRate.highTierMaxLoad}
                                                onChange={(e) => handleTieredRateChange("highTierMaxLoad", e.target.value)}
                                                fullWidth
                                                sx={{ width: '300px !important', maxWidth: '300px !important' }}
                                            />
                                        </Grid2>
                                    </Grid2>
                                </Box>
                            )}


                            {utilityStructure === "seasonaltier" && (
                                <Box>
                                    <Grid2 container spacing={4}>
                                        {/* Summer Rates */}
                                        <Grid2 item xs={12} sm={6}>
                                            <Typography variant="h6" sx={{ mb: 2 }}>
                                                Summer Rates
                                            </Typography>
                                            {["lowTierPrice", "lowTierMaxLoad", "mediumTierPrice", "mediumTierMaxLoad", "highTierPrice", "highTierMaxLoad"].map((field) => (
                                                <Box key={`summer-${field}`} sx={{ mb: 2 }}>
                                                    <TextField
                                                        label={field.replace(/([A-Z])/g, " $1")}
                                                        type="number"
                                                        value={prices.seasonalTieredRate.summer[field]}
                                                        onChange={(e) => handleSeasonalTieredRateChange("summer", field, e.target.value)}
                                                        fullWidth
                                                        sx={{ maxWidth: 300 }}
                                                    />
                                                </Box>
                                            ))}
                                        </Grid2>

                                        {/* Winter Rates */}
                                        <Grid2 item xs={12} sm={6}>
                                            <Typography variant="h6" sx={{ mb: 2 }}>
                                                Winter Rates
                                            </Typography>
                                            {["lowTierPrice", "lowTierMaxLoad", "mediumTierPrice", "mediumTierMaxLoad", "highTierPrice", "highTierMaxLoad"].map((field) => (
                                                <Box key={`winter-${field}`} sx={{ mb: 2 }}>
                                                    <TextField
                                                        label={field.replace(/([A-Z])/g, " $1")}
                                                        type="number"
                                                        value={prices.seasonalTieredRate.winter[field]}
                                                        onChange={(e) => handleSeasonalTieredRateChange("winter", field, e.target.value)}
                                                        fullWidth
                                                        sx={{ maxWidth: 300 }}
                                                    />
                                                </Box>
                                            ))}
                                        </Grid2>
                                    </Grid2>
                                </Box>
                            )}

                            {utilityStructure === "monthlytier" && (
                                <Box>
                                    <Typography variant="h6" sx={{ mb: 2 }}>
                                        Monthly Tiered Rates
                                    </Typography>
                                    <Grid2 container spacing={4}>
                                        {Object.keys(prices.monthlyTieredRate).map((month, index) => (
                                            <Grid2 item xs={12} sm={4} key={month}>
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ mb: 1, ml: 2 }}>
                                                        {month}
                                                    </Typography>
                                                    {["lowTierPrice", "lowTierMaxLoad", "mediumTierPrice", "mediumTierMaxLoad", "highTierPrice", "highTierMaxLoad"].map((field) => (
                                                        <TextField
                                                            key={`${month}-${field}`}
                                                            label={field.replace(/([A-Z])/g, " $1")}
                                                            type="number"
                                                            value={prices.monthlyTieredRate[month][field]}
                                                            onChange={(e) => handleMonthlyTieredRateChange(month, field, e.target.value)}
                                                            fullWidth
                                                            sx={{ mb: 2, maxWidth: 300, ml: 2 }}
                                                        />
                                                    ))}
                                                </Box>
                                            </Grid2>
                                        ))}
                                    </Grid2>
                                </Box>
                            )}


                            {utilityStructure === "timeofuse" && (
                                <Box>
                                    {/* Time of Use Rates Header */}
                                    <Typography variant="h5" sx={{ mb: 2 }}>
                                        Time of Use Rates
                                    </Typography>

                                    {/* Summer Rates */}
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        Summer
                                    </Typography>

                                    <TextField
                                        label="Peak Rate"
                                        type="number"
                                        value={prices.timeOfUse.summerPeakRate}
                                        onChange={(e) => handleTimeOfUseChange("summer", "PeakRate", e.target.value)}
                                        fullWidth
                                        sx={{ maxWidth: 300, mb: 2, mr: 3 }}
                                    />
                                    <TextField
                                        label="Mid-Peak Rate"
                                        type="number"
                                        value={prices.timeOfUse.summerMidPeakRate}
                                        onChange={(e) => handleTimeOfUseChange("summer", "MidPeakRate", e.target.value)}
                                        fullWidth
                                        sx={{ maxWidth: 300, mb: 2, mr: 3 }}
                                    />
                                    <TextField
                                        label="Off-Peak Rate"
                                        type="number"
                                        value={prices.timeOfUse.summerOffPeakRate}
                                        onChange={(e) => handleTimeOfUseChange("summer", "OffPeakRate", e.target.value)}
                                        fullWidth
                                        sx={{ maxWidth: 300, mb: 2 }}
                                    />

                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        Summer Peak Hours
                                    </Typography>
                                    {prices.timeOfUse.summerPeakHours.map((range, index) => (
                                        <Box key={index} sx={{ mb: 2 }}>
                                            <TextField
                                                label="Start"
                                                type="time"
                                                value={range.start}
                                                onChange={(e) =>
                                                    handleHourRangeChange("summer", "PeakHours", index, "start", e.target.value)
                                                }
                                                fullWidth
                                                slotProps={{
                                                    inputLabel: {
                                                        shrink: true,
                                                    },
                                                }}
                                                sx={{ maxWidth: 300, mb: 1, mr: 3 }}
                                            />
                                            <TextField
                                                label="End"
                                                type="time"
                                                value={range.end}
                                                onChange={(e) =>
                                                    handleHourRangeChange("summer", "PeakHours", index, "end", e.target.value)
                                                }
                                                fullWidth
                                                slotProps={{
                                                    inputLabel: {
                                                        shrink: true,
                                                    },
                                                }}
                                                sx={{ maxWidth: 300 }}
                                            />
                                        </Box>
                                    ))}
                                    <Button onClick={() => handleAddHourRange("summer", "PeakHours")} variant="outlined" sx={{ mb: 3, color: "#5A3472", borderColor: "#5A3472" }}>
                                        Add Peak Hour Range
                                    </Button>

                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        Summer Mid-Peak Hours
                                    </Typography>
                                    {prices.timeOfUse.summerMidPeakHours.map((range, index) => (
                                        <Box key={index} sx={{ mb: 2, display: 'flex', gap: 3 }}>
                                            {/* Start Time */}
                                            <TextField
                                                label="Start"
                                                type="time"
                                                value={range.start}
                                                onChange={(e) =>
                                                    handleHourRangeChange("summer", "MidPeakHours", index, "start", e.target.value)
                                                }
                                                fullWidth
                                                slotProps={{
                                                    inputLabel: {
                                                        shrink: true,
                                                    },
                                                }}

                                                sx={{
                                                    maxWidth: 300,
                                                    mb: 1,
                                                }}
                                            />

                                            {/* End Time */}
                                            <TextField
                                                label="End"
                                                type="time"
                                                value={range.end}
                                                onChange={(e) =>
                                                    handleHourRangeChange("summer", "MidPeakHours", index, "end", e.target.value)
                                                }
                                                fullWidth
                                                slotProps={{
                                                    inputLabel: {
                                                        shrink: true,
                                                    },
                                                }}
                                                sx={{
                                                    maxWidth: 300,
                                                }}
                                            />
                                        </Box>
                                    ))}

                                    <Button onClick={() => handleAddHourRange("summer", "MidPeakHours")} variant="outlined" sx={{ mb: 3, color: "#5A3472", borderColor: "#5A3472" }}>
                                        Add Mid-Peak Hour Range
                                    </Button>

                                    {/* Winter Rates */}
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        Winter
                                    </Typography>

                                    <TextField
                                        label="Peak Rate"
                                        type="number"
                                        value={prices.timeOfUse.winterPeakRate}
                                        onChange={(e) => handleTimeOfUseChange("winter", "PeakRate", e.target.value)}
                                        fullWidth
                                        sx={{ maxWidth: 300, mb: 2, mr: 3 }}
                                    />
                                    <TextField
                                        label="Mid-Peak Rate"
                                        type="number"
                                        value={prices.timeOfUse.winterMidPeakRate}
                                        onChange={(e) => handleTimeOfUseChange("winter", "MidPeakRate", e.target.value)}
                                        fullWidth
                                        sx={{ maxWidth: 300, mb: 2, mr: 3 }}
                                    />
                                    <TextField
                                        label="Off-Peak Rate"
                                        type="number"
                                        value={prices.timeOfUse.winterOffPeakRate}
                                        onChange={(e) => handleTimeOfUseChange("winter", "OffPeakRate", e.target.value)}
                                        fullWidth
                                        sx={{ maxWidth: 300, mb: 2 }}
                                    />

                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        Winter Peak Hours
                                    </Typography>
                                    {prices.timeOfUse.winterPeakHours.map((range, index) => (
                                        <Box key={index} sx={{ mb: 2 }}>
                                            <TextField
                                                label="Start"
                                                type="time"
                                                value={range.start}
                                                onChange={(e) =>
                                                    handleHourRangeChange("winter", "PeakHours", index, "start", e.target.value)
                                                }
                                                fullWidth
                                                slotProps={{
                                                    inputLabel: {
                                                        shrink: true,
                                                    },
                                                }}
                                                sx={{ maxWidth: 300, mb: 1, mr: 3 }}
                                            />
                                            <TextField
                                                label="End"
                                                type="time"
                                                value={range.end}
                                                onChange={(e) =>
                                                    handleHourRangeChange("winter", "PeakHours", index, "end", e.target.value)
                                                }
                                                fullWidth
                                                slotProps={{
                                                    inputLabel: {
                                                        shrink: true,
                                                    },
                                                }}
                                                sx={{ maxWidth: 300 }}
                                            />
                                        </Box>
                                    ))}
                                    <Button onClick={() => handleAddHourRange("winter", "PeakHours")} variant="outlined" sx={{ mb: 3, color: "#5A3472", borderColor: "#5A3472" }}>
                                        Add Peak Hour Range
                                    </Button>

                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        Winter Mid-Peak Hours
                                    </Typography>
                                    {prices.timeOfUse.winterMidPeakHours.map((range, index) => (
                                        <Box key={index} sx={{ mb: 2 }}>
                                            <TextField
                                                label="Start"
                                                type="time"
                                                value={range.start}
                                                onChange={(e) =>
                                                    handleHourRangeChange("winter", "MidPeakHours", index, "start", e.target.value)
                                                }
                                                fullWidth
                                                slotProps={{
                                                    inputLabel: {
                                                        shrink: true,
                                                    },
                                                }}
                                                sx={{ maxWidth: 300, mb: 1, mr: 3 }}
                                            />
                                            <TextField
                                                label="End"
                                                type="time"
                                                value={range.end}
                                                onChange={(e) =>
                                                    handleHourRangeChange("winter", "MidPeakHours", index, "end", e.target.value)
                                                }
                                                fullWidth
                                                slotProps={{
                                                    inputLabel: {
                                                        shrink: true,
                                                    },
                                                }}
                                                sx={{ maxWidth: 300 }}
                                            />
                                        </Box>
                                    ))}
                                    <Button onClick={() => handleAddHourRange("winter", "MidPeakHours")} variant="outlined" sx={{ mb: 3, color: "#5A3472", borderColor: "#5A3472" }}>
                                        Add Mid-Peak Hour Range
                                    </Button>
                                </Box>
                            )}
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        <Box
                            sx={{
                                maxWidth: 450,
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                Enter Purchase Capacity
                            </Typography>
                            <TextField
                                label="Purchase Capacity"
                                type="number"
                                value={purchaseCapacity}
                                onChange={(e) => setPurchaseCapacity(e.target.value)}
                                fullWidth
                                variant="outlined"
                                sx={{ maxWidth: 300, width: '100%', mb: 3 }}
                            />

                            <Typography variant="body1" sx={{ mb: 2 }}>
                                Enter Sell Capacity
                            </Typography>
                            <TextField
                                label="Sell Capacity"
                                type="number"
                                value={sellCapacity}
                                onChange={(e) => setSellCapacity(e.target.value)}
                                fullWidth
                                variant="outlined"
                                sx={{ maxWidth: 300, width: '100%', mb: 3 }}
                            />
                        </Box>

                        {/* Compensation */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, margin: 'auto', }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                Select Compensation Option:
                            </Typography>
                            <FormControl fullWidth sx={{ maxWidth: 300, width: '100%' }}>
                                <InputLabel id="compensation-label">Compensation Option</InputLabel>
                                <Select
                                    label='compensation-label'
                                    id='compensation-select'
                                    value={compensation}
                                    onChange={handleCompensationChange}
                                >
                                    <MenuItem value="flatcomp">Flat Compensation</MenuItem>
                                    <MenuItem value="monthlycomp">Monthly Compensation</MenuItem>
                                    <MenuItem value="one-to-one">1:1 Compensation</MenuItem>
                                </Select>
                            </FormControl>

                            {compensation === "flatcomp" && (
                                <TextField
                                    label="Flat Compensation"
                                    type="number"
                                    value={prices.flatComp}
                                    onChange={(e) =>
                                        setPrices({ ...prices, flatComp: e.target.value })
                                    }
                                    sx={{ maxWidth: 300, width: '100%' }}
                                />
                            )}

                            {compensation === "monthlycomp" && (
                                <Box>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        Enter Monthly Prices:
                                    </Typography>

                                    <Grid2 container spacing={2} sx={{ maxWidth: 1000 }}>
                                        {Object.keys(prices.monthlyComp).map((month) => (
                                            <Box key={month} sx={{ mb: 2 }}>

                                                <TextField
                                                    label={`${month} Price:`}
                                                    type="number"
                                                    value={prices.monthlyComp[month]}
                                                    onChange={(e) => handleMonthlyCompChange(month, e.target.value)}
                                                    fullWidth
                                                    sx={{ maxWidth: 300 }}
                                                />
                                            </Box>
                                        ))}
                                    </Grid2>
                                </Box>
                            )}
                        </Box>

                        <Grid2>
                            {!utilityStructure ? (
                                <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                                    Select a utility structure.
                                </Alert>
                            ) : getMissingFields(utilityStructure, prices).length > 0 ? (
                                <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                                    {`Missing required values: ${getMissingFields(utilityStructure, prices).join(', ')}`}
                                </Alert>
                            ) : null}
                        </Grid2>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, maxWidth: 300 }}>
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
                                onClick={handleNext}
                                disabled={!utilityStructure || getMissingFields(utilityStructure, prices).length > 0}
                            >
                                Next
                            </Button>

                        </Box>

                    </>
                )}
            </Box>
        </div >
    );
}


export default GridInfo