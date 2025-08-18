from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from firebase_admin import credentials, initialize_app, auth
import os
from functools import wraps
import logging
import json
from models import db, GeographyEconomy, Optimization, SystemConfig, Grid, PhotovoltaicSystem, Inverter, DieselGenerator, Battery, WindTurbine
from config import Config
import pandas as pd
from types import SimpleNamespace
import numpy as np
from sama_python.generic_load import generic_load
from math import ceil
from sama_python.Input_Data import Input_Data as OriginalInputData
import glob
from sama_python.pso import run as pso_run
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
import calendar
import requests
import csv

NSRDB_API_KEY = os.environ.get('NSRDB_API_KEY')
NSRDB_EMAIL = os.environ.get('NSRDB_EMAIL')

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Set maximum content length for file uploads
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

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

def fetch_and_save_meteo_csv(user_id, latitude, longitude):
    if not NSRDB_API_KEY or not NSRDB_EMAIL:
        return False
    
    url = "https://developer.nrel.gov/api/solar/nsrdb_psm3_tmy_download.csv"
    params = {
        "api_key": NSRDB_API_KEY,
        "wkt": f"POINT({longitude} {latitude})",
        "names": "tmy",
        "interval": "60",
        "full_name": "SAMA User",
        "email": NSRDB_EMAIL,
        "affiliation": "SAMA",
        "reason": "research",
        "attributes": "air_temperature,dew_point,ghi,dhi,dni,wind_speed,wind_direction,surface_pressure,surface_albedo"
    }
    response = requests.get(url, params=params)
    
    if response.status_code != 200:
        return False
    
    output_dir = f'../backend/sama_python/output/{user_id}/data'
    os.makedirs(output_dir, exist_ok=True)
    csv_path = os.path.join(output_dir, 'METEO.csv')
    
    with open(csv_path, 'w') as f:
        f.write(response.text)
    
    return True

@app.route('/api/geography-economy', methods=['POST'])
@require_auth
@log_function_input
def save_geography_economy():
    try:
        user_id = request.user['uid']
        data = request.get_json()
        if isinstance(data, str):
            data = json.loads(data)
        
        # Check if record exists
        geo_economy = GeographyEconomy.query.get(user_id)
        if not geo_economy:
            geo_economy = GeographyEconomy(user_id=user_id)
            db.session.add(geo_economy)
        
        logger.info(f"Type of geo_economy: {type(geo_economy)}")
        logger.info(f"Type of data: {type(data)}")

        # Update fields
        geo_economy.latitude = data.get('latitude')
        geo_economy.longitude = data.get('longitude')
        geo_economy.address = data.get('address')
        geo_economy.n_ir_rate = data.get('n_ir_rate')
        geo_economy.e_ir_rate = data.get('e_ir_rate')
        geo_economy.Tax_rate = data.get('Tax_rate')
        geo_economy.RE_incentives_rate = data.get('RE_incentives_rate')
        
        db.session.commit()

        # Fetch and save METEO.csv
        fetch_and_save_meteo_csv(user_id, geo_economy.latitude, geo_economy.longitude)

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

@app.route('/api/component-selection', methods=['GET'])
@require_auth
def get_component_selection():
    user_id = request.user['uid']
    system_config = SystemConfig.query.get(user_id)
    if not system_config:
        return jsonify({'error': 'No system config found'}), 404
    return jsonify({
        'PV': system_config.PV,
        'WT': system_config.WT,
        'DG': system_config.DG,
        'Bat': system_config.Bat
    })

