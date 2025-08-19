from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class GeographyEconomy(db.Model):
    user_id = db.Column(db.String(100), primary_key=True)
    
    # Geographic coordinates (from map selection or manual input)
    latitude = db.Column(db.Float, nullable=False)  # From map selection in frontend
    longitude = db.Column(db.Float, nullable=False)  # From map selection in frontend
    address = db.Column(db.String(500), nullable=False)  # Full address from geocoding
    
    # Economic parameters (from user input in Geography & Economy page)
    n_ir_rate = db.Column(db.Float, nullable=False)  # Nominal discount rate (%)
    e_ir_rate = db.Column(db.Float, nullable=False)  # Expected inflation rate (%)
    Tax_rate = db.Column(db.Float, nullable=False)   # Equipment sales tax rate (%)
    RE_incentives_rate = db.Column(db.Float, nullable=False)  # Renewable energy incentives rate (%)

class Optimization(db.Model):
    user_id = db.Column(db.String(100), primary_key=True)
    
    MaxIt = db.Column(db.Integer, nullable=False)  # Maximum Number of Iterations
    nPop = db.Column(db.Integer, nullable=False)  # Population Size (Swarm Size)
    w = db.Column(db.Float, nullable=False)  # Inertia Weight
    wdamp = db.Column(db.Float, nullable=False)  # Inertia Weight Damping Ratio
    c1 = db.Column(db.Float, nullable=False)  # Personal Learning Coefficient
    c2 = db.Column(db.Float, nullable=False)  # Global Learning Coefficient

class SystemConfig(db.Model):
    user_id = db.Column(db.String(100), primary_key=True)
    
    # System configuration parameters
    lifetime = db.Column(db.Integer, nullable=False)  # System lifetime
    LPSP_max_rate = db.Column(db.Float, nullable=False)  # Loss of Power Supply Probability max rate
    RE_min_rate = db.Column(db.Float, nullable=False)  # Renewable Energy minimum rate
    annualData = db.Column(db.Float, nullable=False)  # Annual data
    PV = db.Column(db.Boolean, nullable=False)  # Photovoltaic system
    WT = db.Column(db.Boolean, nullable=False)  # Wind Turbine
    DG = db.Column(db.Boolean, nullable=False)  # Diesel Generator
    Bat = db.Column(db.Boolean, nullable=False)  # Battery
    consumption_data_source = db.Column(db.String(50), nullable=True) # hourly, monthly, annual, manual
    hourly_consumption = db.Column(db.Text, nullable=True) # path to uploaded csv
    monthly_consumption = db.Column(db.Text, nullable=True)  # JSON array of 12 monthly values

class Grid(db.Model):
    user_id = db.Column(db.String(100), primary_key=True)
    
    # Grid Connection Parameters
    Grid = db.Column(db.Boolean, default=True)  # Is grid connected
    NEM = db.Column(db.Boolean, default=True)  # Is net metered
    
    # Economic Parameters
    Annual_expenses = db.Column(db.Float, default=9.95)  # Annual expenses for Grid interconnection ($)
    Grid_sale_tax_rate = db.Column(db.Float, default=6.88)  # Sale tax percentage of grid electricity (%)
    Grid_Tax_amount = db.Column(db.Float, default=9.95016)  # Grid adjustments in kWh (kWh)
    Grid_escalation_rate = db.Column(db.Float, default=5.7)  # Yearly escalation rate in grid electricity price (%)
    Grid_credit = db.Column(db.Float, default=121.4)  # Annual Credits offered by utility grid to user ($)
    NEM_fee = db.Column(db.Float, default=9.95)  # Net metering one time setup fee ($)
    SC_flat = db.Column(db.Float, default=0)  # Grid monthly fixed charge ($/kWh)
    
    # Technical Parameters
    Pbuy_max = db.Column(db.Float, default=6.0)  # Purchase Capacity (kW)
    Psell_max = db.Column(db.Float, default=200.0)  # Sell Capacity (kW)

    # New fields for off-grid comparison
    season = db.Column(db.Text, nullable=True)  # JSON-encoded list of summer months
    holidays = db.Column(db.Text, nullable=True)  # JSON-encoded list of holidays
    
    # Rate structure fields
    rateStructure = db.Column(db.String(50), nullable=True)  # Rate structure type (flat, tou, seasonal, etc.)
    
    # Flat rate
    flatPrice = db.Column(db.Float, nullable=True)  # Flat rate price
    
    # Seasonal rate
    seasonalPrices = db.Column(db.Text, nullable=True)  # JSON-encoded seasonal prices array [summer, winter]
    
    # Monthly rate
    monthlyPrices = db.Column(db.Text, nullable=True)  # JSON-encoded monthly prices array
    
    # Tiered rate
    tieredPrices = db.Column(db.Text, nullable=True)  # JSON-encoded tiered prices array
    tierMax = db.Column(db.Text, nullable=True)  # JSON-encoded tier max limits array
    
    # Seasonal tiered rate
    seasonalTieredPrices = db.Column(db.Text, nullable=True)  # JSON-encoded seasonal tiered prices
    seasonalTierMax = db.Column(db.Text, nullable=True)  # JSON-encoded seasonal tier max limits
    
    # Monthly tiered rate
    monthlyTieredPrices = db.Column(db.Text, nullable=True)  # JSON-encoded monthly tiered prices
    monthlyTierLimits = db.Column(db.Text, nullable=True)  # JSON-encoded monthly tier limits
    
    # Time of Use rate
    onPrice = db.Column(db.Text, nullable=True)  # JSON-encoded on-peak prices [summer, winter]
    midPrice = db.Column(db.Text, nullable=True)  # JSON-encoded mid-peak prices [summer, winter]
    offPrice = db.Column(db.Text, nullable=True)  # JSON-encoded off-peak prices [summer, winter]
    onHours = db.Column(db.Text, nullable=True)  # JSON-encoded on-peak hours [summer, winter]
    midHours = db.Column(db.Text, nullable=True)  # JSON-encoded mid-peak hours [summer, winter]
    
    # Compensation fields
    compensation_option = db.Column(db.String(50), nullable=True, default='1:1')  # Compensation option (1:1, flat, monthly)
    flat_compensation = db.Column(db.Float, nullable=True)  # Flat compensation value
    monthly_compensation = db.Column(db.Text, nullable=True)  # JSON-encoded monthly compensation prices
    
    # Legacy fields for backward compatibility
    onPeakPrice = db.Column(db.Float, nullable=True)  # On-peak price for TOU rates
    midPeakPrice = db.Column(db.Float, nullable=True)  # Mid-peak price for TOU rates

