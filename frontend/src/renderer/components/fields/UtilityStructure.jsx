import React from 'react';
import {
  Typography,
  TextField,
  Box,
  Button,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  Grid
} from "@mui/material";

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const rateStructures = [
  { value: 'flat', label: 'Flat Rate' },
  { value: 'seasonal', label: 'Seasonal Rate' },
  { value: 'monthly', label: 'Monthly Rate' },
  { value: 'tiered', label: 'Tiered Rate' },
  { value: 'seasonalTiered', label: 'Seasonal Tiered Rate' },
  { value: 'monthlyTiered', label: 'Monthly Tiered Rate' },
  { value: 'tou', label: 'Time of Use' },
];

const UtilityStructure = ({
  rateStructure,
  setRateStructure,
  flatPrice,
  setFlatPrice,
  summerPrice,
  setSummerPrice,
  winterPrice,
  setWinterPrice,
  monthlyPrices,
  setMonthlyPrices,
  lowTierPrice,
  setLowTierPrice,
  mediumTierPrice,
  setMediumTierPrice,
  highTierPrice,
  setHighTierPrice,
  lowTierMaxLoad,
  setLowTierMaxLoad,
  mediumTierMaxLoad,
  setMediumTierMaxLoad,
  highTierMaxLoad,
  setHighTierMaxLoad,
  summerLowTierPrice,
  setSummerLowTierPrice,
  summerMediumTierPrice,
  setSummerMediumTierPrice,
  summerHighTierPrice,
  setSummerHighTierPrice,
  summerLowTierMaxLoad,
  setSummerLowTierMaxLoad,
  summerMediumTierMaxLoad,
  setSummerMediumTierMaxLoad,
  summerHighTierMaxLoad,
  setSummerHighTierMaxLoad,
  winterLowTierPrice,
  setWinterLowTierPrice,
  winterMediumTierPrice,
  setWinterMediumTierPrice,
  winterHighTierPrice,
  setWinterHighTierPrice,
  winterLowTierMaxLoad,
  setWinterLowTierMaxLoad,
  winterMediumTierMaxLoad,
  setWinterMediumTierMaxLoad,
  winterHighTierMaxLoad,
  setWinterHighTierMaxLoad,
  monthlyTieredPrices,
  setMonthlyTieredPrices,
  monthlyTieredMaxLoads,
  setMonthlyTieredMaxLoads,
  summerOnPeakPrice,
  setSummerOnPeakPrice,
  summerMidPeakPrice,
  setSummerMidPeakPrice,
  summerOffPeakPrice,
  setSummerOffPeakPrice,
  winterOnPeakPrice,
  setWinterOnPeakPrice,
  winterMidPeakPrice,
  setWinterMidPeakPrice,
  winterOffPeakPrice,
  setWinterOffPeakPrice,
  summerPeakHours,
  setSummerPeakHours,
  summerMidPeakHours,
  setSummerMidPeakHours,
  winterPeakHours,
  setWinterPeakHours,
  winterMidPeakHours,
  setWinterMidPeakHours
}) => {
  const handleMonthlyTieredChange = (month, field, value) => {
    setMonthlyTieredPrices(prev => ({
      ...prev,
      [month]: {
        ...prev[month],
        [field]: value
      }
    }));
  };

  const handleMonthlyTieredMaxLoadChange = (month, field, value) => {
    setMonthlyTieredMaxLoads(prev => ({
      ...prev,
      [month]: {
        ...prev[month],
        [field]: value
      }
    }));
  };

  const addHourRange = (type, season) => {
    const newRange = { start: '', end: '' };
    if (type === 'peak' && season === 'summer') {
      setSummerPeakHours([...summerPeakHours, newRange]);
    } else if (type === 'midPeak' && season === 'summer') {
      setSummerMidPeakHours([...summerMidPeakHours, newRange]);
    } else if (type === 'peak' && season === 'winter') {
      setWinterPeakHours([...winterPeakHours, newRange]);
    } else if (type === 'midPeak' && season === 'winter') {
      setWinterMidPeakHours([...winterMidPeakHours, newRange]);
    }
  };

  const updateHourRange = (type, season, index, field, value) => {
    if (type === 'peak' && season === 'summer') {
      const updated = [...summerPeakHours];
      updated[index][field] = value;
      setSummerPeakHours(updated);
    } else if (type === 'midPeak' && season === 'summer') {
      const updated = [...summerMidPeakHours];
      updated[index][field] = value;
      setSummerMidPeakHours(updated);
    } else if (type === 'peak' && season === 'winter') {
      const updated = [...winterPeakHours];
      updated[index][field] = value;
      setWinterPeakHours(updated);
    } else if (type === 'midPeak' && season === 'winter') {
      const updated = [...winterMidPeakHours];
      updated[index][field] = value;
      setWinterMidPeakHours(updated);
    }
  };

  const removeHourRange = (type, season, index) => {
    if (type === 'peak' && season === 'summer') {
      setSummerPeakHours(summerPeakHours.filter((_, i) => i !== index));
    } else if (type === 'midPeak' && season === 'summer') {
      setSummerMidPeakHours(summerMidPeakHours.filter((_, i) => i !== index));
    } else if (type === 'peak' && season === 'winter') {
      setWinterPeakHours(winterPeakHours.filter((_, i) => i !== index));
    } else if (type === 'midPeak' && season === 'winter') {
      setWinterMidPeakHours(winterMidPeakHours.filter((_, i) => i !== index));
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Select a Utility Structure:
      </Typography>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="rate-structure-label">Rate Structure</InputLabel>
        <Select
          labelId="rate-structure-label"
          value={rateStructure}
          onChange={e => setRateStructure(e.target.value)}
          input={<OutlinedInput label="Rate Structure" />}
        >
          {rateStructures.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Flat Rate */}
      {rateStructure === 'flat' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h4" gutterBottom>
            Flat Rate
          </Typography>
          <TextField
            fullWidth
            label="Flat Price"
            value={flatPrice}
            onChange={e => setFlatPrice(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            placeholder="Enter flat rate price"
          />
        </Box>
      )}

      {/* Seasonal Rate */}
      {rateStructure === 'seasonal' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h4" gutterBottom>
            Seasonal Rate
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Summer Price"
              value={summerPrice}
              onChange={e => setSummerPrice(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              placeholder="Summer Price"
            />
            <TextField
              fullWidth
              label="Winter Price"
              value={winterPrice}
              onChange={e => setWinterPrice(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              placeholder="Winter Price"
            />
          </Box>
        </Box>
      )}

      {/* Monthly Rate */}
      {rateStructure === 'monthly' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h4" gutterBottom>
            Enter Monthly Prices:
          </Typography>
          <Grid container spacing={2}>
            {monthNames.map(month => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={month}>
                <TextField
                  fullWidth
                  label={`${month} Price:`}
                  value={monthlyPrices[month]}
                  onChange={e => setMonthlyPrices(prev => ({ ...prev, [month]: e.target.value }))}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  placeholder={`${month} Price:`}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Tiered Rate */}
      {rateStructure === 'tiered' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h4" gutterBottom>
            Tiered Rate
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Low Tier Price:"
                  value={lowTierPrice}
                  onChange={e => setLowTierPrice(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  placeholder="Low Tier Price:"
                />
                <TextField
                  fullWidth
                  label="Medium Tier Price:"
                  value={mediumTierPrice}
                  onChange={e => setMediumTierPrice(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  placeholder="Medium Tier Price:"
                />
                <TextField
                  fullWidth
                  label="High Tier Price:"
                  value={highTierPrice}
                  onChange={e => setHighTierPrice(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  placeholder="High Tier Price:"
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Low Tier Max Load (kWh):"
                  value={lowTierMaxLoad}
                  onChange={e => setLowTierMaxLoad(e.target.value)}
                  placeholder="Low Tier Max Load (kWh):"
                />
                <TextField
                  fullWidth
                  label="Medium Tier Max Load (kWh):"
                  value={mediumTierMaxLoad}
                  onChange={e => setMediumTierMaxLoad(e.target.value)}
                  placeholder="Medium Tier Max Load (kWh):"
                />
                <TextField
                  fullWidth
                  label="High Tier Max Load (kWh):"
                  value={highTierMaxLoad}
                  onChange={e => setHighTierMaxLoad(e.target.value)}
                  placeholder="High Tier Max Load (kWh):"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Seasonal Tiered Rate */}
      {rateStructure === 'seasonalTiered' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h4" gutterBottom>
            Seasonal Tiered Rate
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" component="h5" gutterBottom>
                Summer Rates
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Low Tier Price"
                  value={summerLowTierPrice}
                  onChange={e => setSummerLowTierPrice(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  placeholder="Low Tier Price"
                />
                <TextField
                  fullWidth
                  label="Low Tier Max Load"
                  value={summerLowTierMaxLoad}
                  onChange={e => setSummerLowTierMaxLoad(e.target.value)}
                  placeholder="Low Tier Max Load"
                />
                <TextField
                  fullWidth
                  label="Medium Tier Price"
                  value={summerMediumTierPrice}
                  onChange={e => setSummerMediumTierPrice(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  placeholder="Medium Tier Price"
                />
                <TextField
                  fullWidth
                  label="Medium Tier Max Load"
                  value={summerMediumTierMaxLoad}
                  onChange={e => setSummerMediumTierMaxLoad(e.target.value)}
                  placeholder="Medium Tier Max Load"
                />
                <TextField
                  fullWidth
                  label="High Tier Price"
                  value={summerHighTierPrice}
                  onChange={e => setSummerHighTierPrice(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  placeholder="High Tier Price"
                />
                <TextField
                  fullWidth
                  label="High Tier Max Load"
                  value={summerHighTierMaxLoad}
                  onChange={e => setSummerHighTierMaxLoad(e.target.value)}
                  placeholder="High Tier Max Load"
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" component="h5" gutterBottom>
                Winter Rates
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Low Tier Price"
                  value={winterLowTierPrice}
                  onChange={e => setWinterLowTierPrice(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  placeholder="Low Tier Price"
                />
                <TextField
                  fullWidth
                  label="Low Tier Max Load"
                  value={winterLowTierMaxLoad}
                  onChange={e => setWinterLowTierMaxLoad(e.target.value)}
                  placeholder="Low Tier Max Load"
                />
                <TextField
                  fullWidth
                  label="Medium Tier Price"
                  value={winterMediumTierPrice}
                  onChange={e => setWinterMediumTierPrice(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  placeholder="Medium Tier Price"
                />
                <TextField
                  fullWidth
                  label="Medium Tier Max Load"
                  value={winterMediumTierMaxLoad}
                  onChange={e => setWinterMediumTierMaxLoad(e.target.value)}
                  placeholder="Medium Tier Max Load"
                />
                <TextField
                  fullWidth
                  label="High Tier Price"
                  value={winterHighTierPrice}
                  onChange={e => setWinterHighTierPrice(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  placeholder="High Tier Price"
                />
                <TextField
                  fullWidth
                  label="High Tier Max Load"
                  value={winterHighTierMaxLoad}
                  onChange={e => setWinterHighTierMaxLoad(e.target.value)}
                  placeholder="High Tier Max Load"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Monthly Tiered Rate */}
      {rateStructure === 'monthlyTiered' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h4" gutterBottom>
            Monthly Tiered Rates
          </Typography>
          {monthNames.map(month => (
            <Box key={month} sx={{ mb: 4 }}>
              <Typography variant="subtitle1" component="h5" gutterBottom>
                {month}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Low Tier Price"
                      value={monthlyTieredPrices[month]?.lowTierPrice || ''}
                      onChange={e => handleMonthlyTieredChange(month, 'lowTierPrice', e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      placeholder="Low Tier Price"
                    />
                    <TextField
                      fullWidth
                      label="Low Tier Max Load"
                      value={monthlyTieredMaxLoads[month]?.lowTierMaxLoad || ''}
                      onChange={e => handleMonthlyTieredMaxLoadChange(month, 'lowTierMaxLoad', e.target.value)}
                      placeholder="Low Tier Max Load"
                    />
                    <TextField
                      fullWidth
                      label="Medium Tier Price"
                      value={monthlyTieredPrices[month]?.mediumTierPrice || ''}
                      onChange={e => handleMonthlyTieredChange(month, 'mediumTierPrice', e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      placeholder="Medium Tier Price"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Medium Tier Max Load"
                      value={monthlyTieredMaxLoads[month]?.mediumTierMaxLoad || ''}
                      onChange={e => handleMonthlyTieredMaxLoadChange(month, 'mediumTierMaxLoad', e.target.value)}
                      placeholder="Medium Tier Max Load"
                    />
                    <TextField
                      fullWidth
                      label="High Tier Price"
                      value={monthlyTieredPrices[month]?.highTierPrice || ''}
                      onChange={e => handleMonthlyTieredChange(month, 'highTierPrice', e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      placeholder="High Tier Price"
                    />
                    <TextField
                      fullWidth
                      label="High Tier Max Load"
                      value={monthlyTieredMaxLoads[month]?.highTierMaxLoad || ''}
                      onChange={e => handleMonthlyTieredMaxLoadChange(month, 'highTierMaxLoad', e.target.value)}
                      placeholder="High Tier Max Load"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>
      )}

      {/* Time of Use */}
      {rateStructure === 'tou' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h4" gutterBottom>
            Time of Use Rates
          </Typography>
          
          {/* Summer Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" component="h5" gutterBottom>
              Summer
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                label="Peak Rate"
                value={summerOnPeakPrice}
                onChange={e => setSummerOnPeakPrice(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                fullWidth
              />
              <TextField
                label="Mid-Peak Rate"
                value={summerMidPeakPrice}
                onChange={e => setSummerMidPeakPrice(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                fullWidth
              />
              <TextField
                label="Off-Peak Rate"
                value={summerOffPeakPrice}
                onChange={e => setSummerOffPeakPrice(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                fullWidth
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" component="h6" gutterBottom>
                Summer Peak Hours
              </Typography>
              <Button
                variant="outlined"
                onClick={() => addHourRange('peak', 'summer')}
                sx={{ borderColor: 'purple', color: 'purple' }}
              >
                ADD PEAK HOUR RANGE
              </Button>
              {summerPeakHours.map((range, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <TextField
                    type="time"
                    value={range.start}
                    onChange={(e) => updateHourRange('peak', 'summer', index, 'start', e.target.value)}
                    placeholder="Start time"
                    sx={{ flex: 1 }}
                  />
                  <Typography variant="body1" sx={{ mx: 1 }}>→</Typography>
                  <TextField
                    type="time"
                    value={range.end}
                    onChange={(e) => updateHourRange('peak', 'summer', index, 'end', e.target.value)}
                    placeholder="End time"
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeHourRange('peak', 'summer', index)}
                    size="small"
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" component="h6" gutterBottom>
                Summer Mid-Peak Hours
              </Typography>
              <Button
                variant="outlined"
                onClick={() => addHourRange('midPeak', 'summer')}
                sx={{ borderColor: 'purple', color: 'purple' }}
              >
                ADD MID-PEAK HOUR RANGE
              </Button>
              {summerMidPeakHours.map((range, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <TextField
                    type="time"
                    value={range.start}
                    onChange={(e) => updateHourRange('midPeak', 'summer', index, 'start', e.target.value)}
                    placeholder="Start time"
                    sx={{ flex: 1 }}
                  />
                  <Typography variant="body1" sx={{ mx: 1 }}>→</Typography>
                  <TextField
                    type="time"
                    value={range.end}
                    onChange={(e) => updateHourRange('midPeak', 'summer', index, 'end', e.target.value)}
                    placeholder="End time"
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeHourRange('midPeak', 'summer', index)}
                    size="small"
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
          
          {/* Winter Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" component="h5" gutterBottom>
              Winter
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                label="Peak Rate"
                value={winterOnPeakPrice}
                onChange={e => setWinterOnPeakPrice(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                fullWidth
              />
              <TextField
                label="Mid-Peak Rate"
                value={winterMidPeakPrice}
                onChange={e => setWinterMidPeakPrice(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                fullWidth
              />
              <TextField
                label="Off-Peak Rate"
                value={winterOffPeakPrice}
                onChange={e => setWinterOffPeakPrice(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                fullWidth
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" component="h6" gutterBottom>
                Winter Peak Hours
              </Typography>
              <Button
                variant="outlined"
                onClick={() => addHourRange('peak', 'winter')}
                sx={{ borderColor: 'purple', color: 'purple' }}
              >
                ADD PEAK HOUR RANGE
              </Button>
              {winterPeakHours.map((range, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <TextField
                    type="time"
                    value={range.start}
                    onChange={(e) => updateHourRange('peak', 'winter', index, 'start', e.target.value)}
                    placeholder="Start time"
                    sx={{ flex: 1 }}
                  />
                  <Typography variant="body1" sx={{ mx: 1 }}>→</Typography>
                  <TextField
                    type="time"
                    value={range.end}
                    onChange={(e) => updateHourRange('peak', 'winter', index, 'end', e.target.value)}
                    placeholder="End time"
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeHourRange('peak', 'winter', index)}
                    size="small"
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" component="h6" gutterBottom>
                Winter Mid-Peak Hours
              </Typography>
              <Button
                variant="outlined"
                onClick={() => addHourRange('midPeak', 'winter')}
                sx={{ borderColor: 'purple', color: 'purple' }}
              >
                ADD MID-PEAK HOUR RANGE
              </Button>
              {winterMidPeakHours.map((range, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <TextField
                    type="time"
                    value={range.start}
                    onChange={(e) => updateHourRange('midPeak', 'winter', index, 'start', e.target.value)}
                    placeholder="Start time"
                    sx={{ flex: 1 }}
                  />
                  <Typography variant="body1" sx={{ mx: 1 }}>→</Typography>
                  <TextField
                    type="time"
                    value={range.end}
                    onChange={(e) => updateHourRange('midPeak', 'winter', index, 'end', e.target.value)}
                    placeholder="End time"
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeHourRange('midPeak', 'winter', index)}
                    size="small"
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UtilityStructure; 