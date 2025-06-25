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
    Lead_acid = db.Column(db.Boolean, nullable=False)  # Lead acid battery
    Li_ion = db.Column(db.Boolean, nullable=False)  # Lithium ion battery
    consumption_data_source = db.Column(db.String(50), nullable=True) # hourly, monthly, annual, manual
    consumption_data_path = db.Column(db.String(500), nullable=True) # path to uploaded csv
    
class Grid(db.Model):
    user_id = db.Column(db.String(100), primary_key=True)
    
    # Grid Connection Parameters
    Grid = db.Column(db.Boolean, default=True)  # Is grid connected
    NEM = db.Column(db.Boolean, default=True)  # Is net metered
    
    # Economic Parameters
    Annual_expenses = db.Column(db.Float, default=0.0)  # Annual expenses for Grid interconnection ($)
    Grid_sale_tax_rate = db.Column(db.Float, default=6.88)  # Sale tax percentage of grid electricity (%)
    Grid_Tax_amount = db.Column(db.Float, default=0.0016)  # Grid adjustments in kWh (kWh)
    Grid_escalation_rate = db.Column(db.Float, default=5.7)  # Yearly escalation rate in grid electricity price (%)
    Grid_credit = db.Column(db.Float, default=121.4)  # Annual Credits offered by utility grid to user ($)
    NEM_fee = db.Column(db.Float, default=0.0)  # Net metering one time setup fee ($)
    SC_flat = db.Column(db.Float, default=0.0)  # Grid monthly fixed charge ($/kWh)
    
    # Technical Parameters
    Pbuy_max = db.Column(db.Float, default=6.0)  # Purchase Capacity (kW)
    Psell_max = db.Column(db.Float, default=200.0)  # Sell Capacity (kW) 

    
# --------------------------
# optional modules
# --------------------------

class PhotovoltaicSystem(db.Model):
    user_id = db.Column(db.String(100), primary_key=True)
    
    # System Configuration Parameters
    system_capacity = db.Column(db.Float, nullable=False)  # Total system capacity in kW
    azimuth = db.Column(db.Float, nullable=False)         # Array azimuth angle in degrees
    tilt = db.Column(db.Float, nullable=False)           # Array tilt angle in degrees
    array_type = db.Column(db.Integer, nullable=False)   # Array type (0=fixed, 1=tracking)
    module_type = db.Column(db.Integer, nullable=False)  # Module type (0=standard, 1=premium)
    losses = db.Column(db.Float, nullable=False)         # System losses in %
    
    # Technical Parameters
    fpv = db.Column(db.Float, nullable=False)  # PV derating factor (%)
    Tcof = db.Column(db.Float, nullable=False)  # Temperature coefficient (%/°C)
    Tref = db.Column(db.Float, nullable=False)  # Temperature at standard test condition (°C)
    Tc_noct = db.Column(db.Float, nullable=False)  # Nominal operating cell temperature (°C)
    Ta_noct = db.Column(db.Float, nullable=False)  # Ambient temperature at which NOCT is defined (°C)
    G_noct = db.Column(db.Float, nullable=False)  # Solar radiation at which NOCT is defined (W/m2)
    n_PV = db.Column(db.Float, nullable=False)  # Efficiency of PV module (%/100)
    Gref = db.Column(db.Float, nullable=False)  # Reference irradiance (W/m2)
    L_PV = db.Column(db.Float, nullable=False)  # PV modules' life time (years)
    gama = db.Column(db.Float, nullable=False)  # Temperature coefficient parameter
    
    # Economic Parameters
    C_PV = db.Column(db.Float, nullable=False)  # Capital cost ($/kW)
    R_PV = db.Column(db.Float, nullable=False)  # Replacement Cost of PV modules ($/kW)
    MO_PV = db.Column(db.Float, nullable=False)  # O&M cost ($/year/kw)
    
    # Engineering Costs
    Installation_cost = db.Column(db.Float, nullable=False)  # Installation cost ($/kW)
    Overhead = db.Column(db.Float, nullable=False)  # Overhead ($/kW)
    Sales_and_marketing = db.Column(db.Float, nullable=False)  # Sales and marketing ($/kW)
    Permiting_and_Inspection = db.Column(db.Float, nullable=False)  # Permitting and Inspection ($/kW)
    Electrical_BoS = db.Column(db.Float, nullable=False)  # Electrical BoS ($/kW)
    Structural_BoS = db.Column(db.Float, nullable=False)  # Structural BoS ($/kW)
    Supply_Chain_costs = db.Column(db.Float, nullable=False)  # Supply Chain costs ($/kW)
    Profit_costs = db.Column(db.Float, nullable=False)  # Profit costs ($/kW)
    Sales_tax = db.Column(db.Float, nullable=False)  # Sales tax ($/kW)

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