# --------------------------
# optional modules
# --------------------------

class PhotovoltaicSystem(db.Model):
    user_id = db.Column(db.String(100), primary_key=True)
    fpv = db.Column(db.Float, nullable=False)
    Tcof = db.Column(db.Float, nullable=False)
    Tref = db.Column(db.Float, nullable=False)
    Tc_noct = db.Column(db.Float, nullable=False)
    Ta_noct = db.Column(db.Float, nullable=False)
    G_noct = db.Column(db.Float, nullable=False)
    n_PV = db.Column(db.Float, nullable=False)
    Gref = db.Column(db.Float, nullable=False)
    L_PV = db.Column(db.Float, nullable=False)
    C_PV = db.Column(db.Float, nullable=False)
    R_PV = db.Column(db.Float, nullable=False)
    MO_PV = db.Column(db.Float, nullable=False)
    Installation_cost = db.Column(db.Float, nullable=False)
    Overhead = db.Column(db.Float, nullable=False)
    Sales_and_marketing = db.Column(db.Float, nullable=False)
    Permiting_and_Inspection = db.Column(db.Float, nullable=False)
    Electrical_BoS = db.Column(db.Float, nullable=False)
    Structural_BoS = db.Column(db.Float, nullable=False)
    Supply_Chain_costs = db.Column(db.Float, nullable=False)
    Profit_costs = db.Column(db.Float, nullable=False)
    Sales_tax = db.Column(db.Float, nullable=False)
    azimuth = db.Column(db.Float, nullable=True)
    tilt = db.Column(db.Float, nullable=True)
    soiling = db.Column(db.Float, nullable=True)

class Inverter(db.Model):
    user_id = db.Column(db.String(100), primary_key=True)
    
    # Technical Parameters
    n_I = db.Column(db.Float, nullable=False)  # Inverter Efficiency (%)
    L_I = db.Column(db.Float, nullable=False)  # Inverter lifetime (years)
    DC_AC_ratio = db.Column(db.Float, nullable=False)  # Maximum acceptable DC to AC ratio
    
    # Economic Parameters
    C_I = db.Column(db.Float, nullable=False)  # Capital cost ($/kW)
    R_I = db.Column(db.Float, nullable=False)  # Replacement cost ($/kW)
    MO_I = db.Column(db.Float, nullable=False)  # O&M cost ($/kW/year)

class DieselGenerator(db.Model):
    user_id = db.Column(db.String(100), primary_key=True)
    
    # Diesel Generator fuel curve
    a = db.Column(db.Float, nullable=False)  # Slope (Liter/hr/kW output)
    b = db.Column(db.Float, nullable=False)  # Intercept coefficient (Liter/hr/kW rate)
    min_load_ratio = db.Column(db.Float, nullable=False)  # Minimum load ratio
    
    # Economic Parameters
    C_DG = db.Column(db.Float, nullable=False)  # Capital cost ($/kW)
    R_DG = db.Column(db.Float, nullable=False)  # Replacement Cost ($/kW)
    MO_DG = db.Column(db.Float, nullable=False)  # O&M cost / Running cost ($/op.h)
    C_fuel = db.Column(db.Float, nullable=False)  # Fuel Cost ($/L)
    C_fuel_adj_rate = db.Column(db.Float, nullable=False)  # DG fuel cost yearly escalation rate (%)
    diesel_lifetime = db.Column(db.Float, nullable=False)  # Diesel generator lifetime in hours

