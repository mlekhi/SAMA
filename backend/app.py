from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase_admin import credentials, initialize_app, auth
import os
from functools import wraps
import logging
import json
from models import db, GeographyEconomy, Optimization, SystemConfig, Grid, PhotovoltaicSystem, Inverter, DieselGenerator, Battery
from config import Config
from sama_python.Results import Gen_Results, output_logs
import pandas as pd
from types import SimpleNamespace
import numpy as np
from sama_python.generic_load import generic_load

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize database
db.init_app(app)

# Configure CORS
CORS(app, 
     resources={r"/*": {
         "origins": [
             "http://localhost:3000",
             "http://127.0.0.1:3000",
             "http://localhost:5173",
             "http://127.0.0.1:5173"
         ],
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization"],
         "supports_credentials": True
     }},
     supports_credentials=True
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Firebase Admin with service account
with open('firebase_service_account.json') as f:
    service_account = json.load(f)

cred = credentials.Certificate(service_account)
firebase_app = initialize_app(cred)

# Logging decorator to show function inputs
# GET RID OF LATER!!!!
def log_function_input(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        func_name = f.__name__
        logger.info(f"=== {func_name} called ===")
        logger.info(f"Args: {args}")
        logger.info(f"Kwargs: {kwargs}")
        
        # Log request data if it's a Flask request
        if hasattr(request, 'get_json'):
            try:
                request_data = request.get_json()
                logger.info(f"Request JSON: {request_data}")
            except:
                logger.info("No JSON data in request")
        
        if hasattr(request, 'headers'):
            logger.info(f"Headers: {dict(request.headers)}")
        
        result = f(*args, **kwargs)
        logger.info(f"=== {func_name} completed ===")
        return result
    return decorated_function

# Authentication decorator
def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'No authorization header'}), 401
        
        try:
            token = auth_header.split('Bearer ')[1]
            decoded_token = auth.verify_id_token(token)
            request.user = decoded_token
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return jsonify({'error': 'Invalid token'}), 401
            
    return decorated_function

# Health check endpoint
@app.route('/api/health', methods=['GET'])
@log_function_input
def health_check():
    return jsonify({'status': 'healthy'}), 200

