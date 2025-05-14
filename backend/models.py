from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    simulations = db.relationship('Simulation', backref='user', lazy=True)

class WindTurbine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    simulation_id = db.Column(db.Integer, db.ForeignKey('simulation.id'), nullable=False)
    
    # Technical Parameters
    h_hub = db.Column(db.Float, default=17.0)  # Hub height (m)
    h0 = db.Column(db.Float, default=43.6)  # Anemometer height (m)
    nw = db.Column(db.Float, default=1.0)  # Electrical Efficiency (%)
    v_cut_out = db.Column(db.Float, default=25.0)  # Cut out speed (m/s)
    v_cut_in = db.Column(db.Float, default=2.5)  # Cut in speed (m/s)
    v_rated = db.Column(db.Float, default=9.5)  # Rated speed (m/s)
    alfa_wind_turbine = db.Column(db.Float, default=20.0)  # Coefficient of friction
    L_WT = db.Column(db.Float)  # Life time (Years)
    
    # Economic Parameters
    C_WT = db.Column(db.Float, default=1200.0)  # Capital cost of Wind Turbine ($/kW)
    R_WT = db.Column(db.Float, default=1200.0)  # Replacement cost of Wind Turbine ($/kW)
    MO_WT = db.Column(db.Float, default=40.0)  # O&M cost of Wind Turbine ($/year/kw)