class Battery(db.Model):
    user_id = db.Column(db.String(100), primary_key=True)
    
    # Battery Type Selection
    Lead_acid = db.Column(db.Boolean, nullable=False, default=False)  # Lead Acid battery selected
    Li_ion = db.Column(db.Boolean, nullable=False, default=False)  # Li-ion battery selected
    
    # Technical Parameters
    SOC_min = db.Column(db.Float, nullable=False)  # Minimum state of charge (SoC) (%/100)
    SOC_max = db.Column(db.Float, nullable=False)  # Maximum state of charge (SoC) (%/100)
    SOC_initial = db.Column(db.Float, nullable=False)  # Initial state of charge (SoC) (%/100)
    self_discharge_rate = db.Column(db.Float, nullable=False)  # Hourly self-discharge rate (%/100)
    L_B = db.Column(db.Float, nullable=False)  # Battery lifetime (years)
    
    # Lead Acid Battery Parameters
    Cnom_Leadacid = db.Column(db.Float, nullable=False)  # Lead Acid nominal capacity (Ah)
    alfa_battery_leadacid = db.Column(db.Float, nullable=False)  # Storage's maximum charge rate (A/Ah)
    c = db.Column(db.Float, nullable=False)  # Storage capacity ratio
    k = db.Column(db.Float, nullable=False)  # Storage rate constant (1/h)
    Ich_max_leadacid = db.Column(db.Float, nullable=False)  # Storage's maximum charge current (A)
    Vnom_leadacid = db.Column(db.Float, nullable=False)  # Storage's nominal voltage (V)
    ef_bat_leadacid = db.Column(db.Float, nullable=False)  # Round trip efficiency (%/100)
    Q_lifetime_leadacid = db.Column(db.Float, nullable=False)  # Throughout (kWh)
    
    # Li-ion Battery Parameters
    Ich_max_Li_ion = db.Column(db.Float, nullable=False)  # Storage's maximum charge current (A)
    Idch_max_Li_ion = db.Column(db.Float, nullable=False)  # Storage's maximum discharge current (A)
    alfa_battery_Li_ion = db.Column(db.Float, nullable=False)  # Storage's maximum charge rate (A/Ah)
    Vnom_Li_ion = db.Column(db.Float, nullable=False)  # Storage's nominal voltage (V)
    ef_bat_Li = db.Column(db.Float, nullable=False)  # Round trip efficiency (%/100)
    Cnom_Li = db.Column(db.Float, nullable=False)  # Li-ion nominal capacity (Ah)
    Q_lifetime_Li = db.Column(db.Float, nullable=False)  # Throughout (kWh)
    L_B_Li = db.Column(db.Float, nullable=False)  # Battery lifetime (years)
    
    # Economic Parameters
    C_B = db.Column(db.Float, nullable=False)  # Capital cost ($/kWh)
    R_B = db.Column(db.Float, nullable=False)  # Replacement cost ($/kWh)
    MO_B = db.Column(db.Float, nullable=False)  # O&M cost ($/kWh/year)

class WindTurbine(db.Model):
    user_id = db.Column(db.String(100), primary_key=True)
    
    # Technical Parameters
    Pwt_r = db.Column(db.Float, nullable=False)  # Rated power (kW)
    h_hub = db.Column(db.Float, nullable=False)  # Hub height (m)
    h0 = db.Column(db.Float, nullable=False)  # Anemometer height (m)
    nw = db.Column(db.Float, nullable=False)  # Electrical Efficiency (%)
    v_cut_out = db.Column(db.Float, nullable=False)  # Cut out speed (m/s)
    v_cut_in = db.Column(db.Float, nullable=False)  # Cut in speed (m/s)
    v_rated = db.Column(db.Float, nullable=False)  # Rated speed (m/s)
    alfa_wind_turbine = db.Column(db.Float, nullable=False)  # Coefficient of friction
    L_WT = db.Column(db.Float, nullable=False)  # Life time (years)
    
    # Economic Parameters
    C_WT = db.Column(db.Float, nullable=False)  # Capital cost of Wind Turbine ($/kW)
    R_WT = db.Column(db.Float, nullable=False)  # Replacement cost of Wind Turbine ($/kW)
    MO_WT = db.Column(db.Float, nullable=False)  # O&M cost of Wind Turbine ($/year/kw)
    
    # Wind Resource Parameters
    Weibull_k = db.Column(db.Float, nullable=False)  # Weibull shape parameter
    Weibull_c = db.Column(db.Float, nullable=False)  # Weibull scale parameter (m/s)
    Wind_speed = db.Column(db.Float, nullable=False)  # Average wind speed (m/s)