@app.route('/api/system-config', methods=['POST'])
@require_auth
@log_function_input
def save_system_config():
    try:
        user_id = request.user['uid']
        
        # Check if record exists
        system_config = SystemConfig.query.get(user_id)
        if not system_config:
            system_config = SystemConfig(user_id=user_id)
            db.session.add(system_config)

        # Handle form data (from system config page)
        data = request.form
        system_config.lifetime = data.get('lifetime')
        system_config.LPSP_max_rate = data.get('LPSP_max_rate')
        system_config.RE_min_rate = data.get('RE_min_rate')
        system_config.annualData = data.get('annualData')
        
        # Handle boolean fields from form data
        system_config.PV = data.get('PV', 'false').lower() == 'true'
        system_config.WT = data.get('WT', 'false').lower() == 'true'
        system_config.DG = data.get('DG', 'false').lower() == 'true'
        system_config.Bat = data.get('Bat', 'false').lower() == 'true'
        
        # Handle consumption data source and storage
        consumption_data_source = data.get('consumptionDataSource')
        system_config.consumption_data_source = consumption_data_source
        
        # Handle CSV data upload
        if consumption_data_source == 'hourly':
            # Check if hourly data is provided as JSON string
            hourly_data_json = data.get('hourlyData')
            if hourly_data_json:
                try:
                    hourly_data = json.loads(hourly_data_json)
                    if len(hourly_data) == 8760:
                        system_config.hourly_consumption = hourly_data_json
                    else:
                        return jsonify({'error': f'Invalid hourly data length. Expected 8760 values, got {len(hourly_data)}'}), 400
                except json.JSONDecodeError:
                    return jsonify({'error': 'Invalid JSON format for hourly data'}), 400
            else:
                # Fallback to individual form fields (for backward compatibility)
                hourly_data = []
                for i in range(8760):
                    hour_key = f'hour_{i}'
                    if hour_key in data and data[hour_key]:
                        hourly_data.append(float(data[hour_key]))
                    else:
                        return jsonify({'error': f'Missing hourly data for hour {i+1}'}), 400
                
                system_config.hourly_consumption = json.dumps(hourly_data)
            
        elif consumption_data_source == 'monthly':
            # Check if monthly data is provided as JSON string
            monthly_data_json = data.get('monthlyData')
            if monthly_data_json:
                try:
                    monthly_data = json.loads(monthly_data_json)
                    if len(monthly_data) == 12:
                        system_config.monthly_consumption = monthly_data_json
                    else:
                        return jsonify({'error': f'Invalid monthly data length. Expected 12 values, got {len(monthly_data)}'}), 400
                except json.JSONDecodeError:
                    return jsonify({'error': 'Invalid JSON format for monthly data'}), 400
            else:
                # Fallback to individual form fields (for backward compatibility)
                monthly_data = []
                for i in range(12):
                    month_key = f'month_{i}'
                    if month_key in data and data[month_key]:
                        monthly_data.append(float(data[month_key]))
                    else:
                        return jsonify({'error': f'Missing monthly data for month {i+1}'}), 400
                
                system_config.monthly_consumption = json.dumps(monthly_data)
            
        elif consumption_data_source in ['annual', 'manual']:
            # Annual data is already stored in annualData field
            if not system_config.annualData or system_config.annualData == '':
                return jsonify({'error': 'Annual consumption data is required'}), 400
        
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
            if key in ['season', 'holidays']:
                # Store as JSON-encoded string
                setattr(grid, key, json.dumps(value))
            elif hasattr(grid, key):
                # Handle empty strings for nullable columns
                column = getattr(grid.__class__, key)
                if value == '' and column.nullable:
                    setattr(grid, key, None)
                else:
                    setattr(grid, key, value)
        
        db.session.commit()
        return jsonify({'id': grid.user_id, 'message': 'Grid data saved successfully'}), 200
    except Exception as e:
        logger.error(f"Error saving grid data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/pv-config', methods=['POST'])
@require_auth
def save_pv_config():
    try:
        user_id = request.user['uid']
        data = request.get_json()
        pv = PhotovoltaicSystem.query.get(user_id)
        if not pv:
            pv = PhotovoltaicSystem(user_id=user_id)
            db.session.add(pv)
        for field in [
            'fpv', 'Tcof', 'Tref', 'Tc_noct', 'Ta_noct', 'G_noct', 'n_PV', 'Gref', 'L_PV',
            'C_PV', 'R_PV', 'MO_PV', 'Installation_cost', 'Overhead', 'Sales_and_marketing',
            'Permiting_and_Inspection', 'Electrical_BoS', 'Structural_BoS', 'Supply_Chain_costs',
            'Profit_costs', 'Sales_tax', 'azimuth', 'tilt', 'soiling']:
            if field in data:
                setattr(pv, field, data[field])
        db.session.commit()
        return jsonify({field: getattr(pv, field) for field in [
            'user_id', 'fpv', 'Tcof', 'Tref', 'Tc_noct', 'Ta_noct', 'G_noct', 'n_PV', 'Gref', 'L_PV',
            'C_PV', 'R_PV', 'MO_PV', 'Installation_cost', 'Overhead', 'Sales_and_marketing',
            'Permiting_and_Inspection', 'Electrical_BoS', 'Structural_BoS', 'Supply_Chain_costs',
            'Profit_costs', 'Sales_tax', 'azimuth', 'tilt', 'soiling']}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/inverter-config', methods=['POST'])
@require_auth
def save_inverter_config():
    try:
        user_id = request.user['uid']
        data = request.get_json()
        inv = Inverter.query.get(user_id)
        if not inv:
            inv = Inverter(user_id=user_id)
            db.session.add(inv)
        for field in ['n_I', 'L_I', 'DC_AC_ratio', 'C_I', 'R_I', 'MO_I']:
            if field in data:
                setattr(inv, field, data[field])
        db.session.commit()
        return jsonify({field: getattr(inv, field) for field in [
            'user_id', 'n_I', 'L_I', 'DC_AC_ratio', 'C_I', 'R_I', 'MO_I']}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dg-config', methods=['POST'])
@require_auth
def save_dg_config():
    try:
        user_id = request.user['uid']
        data = request.get_json()
        dg = DieselGenerator.query.get(user_id)
        if not dg:
            dg = DieselGenerator(user_id=user_id)
            db.session.add(dg)
        for field in ['a', 'b', 'min_load_ratio', 'C_DG', 'R_DG', 'MO_DG', 'C_fuel', 'C_fuel_adj_rate', 'diesel_lifetime']:
            if field in data:
                setattr(dg, field, data[field])
        db.session.commit()
        return jsonify({field: getattr(dg, field) for field in [
            'user_id', 'a', 'b', 'min_load_ratio', 'C_DG', 'R_DG', 'MO_DG', 'C_fuel', 'C_fuel_adj_rate', 'diesel_lifetime']}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/battery-config', methods=['POST'])
@require_auth
def save_battery_config():
    try:
        user_id = request.user['uid']
        data = request.get_json()
        bat = Battery.query.get(user_id)
        if not bat:
            bat = Battery(user_id=user_id)
            db.session.add(bat)
        for field in [
            'Lead_acid', 'Li_ion', 'SOC_min', 'SOC_max', 'SOC_initial', 'self_discharge_rate', 'L_B',
            'Cnom_Leadacid', 'alfa_battery_leadacid', 'c', 'k', 'Ich_max_leadacid', 'Vnom_leadacid',
            'ef_bat_leadacid', 'Q_lifetime_leadacid', 'Ich_max_Li_ion', 'Idch_max_Li_ion', 'alfa_battery_Li_ion',
            'Vnom_Li_ion', 'ef_bat_Li', 'Cnom_Li', 'Q_lifetime_Li', 'L_B_Li', 'C_B', 'R_B', 'MO_B']:
            if field in data:
                setattr(bat, field, data[field])
        db.session.commit()
        return jsonify({field: getattr(bat, field) for field in [
            'user_id', 'Lead_acid', 'Li_ion', 'SOC_min', 'SOC_max', 'SOC_initial', 'self_discharge_rate', 'L_B',
            'Cnom_Leadacid', 'alfa_battery_leadacid', 'c', 'k', 'Ich_max_leadacid', 'Vnom_leadacid',
            'ef_bat_leadacid', 'Q_lifetime_leadacid', 'Ich_max_Li_ion', 'Idch_max_Li_ion', 'alfa_battery_Li_ion',
            'Vnom_Li_ion', 'ef_bat_Li', 'Cnom_Li', 'Q_lifetime_Li', 'L_B_Li', 'C_B', 'R_B', 'MO_B']}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/wind-config', methods=['POST'])
@require_auth
@log_function_input
def save_wind_config():
    try:
        user_id = request.user['uid']
        data = request.get_json()
        wind = WindTurbine.query.get(user_id)
        if not wind:
            wind = WindTurbine(user_id=user_id)
            db.session.add(wind)
        for field in [
            'Pwt_r', 'h_hub', 'h0', 'nw', 'v_cut_out', 'v_cut_in', 'v_rated', 'alfa_wind_turbine', 'L_WT',
            'C_WT', 'R_WT', 'MO_WT', 'Weibull_k', 'Weibull_c', 'Wind_speed']:
            if field in data:
                setattr(wind, field, data[field])
        db.session.commit()
        return jsonify({field: getattr(wind, field) for field in [
            'user_id', 'Pwt_r', 'h_hub', 'h0', 'nw', 'v_cut_out', 'v_cut_in', 'v_rated', 'alfa_wind_turbine', 'L_WT',
            'C_WT', 'R_WT', 'MO_WT', 'Weibull_k', 'Weibull_c', 'Wind_speed']}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

class InData(OriginalInputData):
    def __init__(self, user_id):
        # Set user_id first
        self.user_id = user_id
        
        # Override weather_url before calling parent __init__ to ensure correct file is used
        self.weather_url = f'../backend/sama_python/output/{self.user_id}/data/METEO.csv'
        
        # Initialize the original Input_Data class (this will use our weather_url)
        super().__init__()
        
        # Now override other values that come from the database
        self.load_user_data()

    def load_user_data(self):
        # Load data from database
        geo_econ = GeographyEconomy.query.get(self.user_id)
        opt = Optimization.query.get(self.user_id)
        sys_config = SystemConfig.query.get(self.user_id)
        pv_system = PhotovoltaicSystem.query.get(self.user_id)
        inverter = Inverter.query.get(self.user_id)
        diesel = DieselGenerator.query.get(self.user_id)
        battery = Battery.query.get(self.user_id)
        wind = WindTurbine.query.get(self.user_id)
        grid = Grid.query.get(self.user_id)

        logger.info(f"Loading user data for user_id: {self.user_id}")
        logger.info(f"sys_config exists: {sys_config is not None}")
        logger.info(f"pv_system exists: {pv_system is not None}")
        logger.info(f"inverter exists: {inverter is not None}")
        logger.info(f"diesel exists: {diesel is not None}")
        logger.info(f"battery exists: {battery is not None}")
        logger.info(f"wind exists: {wind is not None}")
        logger.info(f"grid exists: {grid is not None}")
        logger.info(f"weather_url: {self.weather_url}")

        # --- SystemConfig ---
        if sys_config:
            self.WT = sys_config.WT
            self.n = sys_config.lifetime
            self.LPSP_max = sys_config.LPSP_max_rate
            self.RE_min = sys_config.RE_min_rate
            self.PV = sys_config.PV
            self.Bat = sys_config.Bat
            self.DG = sys_config.DG
            
            # Load consumption data from database JSON fields
            if sys_config.consumption_data_source:
                if sys_config.consumption_data_source == 'hourly' and sys_config.hourly_consumption:
                    hourly_values = json.loads(sys_config.hourly_consumption)
                    self.Eload = np.array(hourly_values)
                elif sys_config.consumption_data_source == 'monthly' and sys_config.monthly_consumption:
                    monthly_values = json.loads(sys_config.monthly_consumption)
                    days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
                    hourly_load = []
                    for month, total_load in enumerate(monthly_values):
                        days = days_in_month[month]
                        hourly_avg = float(total_load) / (days * 24)
                        hourly_load.extend([hourly_avg] * (days * 24))
                    self.Eload = np.array(hourly_load)
                elif sys_config.consumption_data_source in ['annual', 'manual'] and sys_config.annualData:
                    self.annualData = float(sys_config.annualData)
                    self.Eload = generic_load(
                        load_type=8, user_defined_load=self.annualData,
                        load_previous_year_type=1, peakmonth='July',
                        daysInMonth=[31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
                    )

        # --- Grid ---
        if grid:
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
            
            # Load new grid fields
            if grid.season:
                self.season = json.loads(grid.season)
            if grid.holidays:
                self.holidays = json.loads(grid.holidays)
            if grid.rateStructure:
                self.rateStructure = grid.rateStructure
                
                # Load rate structure specific data based on type
                if grid.rateStructure == 'flat' and grid.flatPrice is not None:
                    self.flatPrice = grid.flatPrice
                elif grid.rateStructure == 'seasonal' and grid.seasonalPrices:
                    self.seasonalPrices = json.loads(grid.seasonalPrices)
                elif grid.rateStructure == 'monthly' and grid.monthlyPrices:
                    self.monthlyPrices = json.loads(grid.monthlyPrices)
                elif grid.rateStructure == 'tiered':
                    if grid.tieredPrices:
                        self.tieredPrices = json.loads(grid.tieredPrices)
                    if grid.tierMax:
                        self.tierMax = json.loads(grid.tierMax)
                elif grid.rateStructure == 'seasonalTiered':
                    if grid.seasonalTieredPrices:
                        self.seasonalTieredPrices = json.loads(grid.seasonalTieredPrices)
                    if grid.seasonalTierMax:
                        self.seasonalTierMax = json.loads(grid.seasonalTierMax)
                elif grid.rateStructure == 'monthlyTiered':
                    if grid.monthlyTieredPrices:
                        self.monthlyTieredPrices = json.loads(grid.monthlyTieredPrices)
                    if grid.monthlyTierLimits:
                        self.monthlyTierLimits = json.loads(grid.monthlyTierLimits)
                elif grid.rateStructure == 'tou':
                    if grid.onPrice:
                        self.onPrice = json.loads(grid.onPrice)
                    if grid.midPrice:
                        self.midPrice = json.loads(grid.midPrice)
                    if grid.offPrice:
                        self.offPrice = json.loads(grid.offPrice)
                    if grid.onHours:
                        self.onHours = json.loads(grid.onHours)
                    if grid.midHours:
                        self.midHours = json.loads(grid.midHours)
                
                # Legacy TOU fields for backward compatibility
                if grid.onPeakPrice is not None:
                    self.onPeakPrice = grid.onPeakPrice
                if grid.midPeakPrice is not None:
                    self.midPeakPrice = grid.midPeakPrice
            
            # Load compensation fields
            if grid.compensation_option:
                if grid.compensation_option == '1:1':
                    # 1:1 compensation - Csell equals Cbuy
                    self.sellStructure = 3
                elif grid.compensation_option == 'flat':
                    # Flat compensation - single value
                    self.sellStructure = 1
                    if grid.flat_compensation is not None:
                        self.Csell = np.full(8760, grid.flat_compensation)
                elif grid.compensation_option == 'monthly':
                    # Monthly compensation - array of 12 monthly values
                    self.sellStructure = 2
                    if grid.monthly_compensation:
                        self.monthlysellprices = json.loads(grid.monthly_compensation)
                        from sama_python.calcMonthlyRate import calcMonthlyRate
                        self.Csell = calcMonthlyRate(self.monthlysellprices, self.daysInMonth)

        # --- PhotovoltaicSystem ---
        if pv_system:
            self.fpv = pv_system.fpv
            self.Tcof = pv_system.Tcof
            self.Tref = pv_system.Tref
            self.Tc_noct = pv_system.Tc_noct
            self.Ta_noct = pv_system.Ta_noct
            self.G_noct = pv_system.G_noct
            self.n_PV = pv_system.n_PV
            self.Gref = pv_system.Gref
            self.L_PV = pv_system.L_PV
            self.C_PV = pv_system.C_PV
            self.R_PV = pv_system.R_PV
            self.MO_PV = pv_system.MO_PV
            self.Engineering_Costs = sum([
                pv_system.Installation_cost or 0, pv_system.Overhead or 0, pv_system.Sales_and_marketing or 0,
                pv_system.Permiting_and_Inspection or 0, pv_system.Electrical_BoS or 0, pv_system.Structural_BoS or 0,
                pv_system.Supply_Chain_costs or 0, pv_system.Profit_costs or 0, pv_system.Sales_tax or 0
            ])

        # --- Inverter ---
        if inverter:
            self.n_I = inverter.n_I
            self.L_I = inverter.L_I
            self.DC_AC_ratio = inverter.DC_AC_ratio
            self.C_I = inverter.C_I
            self.R_I = inverter.R_I
            self.MO_I = inverter.MO_I
        
        # --- DieselGenerator ---
        if diesel:
            self.a = diesel.a
            self.b = diesel.b
            self.LR_DG = diesel.min_load_ratio
            self.C_DG = diesel.C_DG
            self.R_DG = diesel.R_DG
            self.MO_DG = diesel.MO_DG
            self.C_fuel = diesel.C_fuel
            self.C_fuel_adj = (diesel.C_fuel_adj_rate / 100)
            self.TL_DG = diesel.diesel_lifetime

        # --- Battery ---
        if battery:
            self.Lead_acid = battery.Lead_acid
            self.Li_ion = battery.Li_ion
            self.SOC_min = battery.SOC_min
            self.SOC_max = battery.SOC_max
            self.SOC_initial = battery.SOC_initial
            self.self_discharge_rate = battery.self_discharge_rate
            self.L_B = battery.L_B
            self.Cnom_Leadacid = battery.Cnom_Leadacid
            self.alfa_battery_leadacid = battery.alfa_battery_leadacid
            self.c = battery.c
            self.k = battery.k
            self.Ich_max_leadacid = battery.Ich_max_leadacid
            self.Vnom_leadacid = battery.Vnom_leadacid
            self.ef_bat_leadacid = battery.ef_bat_leadacid
            self.Q_lifetime_leadacid = battery.Q_lifetime_leadacid
            self.Ich_max_Li_ion = battery.Ich_max_Li_ion
            self.Idch_max_Li_ion = battery.Idch_max_Li_ion
            self.alfa_battery_Li_ion = battery.alfa_battery_Li_ion
            self.Vnom_Li_ion = battery.Vnom_Li_ion
            self.ef_bat_Li = battery.ef_bat_Li
            self.Cnom_Li = battery.Cnom_Li
            self.Q_lifetime_Li = battery.Q_lifetime_Li
            self.L_B_Li = battery.L_B_Li
            self.C_B = battery.C_B
            self.R_B = battery.R_B
            self.MO_B = battery.MO_B
            
            # Since we have all battery parameters available, set both types to True
            self.Lead_acid = True
            self.Li_ion = True

        # --- WindTurbine ---
        if wind:
            self.Pwt_r = wind.Pwt_r
            self.h_hub = wind.h_hub
            self.h0 = wind.h0
            self.nw = wind.nw
            self.v_cut_out = wind.v_cut_out
            self.v_cut_in = wind.v_cut_in
            self.v_rated = wind.v_rated
            self.alfa_wind_turbine = wind.alfa_wind_turbine
            self.L_WT = wind.L_WT
            self.C_WT = wind.C_WT
            self.R_WT = wind.R_WT
            self.MO_WT = wind.MO_WT
            self.Weibull_k = wind.Weibull_k
            self.Weibull_c = wind.Weibull_c
            self.Wind_speed = wind.Wind_speed

        # --- GeographyEconomy ---
        if geo_econ:
            self.ir = (geo_econ.n_ir_rate - geo_econ.e_ir_rate) / 100
            self.System_Tax = geo_econ.Tax_rate / 100
            self.RE_incentives = geo_econ.RE_incentives_rate / 100
        
        # --- Optimization ---
        if opt:
            self.MaxIt = opt.MaxIt
            self.nPop = opt.nPop
            self.w = opt.w
            self.wdamp = opt.wdamp
            self.c1 = opt.c1
            self.c2 = opt.c2

        # Debug: Check for potential division by zero issues
        logger.info(f"Critical values check:")
        logger.info(f"  L_PV: {getattr(self, 'L_PV', 'NOT SET')}")
        logger.info(f"  L_I: {getattr(self, 'L_I', 'NOT SET')}")
        logger.info(f"  L_B: {getattr(self, 'L_B', 'NOT SET')}")
        logger.info(f"  L_WT: {getattr(self, 'L_WT', 'NOT SET')}")
        logger.info(f"  L_CH: {getattr(self, 'L_CH', 'NOT SET')}")
        logger.info(f"  n: {getattr(self, 'n', 'NOT SET')}")
        logger.info(f"  Ppv_r: {getattr(self, 'Ppv_r', 'NOT SET')}")

@app.route('/api/submit', methods=['POST'])
@require_auth
@log_function_input
def submit_results():
    try:
        user_id = request.user['uid']
        
        # Load user data
        in_data = InData(user_id)
        
        in_data.completeInitialization()
        
        # Call PSO optimizer and get comprehensive results
        result = pso_run(in_data, user_id)
        
        # Check if we got valid results
        if result and 'error' not in result:
            return jsonify({
                'message': 'Optimization completed successfully',
                'result': result,
                'user_id': user_id,
                'status': 'success'
            })
        else:
            return jsonify({
                'message': 'Optimization completed but no valid results generated',
                'result': result,
                'user_id': user_id,
                'status': 'warning'
            }), 200
            
    except Exception as e:
        import traceback
        logger.error(f"Error submitting results: {str(e)}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return jsonify({
            'error': str(e), 
            'traceback': traceback.format_exc(),
            'status': 'error'
        }), 500

@app.route('/api/download/<user_id>/<file_type>/<filename>', methods=['GET'])
@require_auth
def download_file(user_id, file_type, filename):
    """Download a generated file for a specific user"""
    try:
        # Verify the requesting user can access this file
        requesting_user_id = request.user['uid']
        if requesting_user_id != user_id:
            return jsonify({'error': 'Unauthorized access to file'}), 403
        
        # Determine the file path based on type
        if file_type == 'figure':
            file_path = f'../backend/sama_python/output/{user_id}/figs/{filename}'
        elif file_type == 'data':
            file_path = f'../backend/sama_python/output/{user_id}/data/{filename}'
        else:
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Check if file exists
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        # Determine MIME type
        if filename.endswith('.png'):
            mimetype = 'image/png'
        elif filename.endswith('.csv'):
            mimetype = 'text/csv'
        else:
            mimetype = 'application/octet-stream'
        
        # Send the file
        return send_file(
            file_path,
            mimetype=mimetype,
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        logger.error(f"Error downloading file: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/files/<user_id>', methods=['GET'])
@require_auth
def get_user_files(user_id):
    """Get list of generated files for a specific user"""
    try:
        # Verify the requesting user can access this file list
        requesting_user_id = request.user['uid']
        if requesting_user_id != user_id:
            return jsonify({'error': 'Unauthorized access to files'}), 403
        
        output_base = f'../backend/sama_python/output/{user_id}'
        figs_dir = f'{output_base}/figs'
        data_dir = f'{output_base}/data'
        
        generated_files = {
            'figures': []
        }
        
        # Get figure files only
        if os.path.exists(figs_dir):
            fig_files = glob.glob(f'{figs_dir}/*.png')
            logger.info(f"Found {len(fig_files)} figure files: {fig_files}")
            for fig_file in fig_files:
                filename = os.path.basename(fig_file)
                generated_files['figures'].append({
                    'name': filename,
                    'display_name': filename.replace('.png', '').replace('_', ' ').title(),
                    'type': 'figure'
                })
        else:
            logger.warning(f"Figures directory does not exist: {figs_dir}")
        
        logger.info(f"Returning files: {generated_files}")
        return jsonify({
            'user_id': user_id,
            'files': generated_files
        })
        
    except Exception as e:
        logger.error(f"Error getting user files: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='127.0.0.1', port=5000, debug=True)