class ChargeController(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    simulation_id = db.Column(db.Integer, db.ForeignKey('simulation.id'), nullable=False)
    
    C_CH = db.Column(db.Float, default=200.0)  # Capital cost of charge controller ($)
    R_CH = db.Column(db.Float, default=200.0)  # Replacement cost of charge controller ($)
    MO_CH = db.Column(db.Float, default=0.0)  # O&M cost of charge controller ($/year)

class GridSelling(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    simulation_id = db.Column(db.Integer, db.ForeignKey('simulation.id'), nullable=False)
    
    sellStructure = db.Column(db.Integer, default=3)  # Selling structure type (1=Flat, 2=Monthly, 3=1:1)
    flat_compensation = db.Column(db.Float, default=0.049)  # Flat compensation rate ($/kWh)
    monthly_sell_prices = db.Column(db.JSON)  # Monthly compensation rates array
    one_to_one_compensation = db.Column(db.Boolean, default=True)  # Whether 1:1 compensation is used

class GeographyEconomy(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    simulation_id = db.Column(db.Integer, db.ForeignKey('simulation.id'), nullable=False)
    
    # Economic Parameters
    n_ir_rate = db.Column(db.Float, default=5.5)  # Nominal discount rate (%)
    e_ir_rate = db.Column(db.Float, default=2.0)  # Expected inflation rate (%)
    Tax_rate = db.Column(db.Float, default=0.0)  # Equipment sale tax percentage (%)
    RE_incentives_rate = db.Column(db.Float, default=0.0)  # Investment tax credit percentage (%)

class SystemConfiguration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    simulation_id = db.Column(db.Integer, db.ForeignKey('simulation.id'), nullable=False)
    
    LPSP_max_rate = db.Column(db.Float, default=0.0999999)  # Maximum loss of power supply probability (%)
    RE_min_rate = db.Column(db.Float, default=75.0)  # Minimum Renewable Energy Capacity percentage (%)
    
    # System Components
    PV = db.Column(db.Boolean, default=False)  # PV system selected
    WT = db.Column(db.Boolean, default=False)  # Wind Turbine selected
    DG = db.Column(db.Boolean, default=False)  # Diesel Generator selected
    Bat = db.Column(db.Boolean, default=False)  # Battery selected
    Lead_acid = db.Column(db.Boolean, default=False)  # Lead Acid battery type
    Li_ion = db.Column(db.Boolean, default=False)  # Li-ion battery type

class PhotovoltaicSystem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    simulation_id = db.Column(db.Integer, db.ForeignKey('simulation.id'), nullable=False)
    
    # Technical Parameters
    fpv = db.Column(db.Float, default=0.9)  # PV derating factor (%)
    Tcof = db.Column(db.Float, default=-0.3)  # Temperature coefficient (%/°C)
    Tref = db.Column(db.Float, default=25.0)  # Temperature at standard test condition (°C)
    Tc_noct = db.Column(db.Float, default=45.0)  # Nominal operating cell temperature (°C)
    Ta_noct = db.Column(db.Float, default=20.0)  # Ambient temperature at which NOCT is defined (°C)
    G_noct = db.Column(db.Float, default=800.0)  # Solar radiation at which NOCT is defined (W/m2)
    n_PV = db.Column(db.Float, default=0.2182)  # Efficiency of PV module (%/100)
    Gref = db.Column(db.Float, default=1000.0)  # Reference irradiance (W/m2)
    L_PV = db.Column(db.Float, default=25.0)  # PV modules' life time (years)
    
    # Economic Parameters
    C_PV = db.Column(db.Float, default=534.54)  # Capital cost ($/kW)
    R_PV = db.Column(db.Float, default=534.54)  # Replacement Cost of PV modules ($/kW)
    MO_PV = db.Column(db.Float, default=28.88)  # O&M cost ($/year/kw)
    
    # Engineering Costs
    Installation_cost = db.Column(db.Float, default=160.0)  # Installation cost ($/kW)
    Overhead = db.Column(db.Float, default=260.0)  # Overhead ($/kW)
    Sales_and_marketing = db.Column(db.Float, default=400.0)  # Sales and marketing ($/kW)
    Permiting_and_Inspection = db.Column(db.Float, default=210.0)  # Permitting and Inspection ($/kW)
    Electrical_BoS = db.Column(db.Float, default=370.0)  # Electrical BoS ($/kW)
    Structural_BoS = db.Column(db.Float, default=160.0)  # Structural BoS ($/kW)
    Supply_Chain_costs = db.Column(db.Float, default=0.0)  # Supply Chain costs ($/kW)
    Profit_costs = db.Column(db.Float, default=340.0)  # Profit costs ($/kW)
    Sales_tax = db.Column(db.Float, default=80.0)  # Sales tax ($/kW)

class Inverter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    simulation_id = db.Column(db.Integer, db.ForeignKey('simulation.id'), nullable=False)
    
    # Technical Parameters
    n_I = db.Column(db.Float, default=0.96)  # Inverter Efficiency (%)
    L_I = db.Column(db.Float, default=25.0)  # Inverter lifetime (years)
    DC_AC_ratio = db.Column(db.Float, default=1.99)  # Maximum acceptable DC to AC ratio
    
    # Economic Parameters
    C_I = db.Column(db.Float, default=440.0)  # Capital cost ($/kW)
    R_I = db.Column(db.Float, default=440.0)  # Replacement cost ($/kW)
    MO_I = db.Column(db.Float, default=3.4)  # O&M cost ($/kW/year)

class DieselGenerator(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    simulation_id = db.Column(db.Integer, db.ForeignKey('simulation.id'), nullable=False)
    
    # Diesel Generator fuel curve
    a = db.Column(db.Float, default=0.273)  # Slope (Liter/hr/kW output)
    b = db.Column(db.Float, default=0.033)  # Intercept coefficient (Liter/hr/kW rate)
    
    # Economic Parameters
    C_DG = db.Column(db.Float, default=240.45)  # Capital cost ($/kW)
    R_DG = db.Column(db.Float, default=240.45)  # Replacement Cost ($/kW)
    MO_DG = db.Column(db.Float, default=0.066)  # O&M cost / Running cost ($/op.h)
    C_fuel = db.Column(db.Float, default=1.428)  # Fuel Cost ($/L)
    C_fuel_adj_rate = db.Column(db.Float, default=2.0)  # DG fuel cost yearly escalation rate (%)

class Battery(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    simulation_id = db.Column(db.Integer, db.ForeignKey('simulation.id'), nullable=False)
    
    # Technical Parameters
    SOC_min = db.Column(db.Float, default=0.1)  # Minimum state of charge (SoC) (%/100)
    SOC_max = db.Column(db.Float, default=1.0)  # Maximum state of charge (SoC) (%/100)
    SOC_initial = db.Column(db.Float, default=0.5)  # Initial state of charge (SoC) (%/100)
    self_discharge_rate = db.Column(db.Float, default=0.0)  # Hourly self-discharge rate (%/100)
    L_B = db.Column(db.Float, default=7.5)  # Battery lifetime (years)
    
    # Lead Acid Battery Parameters
    Cnom_Leadacid = db.Column(db.Float, default=83.4)  # Lead Acid nominal capacity (Ah)
    alfa_battery_leadacid = db.Column(db.Float, default=1.0)  # Storage's maximum charge rate (A/Ah)
    c = db.Column(db.Float, default=0.403)  # Storage capacity ratio
    k = db.Column(db.Float, default=0.827)  # Storage rate constant (1/h)
    Ich_max_leadacid = db.Column(db.Float, default=16.7)  # Storage's maximum charge current (A)
    Vnom_leadacid = db.Column(db.Float, default=12.0)  # Storage's nominal voltage (V)
    ef_bat_leadacid = db.Column(db.Float, default=0.8)  # Round trip efficiency (%/100)
    Q_lifetime_leadacid = db.Column(db.Float, default=8000.0)  # Throughout (kWh)
    
    # Li-ion Battery Parameters
    Ich_max_Li_ion = db.Column(db.Float, default=167.0)  # Storage's maximum charge current (A)
    Idch_max_Li_ion = db.Column(db.Float, default=500.0)  # Storage's maximum discharge current (A)
    alfa_battery_Li_ion = db.Column(db.Float, default=1.0)  # Storage's maximum charge rate (A/Ah)

class Grid(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    simulation_id = db.Column(db.Integer, db.ForeignKey('simulation.id'), nullable=False)
    
    # Grid Connection Parameters
    Grid = db.Column(db.Boolean, default=False)  # Is grid connected
    NEM = db.Column(db.Boolean, default=False)  # Is net metered
    
    # Economic Parameters
    Annual_expenses = db.Column(db.Float, default=0.0)  # Annual expenses for Grid interconnection ($)
    Grid_sale_tax_rate = db.Column(db.Float, default=0.0)  # Sale tax percentage of grid electricity (%)
    Grid_Tax_amount = db.Column(db.Float, default=0.0)  # Grid adjustments in kWh (kWh)
    Grid_escalation_rate = db.Column(db.Float, default=2.0)  # Yearly escalation rate in grid electricity price (%)
    Grid_credit = db.Column(db.Float, default=0.0)  # Annual Credits offered by utility grid to user ($)
    NEM_fee = db.Column(db.Float, default=0.0)  # Net metering one time setup fee ($)
    SC_flat = db.Column(db.Float, default=10.0)  # Grid monthly fixed charge ($/kWh)
    
    # Technical Parameters
    Pbuy_max = db.Column(db.Float, default=6.0)  # Purchase Capacity (kW)
    Psell_max = db.Column(db.Float, default=200.0)  # Sell Capacity (kW)

class Optimization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    simulation_id = db.Column(db.Integer, db.ForeignKey('simulation.id'), nullable=False)
    
    MaxIt = db.Column(db.Integer, default=200)  # Maximum Number of Iterations
    nPop = db.Column(db.Integer, default=50)  # Population Size (Swarm Size)
    w = db.Column(db.Float, default=1.0)  # Inertia Weight
    wdamp = db.Column(db.Float, default=0.99)  # Inertia Weight Damping Ratio
    c1 = db.Column(db.Float, default=2.0)  # Personal Learning Coefficient
    c2 = db.Column(db.Float, default=2.0)  # Global Learning Coefficient

class Simulation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Input parameters
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    system_capacity = db.Column(db.Float)
    azimuth = db.Column(db.Float)
    tilt = db.Column(db.Float)
    array_type = db.Column(db.Integer)
    module_type = db.Column(db.Integer)
    losses = db.Column(db.Float)
    
    # Results
    ac_monthly = db.Column(db.JSON)  # Monthly AC output
    solrad_monthly = db.Column(db.JSON)  # Monthly solar radiation
    dc_monthly = db.Column(db.JSON)  # Monthly DC output
    poa_monthly = db.Column(db.JSON)  # Monthly plane of array irradiance
    
    # Relationships
    wind_turbine = db.relationship('WindTurbine', backref='simulation', uselist=False)
    charge_controller = db.relationship('ChargeController', backref='simulation', uselist=False)
    grid_selling = db.relationship('GridSelling', backref='simulation', uselist=False)
    geography_economy = db.relationship('GeographyEconomy', backref='simulation', uselist=False)
    system_config = db.relationship('SystemConfiguration', backref='simulation', uselist=False)
    pv_system = db.relationship('PhotovoltaicSystem', backref='simulation', uselist=False)
    inverter = db.relationship('Inverter', backref='simulation', uselist=False)
    diesel_generator = db.relationship('DieselGenerator', backref='simulation', uselist=False)
    battery = db.relationship('Battery', backref='simulation', uselist=False)
    grid = db.relationship('Grid', backref='simulation', uselist=False)
    optimization = db.relationship('Optimization', backref='simulation', uselist=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'latitude': self.latitude,
            'longitude': self.longitude,
            'system_capacity': self.system_capacity,
            'azimuth': self.azimuth,
            'tilt': self.tilt,
            'array_type': self.array_type,
            'module_type': self.module_type,
            'losses': self.losses,
            'results': {
                'ac_monthly': self.ac_monthly,
                'solrad_monthly': self.solrad_monthly,
                'dc_monthly': self.dc_monthly,
                'poa_monthly': self.poa_monthly
            },
            'wind_turbine': self.wind_turbine and {
                'h_hub': self.wind_turbine.h_hub,
                'h0': self.wind_turbine.h0,
                'nw': self.wind_turbine.nw,
                'v_cut_out': self.wind_turbine.v_cut_out,
                'v_cut_in': self.wind_turbine.v_cut_in,
                'v_rated': self.wind_turbine.v_rated,
                'alfa_wind_turbine': self.wind_turbine.alfa_wind_turbine,
                'L_WT': self.wind_turbine.L_WT,
                'C_WT': self.wind_turbine.C_WT,
                'R_WT': self.wind_turbine.R_WT,
                'MO_WT': self.wind_turbine.MO_WT
            },
            'charge_controller': self.charge_controller and {
                'C_CH': self.charge_controller.C_CH,
                'R_CH': self.charge_controller.R_CH,
                'MO_CH': self.charge_controller.MO_CH
            },
            'grid_selling': self.grid_selling and {
                'sellStructure': self.grid_selling.sellStructure,
                'flat_compensation': self.grid_selling.flat_compensation,
                'monthly_sell_prices': self.grid_selling.monthly_sell_prices,
                'one_to_one_compensation': self.grid_selling.one_to_one_compensation
            },
            'geography_economy': self.geography_economy and {
                'n_ir_rate': self.geography_economy.n_ir_rate,
                'e_ir_rate': self.geography_economy.e_ir_rate,
                'Tax_rate': self.geography_economy.Tax_rate,
                'RE_incentives_rate': self.geography_economy.RE_incentives_rate
            },
            'system_config': self.system_config and {
                'LPSP_max_rate': self.system_config.LPSP_max_rate,
                'RE_min_rate': self.system_config.RE_min_rate,
                'PV': self.system_config.PV,
                'WT': self.system_config.WT,
                'DG': self.system_config.DG,
                'Bat': self.system_config.Bat,
                'Lead_acid': self.system_config.Lead_acid,
                'Li_ion': self.system_config.Li_ion
            },
            'pv_system': self.pv_system and {
                'fpv': self.pv_system.fpv,
                'Tcof': self.pv_system.Tcof,
                'Tref': self.pv_system.Tref,
                'Tc_noct': self.pv_system.Tc_noct,
                'Ta_noct': self.pv_system.Ta_noct,
                'G_noct': self.pv_system.G_noct,
                'n_PV': self.pv_system.n_PV,
                'Gref': self.pv_system.Gref,
                'L_PV': self.pv_system.L_PV,
                'C_PV': self.pv_system.C_PV,
                'R_PV': self.pv_system.R_PV,
                'MO_PV': self.pv_system.MO_PV,
                'Installation_cost': self.pv_system.Installation_cost,
                'Overhead': self.pv_system.Overhead,
                'Sales_and_marketing': self.pv_system.Sales_and_marketing,
                'Permiting_and_Inspection': self.pv_system.Permiting_and_Inspection,
                'Electrical_BoS': self.pv_system.Electrical_BoS,
                'Structural_BoS': self.pv_system.Structural_BoS,
                'Supply_Chain_costs': self.pv_system.Supply_Chain_costs,
                'Profit_costs': self.pv_system.Profit_costs,
                'Sales_tax': self.pv_system.Sales_tax
            },
            'inverter': self.inverter and {
                'n_I': self.inverter.n_I,
                'L_I': self.inverter.L_I,
                'DC_AC_ratio': self.inverter.DC_AC_ratio,
                'C_I': self.inverter.C_I,
                'R_I': self.inverter.R_I,
                'MO_I': self.inverter.MO_I
            },
            'diesel_generator': self.diesel_generator and {
                'a': self.diesel_generator.a,
                'b': self.diesel_generator.b,
                'C_DG': self.diesel_generator.C_DG,
                'R_DG': self.diesel_generator.R_DG,
                'MO_DG': self.diesel_generator.MO_DG,
                'C_fuel': self.diesel_generator.C_fuel,
                'C_fuel_adj_rate': self.diesel_generator.C_fuel_adj_rate
            },
            'battery': self.battery and {
                'SOC_min': self.battery.SOC_min,
                'SOC_max': self.battery.SOC_max,
                'SOC_initial': self.battery.SOC_initial,
                'self_discharge_rate': self.battery.self_discharge_rate,
                'L_B': self.battery.L_B,
                'Cnom_Leadacid': self.battery.Cnom_Leadacid,
                'alfa_battery_leadacid': self.battery.alfa_battery_leadacid,
                'c': self.battery.c,
                'k': self.battery.k,
                'Ich_max_leadacid': self.battery.Ich_max_leadacid,
                'Vnom_leadacid': self.battery.Vnom_leadacid,
                'ef_bat_leadacid': self.battery.ef_bat_leadacid,
                'Q_lifetime_leadacid': self.battery.Q_lifetime_leadacid,
                'Ich_max_Li_ion': self.battery.Ich_max_Li_ion,
                'Idch_max_Li_ion': self.battery.Idch_max_Li_ion,
                'alfa_battery_Li_ion': self.battery.alfa_battery_Li_ion
            },
            'grid': self.grid and {
                'Grid': self.grid.Grid,
                'NEM': self.grid.NEM,
                'Annual_expenses': self.grid.Annual_expenses,
                'Grid_sale_tax_rate': self.grid.Grid_sale_tax_rate,
                'Grid_Tax_amount': self.grid.Grid_Tax_amount,
                'Grid_escalation_rate': self.grid.Grid_escalation_rate,
                'Grid_credit': self.grid.Grid_credit,
                'NEM_fee': self.grid.NEM_fee,
                'SC_flat': self.grid.SC_flat,
                'Pbuy_max': self.grid.Pbuy_max,
                'Psell_max': self.grid.Psell_max
            },
            'optimization': self.optimization and {
                'MaxIt': self.optimization.MaxIt,
                'nPop': self.optimization.nPop,
                'w': self.optimization.w,
                'wdamp': self.optimization.wdamp,
                'c1': self.optimization.c1,
                'c2': self.optimization.c2
            }
        } 