@app.route('/api/geography-economy', methods=['POST'])
@require_auth
@log_function_input
def save_geography_economy():
    try:
        user_id = request.user['uid']
        data = request.get_json()
        
        # Check if record exists
        geo_economy = GeographyEconomy.query.get(user_id)
        if not geo_economy:
            geo_economy = GeographyEconomy(user_id=user_id)
            db.session.add(geo_economy)
        
        # Update fields
        geo_economy.latitude = data.get('latitude')
        geo_economy.longitude = data.get('longitude')
        geo_economy.address = data.get('address')
        geo_economy.n_ir_rate = data.get('n_ir_rate')
        geo_economy.e_ir_rate = data.get('e_ir_rate')
        geo_economy.Tax_rate = data.get('Tax_rate')
        geo_economy.RE_incentives_rate = data.get('RE_incentives_rate')
        
        db.session.commit()
        return jsonify({'id': geo_economy.user_id, 'message': 'Geography and economy data saved successfully'}), 200
    except Exception as e:
        logger.error(f"Error saving geography economy data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/optimization', methods=['POST'])
@require_auth
@log_function_input
def save_optimization():
    try:
        user_id = request.user['uid']
        data = request.get_json()
        
        # Check if record exists
        optimization = Optimization.query.get(user_id)
        if not optimization:
            optimization = Optimization(user_id=user_id)
            db.session.add(optimization)
        
        # Update fields
        optimization.MaxIt = data.get('maxIterations')
        optimization.nPop = data.get('populationSize')
        optimization.w = data.get('inertiaWeight')
        optimization.wdamp = data.get('inertiaWeightDamping')
        optimization.c1 = data.get('personalLearningCoeff')
        optimization.c2 = data.get('globalLearningCoeff')
        
        db.session.commit()
        return jsonify({'id': optimization.user_id, 'message': 'Optimization data saved successfully'}), 200
    except Exception as e:
        logger.error(f"Error saving optimization data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/system-config', methods=['POST'])
@require_auth
@log_function_input
def save_system_config():
    try:
        user_id = request.user['uid']
        data = request.get_json()
        
        # Check if record exists
        system_config = SystemConfig.query.get(user_id)
        if not system_config:
            system_config = SystemConfig(user_id=user_id)
            db.session.add(system_config)
        
        # Update fields
        system_config.lifetime = data.get('lifetime')
        system_config.LPSP_max_rate = data.get('LPSP_max_rate')
        system_config.RE_min_rate = data.get('RE_min_rate')
        system_config.annualData = data.get('annualData')
        system_config.PV = data.get('PV')
        system_config.WT = data.get('WT')
        system_config.DG = data.get('DG')
        system_config.Bat = data.get('Bat')
        system_config.Lead_acid = data.get('Lead_acid')
        system_config.Li_ion = data.get('Li_ion')
        
        db.session.commit()
        return jsonify({'id': system_config.user_id, 'message': 'System configuration data saved successfully'}), 200
    except Exception as e:
        logger.error(f"Error saving system configuration data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/grid', methods=['POST'])
@require_auth
@log_function_input
def save_grid():
    try:
        user_id = request.user['uid']
        data = request.get_json()
        
        # Check if record exists
        grid = Grid.query.get(user_id)
        if not grid:
            grid = Grid(user_id=user_id)
            db.session.add(grid)
        
        # Update fields dynamically
        for key, value in data.items():
            if hasattr(grid, key):
                setattr(grid, key, value)
        
        db.session.commit()
        return jsonify({'id': grid.user_id, 'message': 'Grid data saved successfully'}), 200
    except Exception as e:
        logger.error(f"Error saving grid data: {str(e)}")
        return jsonify({'error': str(e)}), 500

class InData:
    def __init__(self, user_id):
        self.user_id = user_id
        self.load_user_data()
        self.load_static_data()

    def load_user_data(self):
        # Load data from database
        geo_econ = GeographyEconomy.query.get(self.user_id)
        opt = Optimization.query.get(self.user_id)
        sys_config = SystemConfig.query.get(self.user_id)
        pv_system = PhotovoltaicSystem.query.get(self.user_id)
        inverter = Inverter.query.get(self.user_id)
        diesel = DieselGenerator.query.get(self.user_id)
        battery = Battery.query.get(self.user_id)
        grid = Grid.query.get(self.user_id)

        # --- SystemConfig ---
        self.WT = sys_config.WT
        self.n = sys_config.lifetime
        self.LPSP_max = sys_config.LPSP_max_rate
        self.RE_min = sys_config.RE_min_rate
        self.Lead_acid = sys_config.Lead_acid
        self.Li_ion = sys_config.Li_ion
        
        # Add missing variables for optimization
        self.PV = sys_config.PV if sys_config else 1
        self.Bat = sys_config.Bat if sys_config else 1
        self.DG = sys_config.DG if sys_config else 1
        
        # Load annual consumption data
        self.annualData = sys_config.annualData if sys_config else 10000  # Default to 10,000 kWh/year -- is this valid?

        # --- Grid ---
        self.Grid = grid.Grid
        self.NEM = grid.NEM
        self.Annual_expenses = grid.Annual_expenses
        self.Grid_Tax = grid.Grid_sale_tax_rate / 100
        self.Grid_Tax_amount = grid.Grid_Tax_amount
        self.Grid_escalation = grid.Grid_escalation_rate / 100
        self.Grid_credit = grid.Grid_credit
        self.NEM_fee = grid.NEM_fee
        self.Service_charge = grid.SC_flat 
        self.Pbuy_max = grid.Pbuy_max
        self.Psell_max = grid.Psell_max

        # --- PhotovoltaicSystem ---
        self.fpv = pv_system.fpv if pv_system else 0.9
        self.Tcof = pv_system.Tcof if pv_system else -0.4
        self.Tref = pv_system.Tref if pv_system else 25
        self.Tc_noct = pv_system.Tc_noct if pv_system else 45
        self.Ta_noct = pv_system.Ta_noct if pv_system else 20
        self.G_noct = pv_system.G_noct if pv_system else 800
        self.n_PV = pv_system.n_PV if pv_system else 0.15
        self.Gref = pv_system.Gref if pv_system else 1000
        self.L_PV = pv_system.L_PV if pv_system else 25
        self.gama = pv_system.gama if pv_system else 0.9
        self.C_PV = pv_system.C_PV if pv_system else 1000
        self.R_PV = pv_system.R_PV if pv_system else 800
        self.MO_PV = pv_system.MO_PV if pv_system else 10
        self.Engineering_Costs = sum([
            pv_system.Installation_cost or 0, pv_system.Overhead or 0, pv_system.Sales_and_marketing or 0,
            pv_system.Permiting_and_Inspection or 0, pv_system.Electrical_BoS or 0, pv_system.Structural_BoS or 0,
            pv_system.Supply_Chain_costs or 0, pv_system.Profit_costs or 0, pv_system.Sales_tax or 0
        ]) if pv_system else 0

        # --- Inverter ---
        self.n_I = inverter.n_I if inverter else 0.95
        self.L_I = inverter.L_I if inverter else 15
        self.DC_AC_ratio = inverter.DC_AC_ratio if inverter else 1.2
        self.C_I = inverter.C_I if inverter else 500
        self.R_I = inverter.R_I if inverter else 400
        self.MO_I = inverter.MO_I if inverter else 5
        
        # --- DieselGenerator ---
        self.a = diesel.a if diesel else 0.246
        self.b = diesel.b if diesel else 0.08145
        self.LR_DG = diesel.min_load_ratio if diesel else 0.3
        self.C_DG = diesel.C_DG if diesel else 500
        self.R_DG = diesel.R_DG if diesel else 400
        self.MO_DG = diesel.MO_DG if diesel else 0.02
        self.C_fuel = diesel.C_fuel if diesel else 1.2
        self.C_fuel_adj = (diesel.C_fuel_adj_rate / 100) if diesel else 0.03
        self.TL_DG = diesel.diesel_lifetime if diesel else 15000

        # --- Battery ---
        self.SOC_min = battery.SOC_min if battery else 0.2
        self.SOC_max = battery.SOC_max if battery else 0.8
        self.SOC_initial = battery.SOC_initial if battery else 0.5
        self.self_discharge_rate = battery.self_discharge_rate if battery else 0.02
        self.L_B = battery.L_B if battery else 5
        self.Cnom_Leadacid = battery.Cnom_Leadacid if battery else 100
        self.alfa_battery_leadacid = battery.alfa_battery_leadacid if battery else 0.002
        self.c = battery.c if battery else 0.305
        self.k = battery.k if battery else 0.027
        self.Ich_max_leadacid = battery.Ich_max_leadacid if battery else 20
        self.Vnom_leadacid = battery.Vnom_leadacid if battery else 48
        self.ef_bat_leadacid = battery.ef_bat_leadacid if battery else 0.8
        self.Q_lifetime_leadacid = battery.Q_lifetime_leadacid if battery else 1000
        self.Ich_max_Li_ion = battery.Ich_max_Li_ion if battery else 50
        self.Idch_max_Li_ion = battery.Idch_max_Li_ion if battery else 50
        self.alfa_battery_Li_ion = battery.alfa_battery_Li_ion if battery else 0.001

        # --- GeographyEconomy ---
        self.ir = (geo_econ.n_ir_rate - geo_econ.e_ir_rate) / 100
        self.System_Tax = geo_econ.Tax_rate / 100
        self.RE_incentives = geo_econ.RE_incentives_rate / 100
        
        # --- Optimization ---
        self.MaxIt = opt.MaxIt if opt else 100  # Maximum Number of Iterations
        self.nPop = opt.nPop if opt else 50  # Population Size (Swarm Size)
        self.w = opt.w if opt else 0.9  # Inertia Weight
        self.wdamp = opt.wdamp if opt else 0.99  # Inertia Weight Damping Ratio
        self.c1 = opt.c1 if opt else 2.0  # Personal Learning Coefficient
        self.c2 = opt.c2 if opt else 2.0  # Global Learning Coefficient

    def load_static_data(self):
        # IDK IF THIS IS RIGHT
        try:
            # Try to load from the specific file first
            weather_data = pd.read_csv('sama_python/content/Data.csv', header=None)
            weather_data.columns = ['Power', 'Irradiance', 'Temperature', 'Wind Speed']
        except FileNotFoundError:
            # Fallback to individual files if Data.csv doesn't exist
            temperature_data = pd.read_csv('sama_python/content/Temperature.csv', header=None)
            irradiance_data = pd.read_csv('sama_python/content/Irradiance.csv', header=None)
            wind_data = pd.read_csv('sama_python/content/WSPEED.csv', header=None)
            
            # Combine the weather data - these files have no headers, just data
            weather_data = pd.DataFrame({
                'Temperature': temperature_data.iloc[:, 0],
                'GHI': irradiance_data.iloc[:, 0],
                'Wind Speed': wind_data.iloc[:, 0]
            })
        
        # Generate hourly consumption data from annualData using generic_load
        self.Eload = generic_load(
            load_type=8,  # Annual consumption
            load_previous_year_type=1,
            peakmonth='July',  # Could be made configurable
            daysInMonth=[31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            user_defined_load=self.annualData  # Use the annualData from SystemConfig
        )
        
        self.T = weather_data['Temperature'].values
        self.G = weather_data['Irradiance'].values if 'Irradiance' in weather_data.columns else weather_data['GHI'].values
        self.Vw = weather_data['Wind Speed'].values
        
        # Placeholder/default values for variables not in the database
        self.daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        self.Ppv_r = 1.0  # Rated power of a single PV panel
        self.Pwt_r = 1.0  # Rated power of a single wind turbine
        self.Cbt_r = 1.0  # Capacity of a single battery
        self.Cdg_r = 1.0  # Capacity of a single diesel generator
        self.h_hub = 50
        self.h0 = 10
        self.alfa_wind_turbine = 0.14
        self.v_cut_in = 3
        self.v_cut_out = 25
        self.v_rated = 15
        self.R_B = 200
        self.C_WT = 1200
        self.C_B = 200
        self.C_CH = 100
        self.L_WT = 20
        self.R_WT = 1000
        self.R_CH = 80
        self.L_CH = 10
        self.MO_WT = 20
        self.MO_B = 10
        self.MO_CH = 5
        self.RT_PV = 1
        self.RT_WT = 1
        self.RT_B = 3
        self.RT_I = 2
        self.RT_CH = 2
        self.CO2 = 2.6
        self.NOx = 0.006
        self.SO2 = 0.00013
        self.E_CO2 = 0.2
        self.E_SO2 = 0.0001
        self.E_NOx = 0.0002
        self.Cbuy = np.full(8760, 0.15)
        self.Csell = np.full(8760, 0.05)
        self.EM = 'default_em'
        self.Budget = 100000
        self.Vnom_Li_ion = 48
        self.Cnom_Li = 100
        self.ef_bat_Li = 0.9
        self.Q_lifetime_Li = 3000
        self.Cash_Flow_adv = 0
        

@app.route('/api/submit', methods=['POST'])
@require_auth
@log_function_input
def submit_results():
    try:
        user_id = request.user['uid']
        
        # 1. Prepare data
        in_data = InData(user_id)
        
        # 2. Get optimization variables (using defaults for now)
        # These would eventually come from the frontend or another process
        X = [
            in_data.PV, # Npv
            in_data.WT, # Nwt
            in_data.Bat, # Nbat
            in_data.DG, # N_DG
            1 # Cn_I, placeholder
        ]

        # 3. Run the results generation
        # Clear any previous results
        output_logs.clear()
        
        # Run the analysis (Results.py will create user-specific directories)
        Gen_Results(X, in_data, user_id=f'{user_id}')
        
        # Capture the results
        results_logs = output_logs.copy()
        output_logs.clear()
        
        # 4. Return the analysis results
        return jsonify({
            'message': 'Analysis completed successfully',
            'logs': results_logs,
            'user_id': user_id
        })
        
    except Exception as e:
        logger.error(f"Error submitting results: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='127.0.0.1', port=5000, debug=True)
