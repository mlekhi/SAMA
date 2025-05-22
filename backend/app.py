from flask import Flask, Response, request, jsonify, send_from_directory, session
from flask_cors import CORS
from config import Config
from models import db, SessionData, GeographyEconomy, SystemConfiguration, PhotovoltaicSystem, Inverter, DieselGenerator, Battery, Grid, Optimization, WindTurbine, ChargeController, GridSelling
import requests
from datetime import datetime
import json
from sama_python.Results import Gen_Results, output_logs
import sama_python.pso as pso
from math import ceil
import os
import logging
import uuid
import numpy as np
from sama_python.Input_Data import Input_Data

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions with more specific CORS configuration
    CORS(app, 
         resources={r"/*": {
             "origins": [
                 "http://localhost:3000",
                 "http://127.0.0.1:3000",
                 "http://localhost:5173",  # Vite dev server
                 "http://127.0.0.1:5173"   # Vite dev server alternative
             ],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "supports_credentials": True
         }},
         supports_credentials=True
    )
    db.init_app(app)
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    # Error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad Request', 'message': str(error)}), 400
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not Found', 'message': str(error)}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {str(error)}")
        return jsonify({'error': 'Internal Server Error', 'message': str(error)}), 500

    # Helper functions
    # def validate_coordinates(lat, lng):
    #     if not isinstance(lat, (int, float)) or not isinstance(lng, (int, float)):
    #         raise ValueError("Latitude and longitude must be numbers")
    #     if not -90 <= lat <= 90:
    #         raise ValueError("Latitude must be between -90 and 90")
    #     if not -180 <= lng <= 180:
    #         raise ValueError("Longitude must be between -180 and 180")
    #     return True

    # def fetch_nrel_data(lat, lng, api_key):
    #     email = "dbharga@uwo.ca"
    #     nsrdb_data_query_url = f'https://developer.nrel.gov/api/solar/nsrdb_data_query.json?api_key={api_key}&wkt=POINT({lat}+{lng})'
        
    #     try:
    #         dq_response = requests.get(nsrdb_data_query_url, timeout=10)
    #         dq_response.raise_for_status()
    #         return dq_response.json()
    #     except requests.exceptions.RequestException as e:
    #         logger.error(f"NREL API request failed: {str(e)}")
    #         raise

    # def process_nrel_response(response_data):
    #     valid_sources = [
    #         "Physical Solar Model v3 TMY",
    #         "Meteosat Prime Meridian V1.0.0 TMY",
    #         "Himawari TMY",
    #         "NSRDB MSG V1.0.0 TMY"
    #     ]
        
    #     for item in response_data.get("outputs", []):
    #         if isinstance(item, dict) and item.get("displayName") in valid_sources:
    #             links = item.get("links", [])
    #             if links:
    #                 return links[0].get("link"), item
    #     return None, {"Error": "No data found for your region"}

    # def save_meteo_data(data, file_path):
    #     try:
    #         with open(file_path, mode="w", newline="") as f:
    #             f.write(data)
    #         return True
    #     except IOError as e:
    #         logger.error(f"Failed to save METEO data: {str(e)}")
    #         raise

    # def convert_numpy(obj):
    #     if isinstance(obj, np.ndarray):
    #         return obj.tolist()
    #     elif isinstance(obj, (np.int_, np.intc, np.intp, np.int8,
    #         np.int16, np.int32, np.int64, np.uint8,
    #         np.uint16, np.uint32, np.uint64)):
    #         return int(obj)
    #     elif isinstance(obj, (np.float_, np.float16, np.float32, np.float64)):
    #         return float(obj)
    #     elif isinstance(obj, dict):
    #         return {key: convert_numpy(value) for key, value in obj.items()}
    #     elif isinstance(obj, list):
    #         return [convert_numpy(item) for item in obj]
    #     return obj

    # @app.route("/api/map", methods=["GET"])
    # def mapAPIFetch():
    #     try:
    #         # Validate coordinates
    #         lat = request.args.get("lat", type=float)
    #         lng = request.args.get("long", type=float)
            
    #         if not lat or not lng:
    #             return jsonify({"error": "Missing required parameters: lat and long"}), 400
            
    #         validate_coordinates(lat, lng)
            
    #         # Fetch data from NREL
    #         api_key = app.config['NREL_API_KEY']
    #         response_data = fetch_nrel_data(lat, lng, api_key)
            
    #         # Process response
    #         found_link, selected_item = process_nrel_response(response_data)
            
    #         if not found_link:
    #             return jsonify(selected_item), 404
            
    #         # Download and save data
    #         found_link = found_link.replace('yourapikey', api_key).replace('youremail', "dbharga@uwo.ca")
    #         downloaded = requests.get(found_link, timeout=30)
    #         downloaded.raise_for_status()
            
    #         file_path = os.path.join(app.config['UPLOAD_FOLDER'], "METEO.csv")
    #         save_meteo_data(downloaded.text, file_path)
            
    #         return Response(downloaded, mimetype="text/csv")
    #     except ValueError as e:
    #         return jsonify({"error": str(e)}), 400
    #     except requests.exceptions.RequestException as e:
    #         return jsonify({"error": "Failed to fetch data from NREL", "details": str(e)}), 500
    #     except Exception as e:
    #         logger.error(f"Error in mapAPIFetch: {str(e)}")
    #         return jsonify({"error": "Internal server error", "details": str(e)}), 500

    # @app.route("/api/sessions/<string:session_id>", methods=["GET"])
    # def get_session(session_id):
    #     try:
    #         session_data = SessionData.query.get_or_404(session_id)
    #         return jsonify(session_data.to_dict())
    #     except Exception as e:
    #         logger.error(f"Error in mapAPIFetch: {str(e)}")
    #         return jsonify({"error": "Internal server error", "details": str(e)}), 500

    @app.route('/api/get', methods=['GET'])
    def get_components():
        try:
            print("[get_components] --- Starting function ---")
            
            # Get session_id from query parameters
            session_id = request.args.get("session_id")
            
            # If no session_id provided, create a new session
            if not session_id:
                # Create new session directly instead of calling initialize endpoint
                session_id = str(uuid.uuid4())
                session_data = SessionData(
                    session_id=session_id,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.session.add(session_data)
                db.session.commit()
                print(f"[get_components] --- Created new session {session_id} ---")
            else:
                # Get existing session
                session_data = SessionData.query.get(session_id)
                if not session_data:
                    raise Exception(f"Session {session_id} not found")
                print(f"[get_components] --- Using existing session {session_id} ---")
            
            # Get or create records for the session
            geo_economy = GeographyEconomy.query.get(session_id)
            if not geo_economy:
                geo_economy = GeographyEconomy(session_id=session_id)
                db.session.add(geo_economy)
                db.session.commit()
            
            system_config = SystemConfiguration.query.get(session_id)
            if not system_config:
                system_config = SystemConfiguration(session_id=session_id)
                db.session.add(system_config)
                db.session.commit()
            
            battery = Battery.query.get(session_id)
            if not battery:
                battery = Battery(session_id=session_id)
                db.session.add(battery)
                db.session.commit()
            
            pv = PhotovoltaicSystem.query.get(session_id)
            if not pv:
                pv = PhotovoltaicSystem(session_id=session_id)
                db.session.add(pv)
                db.session.commit()
            
            inverter = Inverter.query.get(session_id)
            if not inverter:
                inverter = Inverter(session_id=session_id)
                db.session.add(inverter)
                db.session.commit()
            
            wind = WindTurbine.query.get(session_id)
            if not wind:
                wind = WindTurbine(session_id=session_id)
                db.session.add(wind)
                db.session.commit()
            
            diesel = DieselGenerator.query.get(session_id)
            if not diesel:
                diesel = DieselGenerator(session_id=session_id)
                db.session.add(diesel)
                db.session.commit()
            
            grid = Grid.query.get(session_id)
            if not grid:
                grid = Grid(session_id=session_id)
                db.session.add(grid)
                db.session.commit()
            
            optimization = Optimization.query.get(session_id)
            if not optimization:
                optimization = Optimization(session_id=session_id)
                db.session.add(optimization)
                db.session.commit()
            
            # Use the to_dict method from SessionData which already includes all components
            result = session_data.to_dict()
            
            # Print the full contents of to_dict
            print("\n=== Full to_dict() Output ===")
            print("Session Data:")
            print(f"  session_id: {result['session_id']}")
            print(f"  created_at: {result['created_at']}")
            print(f"  updated_at: {result['updated_at']}")
            
            print("\nResults:")
            print(f"  ac_monthly: {result['results']['ac_monthly']}")
            print(f"  solrad_monthly: {result['results']['solrad_monthly']}")
            print(f"  dc_monthly: {result['results']['dc_monthly']}")
            print(f"  poa_monthly: {result['results']['poa_monthly']}")
            
            print("\nGeography & Economy:")
            if result['geography_economy']:
                print(f"  latitude: {result['geography_economy']['latitude']}")
                print(f"  longitude: {result['geography_economy']['longitude']}")
                print(f"  n_ir_rate: {result['geography_economy']['n_ir_rate']}")
                print(f"  e_ir_rate: {result['geography_economy']['e_ir_rate']}")
                print(f"  Tax_rate: {result['geography_economy']['Tax_rate']}")
                print(f"  RE_incentives_rate: {result['geography_economy']['RE_incentives_rate']}")
            
            print("\nSystem Configuration:")
            if result['system_config']:
                print(f"  lifetime: {result['system_config']['lifetime']}")
                print(f"  LPSP_max_rate: {result['system_config']['LPSP_max_rate']}")
                print(f"  RE_min_rate: {result['system_config']['RE_min_rate']}")
                print(f"  annualData: {result['system_config']['annualData']}")
                print(f"  PV: {result['system_config']['PV']}")
                print(f"  WT: {result['system_config']['WT']}")
                print(f"  DG: {result['system_config']['DG']}")
                print(f"  Bat: {result['system_config']['Bat']}")
                print(f"  Lead_acid: {result['system_config']['Lead_acid']}")
                print(f"  Li_ion: {result['system_config']['Li_ion']}")
            
            print("\nPV System:")
            if result['pv_system']:
                print("  System Configuration:")
                print(f"    system_capacity: {result['pv_system']['system_capacity']}")
                print(f"    azimuth: {result['pv_system']['azimuth']}")
                print(f"    tilt: {result['pv_system']['tilt']}")
                print(f"    array_type: {result['pv_system']['array_type']}")
                print(f"    module_type: {result['pv_system']['module_type']}")
                print(f"    losses: {result['pv_system']['losses']}")
                
                print("  Technical Parameters:")
                print(f"    fpv: {result['pv_system']['fpv']}")
                print(f"    Tcof: {result['pv_system']['Tcof']}")
                print(f"    Tref: {result['pv_system']['Tref']}")
                print(f"    Tc_noct: {result['pv_system']['Tc_noct']}")
                print(f"    Ta_noct: {result['pv_system']['Ta_noct']}")
                print(f"    G_noct: {result['pv_system']['G_noct']}")
                print(f"    n_PV: {result['pv_system']['n_PV']}")
                print(f"    Gref: {result['pv_system']['Gref']}")
                print(f"    L_PV: {result['pv_system']['L_PV']}")
                print(f"    gama: {result['pv_system']['gama']}")
                
                print("  Economic Parameters:")
                print(f"    C_PV: {result['pv_system']['C_PV']}")
                print(f"    R_PV: {result['pv_system']['R_PV']}")
                print(f"    MO_PV: {result['pv_system']['MO_PV']}")
                
                print("  Engineering Costs:")
                print(f"    Installation_cost: {result['pv_system']['Installation_cost']}")
                print(f"    Overhead: {result['pv_system']['Overhead']}")
                print(f"    Sales_and_marketing: {result['pv_system']['Sales_and_marketing']}")
                print(f"    Permiting_and_Inspection: {result['pv_system']['Permiting_and_Inspection']}")
                print(f"    Electrical_BoS: {result['pv_system']['Electrical_BoS']}")
                print(f"    Structural_BoS: {result['pv_system']['Structural_BoS']}")
                print(f"    Supply_Chain_costs: {result['pv_system']['Supply_Chain_costs']}")
                print(f"    Profit_costs: {result['pv_system']['Profit_costs']}")
                print(f"    Sales_tax: {result['pv_system']['Sales_tax']}")
            
            print("\nBattery:")
            if result['battery']:
                print(f"  SOC_min: {result['battery']['SOC_min']}")
                print(f"  SOC_max: {result['battery']['SOC_max']}")
                print(f"  SOC_initial: {result['battery']['SOC_initial']}")
                print(f"  self_discharge_rate: {result['battery']['self_discharge_rate']}")
                print(f"  L_B: {result['battery']['L_B']}")
                print(f"  Cnom_Leadacid: {result['battery']['Cnom_Leadacid']}")
                print(f"  alfa_battery_leadacid: {result['battery']['alfa_battery_leadacid']}")
                print(f"  c: {result['battery']['c']}")
                print(f"  k: {result['battery']['k']}")
                print(f"  Ich_max_leadacid: {result['battery']['Ich_max_leadacid']}")
                print(f"  Vnom_leadacid: {result['battery']['Vnom_leadacid']}")
                print(f"  ef_bat_leadacid: {result['battery']['ef_bat_leadacid']}")
                print(f"  Q_lifetime_leadacid: {result['battery']['Q_lifetime_leadacid']}")
                print(f"  Ich_max_Li_ion: {result['battery']['Ich_max_Li_ion']}")
                print(f"  Idch_max_Li_ion: {result['battery']['Idch_max_Li_ion']}")
                print(f"  alfa_battery_Li_ion: {result['battery']['alfa_battery_Li_ion']}")
            
            print("\nInverter:")
            if result['inverter']:
                print(f"  n_I: {result['inverter']['n_I']}")
                print(f"  L_I: {result['inverter']['L_I']}")
                print(f"  DC_AC_ratio: {result['inverter']['DC_AC_ratio']}")
                print(f"  C_I: {result['inverter']['C_I']}")
                print(f"  R_I: {result['inverter']['R_I']}")
                print(f"  MO_I: {result['inverter']['MO_I']}")
            
            print("\nWind Turbine:")
            if result['wind_turbine']:
                print(f"  h_hub: {result['wind_turbine']['h_hub']}")
                print(f"  h0: {result['wind_turbine']['h0']}")
                print(f"  nw: {result['wind_turbine']['nw']}")
                print(f"  v_cut_out: {result['wind_turbine']['v_cut_out']}")
                print(f"  v_cut_in: {result['wind_turbine']['v_cut_in']}")
                print(f"  v_rated: {result['wind_turbine']['v_rated']}")
                print(f"  L_WT: {result['wind_turbine']['L_WT']}")
                print(f"  alfa_wind_turbine: {result['wind_turbine']['alfa_wind_turbine']}")
                print(f"  C_WT: {result['wind_turbine']['C_WT']}")
                print(f"  R_WT: {result['wind_turbine']['R_WT']}")
                print(f"  MO_WT: {result['wind_turbine']['MO_WT']}")
            
            print("\nDiesel Generator:")
            if result['diesel_generator']:
                print(f"  a: {result['diesel_generator']['a']}")
                print(f"  b: {result['diesel_generator']['b']}")
                print(f"  min_load_ratio: {result['diesel_generator']['min_load_ratio']}")
                print(f"  diesel_lifetime: {result['diesel_generator']['diesel_lifetime']}")
                print(f"  C_DG: {result['diesel_generator']['C_DG']}")
                print(f"  R_DG: {result['diesel_generator']['R_DG']}")
                print(f"  MO_DG: {result['diesel_generator']['MO_DG']}")
                print(f"  C_fuel: {result['diesel_generator']['C_fuel']}")
                print(f"  C_fuel_adj_rate: {result['diesel_generator']['C_fuel_adj_rate']}")
            
            print("\nGrid:")
            if result['grid']:
                print(f"  Grid: {result['grid']['Grid']}")
                print(f"  NEM: {result['grid']['NEM']}")
                print(f"  Annual_expenses: {result['grid']['Annual_expenses']}")
                print(f"  Grid_sale_tax_rate: {result['grid']['Grid_sale_tax_rate']}")
                print(f"  Grid_Tax_amount: {result['grid']['Grid_Tax_amount']}")
                print(f"  Grid_escalation_rate: {result['grid']['Grid_escalation_rate']}")
                print(f"  Grid_credit: {result['grid']['Grid_credit']}")
                print(f"  NEM_fee: {result['grid']['NEM_fee']}")
                print(f"  SC_flat: {result['grid']['SC_flat']}")
                print(f"  Pbuy_max: {result['grid']['Pbuy_max']}")
                print(f"  Psell_max: {result['grid']['Psell_max']}")
            
            print("\nOptimization:")
            if result['optimization']:
                print(f"  MaxIt: {result['optimization']['MaxIt']}")
                print(f"  nPop: {result['optimization']['nPop']}")
                print(f"  w: {result['optimization']['w']}")
                print(f"  wdamp: {result['optimization']['wdamp']}")
                print(f"  c1: {result['optimization']['c1']}")
                print(f"  c2: {result['optimization']['c2']}")
            
            print("\n=== End of to_dict() Output ===\n")
            
            print("[get_components] --- Successfully created result dictionary ---")
            return jsonify(result)
        except Exception as e:
            print(f"[get_components] --- Error: {str(e)} ---")
            import traceback
            print(f"[get_components] --- Traceback: {traceback.format_exc()} ---")
            logger.error(f"Error in get_components: {str(e)}\n{traceback.format_exc()}")
            return jsonify({'error': str(e)}), 500

    @app.route("/api/sessions", methods=["GET"])
    def get_sessions():
        try:
            # Get session_id from the request
            session_id = request.args.get("session_id")
            
            if not session_id:
                return jsonify({"error": "No session ID available"}), 400
                
            # Find session data by session_id (which is the primary key)
            session_data = SessionData.query.get(session_id)
            if not session_data:
                return jsonify([])
                
            return jsonify([session_data.to_dict()])
        except Exception as e:
            logger.error(f"Error fetching session data: {str(e)}")
            return jsonify({"error": "Failed to fetch session data"}), 500

    @app.route("/api/sessions/<string:session_id>", methods=["PUT"])
    def update_session(session_id):
        try:
            session_data = SessionData.query.get_or_404(session_id)
            data = request.get_json()
            
            if not data:
                return jsonify({"error": "No data provided"}), 400
            
            # Update session fields
            for key, value in data.items():
                if hasattr(session_data, key) and key != 'session_id':  # Don't update the primary key
                    setattr(session_data, key, value)
            
            # Update session timestamp
            session_data.updated_at = datetime.utcnow()
            
            db.session.commit()
            return jsonify(session_data.to_dict())
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating session {session_id}: {str(e)}")
            return jsonify({"error": "Failed to update session"}), 500

    # Initialize a new session
    @app.route("/api/session/initialize", methods=["POST"])
    def initialize_session():
        print("\n=== Session Initialization Request ===")
        print(f"Request Method: {request.method}")
        print(f"Request Headers: {dict(request.headers)}")
        print(f"Request Data: {request.get_data()}")
        
        try:
            data = request.get_json() or {}
            print(f"Parsed JSON Data: {data}")
            
            # Always generate a new UUID for the session
            session_id = str(uuid.uuid4())
            print(f"Generated Session ID: {session_id}")
            
            # Create session with current timestamp
            current_time = datetime.utcnow()
            session_data = SessionData(
                session_id=session_id,
                created_at=current_time,
                updated_at=current_time
            )
            print(f"Created Session Data Object: {session_data.to_dict()}")
            
            db.session.add(session_data)
            db.session.commit()
            print("Successfully committed session to database")
            
            response = {
                'success': True,
                'session_id': session_data.session_id
            }
            print(f"Sending Response: {response}")
            return jsonify(response)
            
        except Exception as e:
            db.session.rollback()
            print(f"ERROR in initialize_session: {str(e)}")
            print(f"Error Type: {type(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            logger.error(f"Error initializing session: {str(e)}")
            return jsonify({"error": "Failed to initialize session", "details": str(e)}), 500

    @app.route("/api/component/<component_type>", methods=["POST"])
    def save_component(component_type):
        try:
            data = request.get_json()
            print(f"Received data for {component_type}: {data}")  # Print received data
            if not data:
                print("No data provided in request")
                return jsonify({"error": "No data provided"}), 400
                
            # Check if session_id is provided
            session_id = data.get('session_id')
            if not session_id:
                print("No session_id provided in request")
                return jsonify({"error": "session_id is required"}), 400
                
            # Map component_type to the appropriate model
            component_models = {
                'wind_turbine': WindTurbine,
                'battery': Battery,
                'grid': Grid,
                'pv_system': PhotovoltaicSystem,
                'inverter': Inverter,
                'diesel_generator': DieselGenerator,
                'charge_controller': ChargeController,
                'grid_selling': GridSelling,
                'geography_economy': GeographyEconomy,
                'system_config': SystemConfiguration,
                'optimization': Optimization
            }
            
            if component_type not in component_models:
                print(f"Unknown component type: {component_type}")
                return jsonify({"error": f"Unknown component type: {component_type}"}), 400
                
            model_class = component_models[component_type]
            
            # Check if all necessary fields are present in the original data
            required_fields = [column.name for column in model_class.__table__.columns if column.nullable is False]
            print(f"Required fields for {component_type}: {required_fields}")
            print(f"Received fields: {list(data.keys())}")
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"Missing required fields: {missing_fields}")
                return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
            
            # Extract component data (remove session_id as it's handled separately)
            component_data = {k: v for k, v in data.items() if k != 'session_id'}
            
            # Check if component already exists for this session
            existing = model_class.query.filter_by(session_id=session_id).first()
            
            if existing:
                print(f"Updating existing {component_type} for session {session_id}")
                # Update existing component
                for key, value in component_data.items():
                    if hasattr(existing, key):
                        setattr(existing, key, value)
                component = existing
            else:
                print(f"Creating new {component_type} for session {session_id}")
                # Create new component
                component = model_class(session_id=session_id, **component_data)
                db.session.add(component)
                
            db.session.commit()
            
            response = {
                "message": f"{component_type} saved successfully",
                "session_id": session_id
            }
            print(f"Sending response: {response}")  # Print response
            return jsonify(response), 201
        except Exception as e:
            db.session.rollback()
            print(f"Error saving {component_type}: {str(e)}")
            logger.error(f"Error saving {component_type}: {str(e)}")
            return jsonify({"error": str(e)}), 500

    @app.route("/api/component/completed_models", methods=["GET"])
    def get_completed_models():
        try:
            print("[get_completed_models] --- ENTER route ---")
            session_id = request.args.get("session_id")
            print(f"[get_completed_models] --- Received session_id: {session_id}")
            if not session_id:
                print("[get_completed_models] --- No session ID available")
                return jsonify({"error": "No session ID available"}), 400

            # Query the database for completed models
            completed_models = {
                "wind_turbine": WindTurbine.query.filter_by(session_id=session_id).first() is not None,
                "battery": Battery.query.filter_by(session_id=session_id).first() is not None,
                "grid": Grid.query.filter_by(session_id=session_id).first() is not None,
                "pv_system": PhotovoltaicSystem.query.filter_by(session_id=session_id).first() is not None,
                "inverter": Inverter.query.filter_by(session_id=session_id).first() is not None,
                "diesel_generator": DieselGenerator.query.filter_by(session_id=session_id).first() is not None,
                "geography_economy": GeographyEconomy.query.filter_by(session_id=session_id).first() is not None,
                "system_config": SystemConfiguration.query.filter_by(session_id=session_id).first() is not None,
                "optimization": Optimization.query.filter_by(session_id=session_id).first() is not None
            }
            print(f"[get_completed_models] --- Completed models: {completed_models}")

            return jsonify(completed_models)
        except Exception as e:
            print(f"[get_completed_models] --- ERROR: {str(e)}")
            logger.error(f"Error fetching completed models: {str(e)}")
            return jsonify({"error": "Failed to fetch completed models"}), 500

    @app.route("/api/results/<string:session_id>", methods=["GET"])
    def get_results(session_id):
        try:
            print(f"[get_results] --- Processing results for session {session_id} ---")
            
            # Get all models for this session
            session_data = SessionData.query.get_or_404(session_id)
                        
            # Clear previous logs
            output_logs.clear()
            
            # Retrieve all components from the database
            geo_economy = GeographyEconomy.query.filter_by(session_id=session_id).first()
            system_config = SystemConfiguration.query.filter_by(session_id=session_id).first()
            pv_system = PhotovoltaicSystem.query.filter_by(session_id=session_id).first()
            wind_turbine = WindTurbine.query.filter_by(session_id=session_id).first()
            battery = Battery.query.filter_by(session_id=session_id).first()
            diesel_gen = DieselGenerator.query.filter_by(session_id=session_id).first()
            inverter = Inverter.query.filter_by(session_id=session_id).first()
            grid = Grid.query.filter_by(session_id=session_id).first()
            optimization = Optimization.query.filter_by(session_id=session_id).first()
            charge_controller = ChargeController.query.filter_by(session_id=session_id).first()
            
            print(f"[get_results] --- Retrieved database models for session {session_id} ---")
            
            # Validate required components
            if not system_config:
                raise ValueError("System configuration is required")
            if not geo_economy:
                raise ValueError("Geography and economy data is required")
            if not optimization:
                raise ValueError("Optimization parameters are required")
            
            # Create Input_Data object
            InData = Input_Data()
            
            # Map Geography & Economy parameters
            InData.n_ir_rate = geo_economy.n_ir_rate
            InData.e_ir_rate = geo_economy.e_ir_rate
            InData.Tax_rate = geo_economy.Tax_rate
            InData.RE_incentives_rate = geo_economy.RE_incentives_rate
            print(f"[get_results] --- Mapped economics data ---")
            
            # Map System Configuration parameters
            InData.LPSP_max = system_config.LPSP_max_rate
            InData.RE_min_rate = system_config.RE_min_rate
            InData.PV = system_config.PV
            InData.WT = system_config.WT
            InData.DG = system_config.DG
            InData.Bat = system_config.Bat
            InData.Lead_acid = system_config.Lead_acid
            InData.Li_ion = system_config.Li_ion
            print(f"[get_results] --- Mapped system configuration ---")
            
            # Validate component dependencies
            if system_config.Bat and not inverter:
                raise ValueError("Battery requires an inverter")
            if (system_config.PV or system_config.WT) and not inverter:
                raise ValueError("PV or Wind Turbine requires an inverter")
            
            # Map PV System parameters if enabled
            if system_config.PV:
                if not pv_system:
                    raise ValueError("PV system is enabled but no PV data provided")
                
                # Map System Configuration Parameters
                InData.system_capacity = pv_system.system_capacity
                InData.azimuth = pv_system.azimuth
                InData.tilt = pv_system.tilt
                InData.array_type = pv_system.array_type
                InData.module_type = pv_system.module_type
                InData.losses = pv_system.losses
                
                # Map Technical Parameters
                InData.fpv = pv_system.fpv
                InData.Tcof = pv_system.Tcof
                InData.Tref = pv_system.Tref
                InData.Tc_noct = pv_system.Tc_noct
                InData.Ta_noct = pv_system.Ta_noct
                InData.G_noct = pv_system.G_noct
                InData.n_PV = pv_system.n_PV
                InData.Gref = pv_system.Gref
                InData.L_PV = pv_system.L_PV
                InData.gama = pv_system.gama
                
                # Map Economic Parameters
                InData.C_PV = pv_system.C_PV
                InData.R_PV = pv_system.R_PV
                InData.MO_PV = pv_system.MO_PV
                
                # Calculate total engineering costs for PV
                InData.Engineering_Costs = (
                    pv_system.Installation_cost +
                    pv_system.Overhead +
                    pv_system.Sales_and_marketing +
                    pv_system.Permiting_and_Inspection +
                    pv_system.Electrical_BoS +
                    pv_system.Structural_BoS +
                    pv_system.Supply_Chain_costs +
                    pv_system.Profit_costs +
                    pv_system.Sales_tax
                )
                print(f"[get_results] --- Mapped PV parameters ---")
            
            # Map Wind Turbine parameters if enabled
            if system_config.WT:
                if not wind_turbine:
                    raise ValueError("Wind turbine is enabled but no wind data provided")
                InData.h_hub = wind_turbine.h_hub
                InData.h0 = wind_turbine.h0
                InData.nw = wind_turbine.nw
                InData.v_cut_out = wind_turbine.v_cut_out
                InData.v_cut_in = wind_turbine.v_cut_in
                InData.v_rated = wind_turbine.v_rated
                InData.alfa_wind_turbine = wind_turbine.alfa_wind_turbine
                InData.L_WT = wind_turbine.L_WT
                InData.C_WT = wind_turbine.C_WT
                InData.R_WT = wind_turbine.R_WT
                InData.MO_WT = wind_turbine.MO_WT
                print(f"[get_results] --- Mapped wind turbine parameters ---")
            
            # Map Battery parameters if enabled
            if system_config.Bat:
                if not battery:
                    raise ValueError("Battery is enabled but no battery data provided")
                InData.SOC_min = battery.SOC_min
                InData.SOC_max = battery.SOC_max
                InData.SOC_initial = battery.SOC_initial
                InData.self_discharge_rate = battery.self_discharge_rate
                InData.L_B = battery.L_B
                
                if system_config.Lead_acid:
                    InData.Cnom_Leadacid = battery.Cnom_Leadacid
                    InData.alfa_battery_leadacid = battery.alfa_battery_leadacid
                    InData.c = battery.c
                    InData.k = battery.k
                    InData.Ich_max_leadacid = battery.Ich_max_leadacid
                    InData.Vnom_leadacid = battery.Vnom_leadacid
                    InData.ef_bat_leadacid = battery.ef_bat_leadacid
                    InData.Q_lifetime_leadacid = battery.Q_lifetime_leadacid
                
                if system_config.Li_ion:
                    InData.Ich_max_Li_ion = battery.Ich_max_Li_ion
                    InData.Idch_max_Li_ion = battery.Idch_max_Li_ion
                    InData.alfa_battery_Li_ion = battery.alfa_battery_Li_ion
                
                print(f"[get_results] --- Mapped battery parameters ---")
            
            # Map Diesel Generator parameters if enabled
            if system_config.DG:
                if not diesel_gen:
                    raise ValueError("Diesel generator is enabled but no diesel data provided")
                InData.a = diesel_gen.a
                InData.b = diesel_gen.b
                InData.C_DG = diesel_gen.C_DG
                InData.R_DG = diesel_gen.R_DG
                InData.MO_DG = diesel_gen.MO_DG
                InData.C_fuel = diesel_gen.C_fuel
                InData.C_fuel_adj = diesel_gen.C_fuel_adj_rate
                print(f"[get_results] --- Mapped diesel generator parameters ---")
            
            # Map Inverter parameters if required
            if system_config.PV or system_config.WT or system_config.Bat:
                if not inverter:
                    raise ValueError("Inverter is required for the selected components")
                InData.n_I = inverter.n_I
                InData.L_I = inverter.L_I
                InData.DC_AC_ratio = inverter.DC_AC_ratio
                InData.C_I = inverter.C_I
                InData.R_I = inverter.R_I
                InData.MO_I = inverter.MO_I
                print(f"[get_results] --- Mapped inverter parameters ---")
            
            # Map Grid parameters if provided
            if grid:
                InData.Grid = grid.Grid
                InData.NEM = grid.NEM
                InData.Annual_expenses = grid.Annual_expenses
                InData.Grid_sale_tax_rate = grid.Grid_sale_tax_rate
                InData.Grid_Tax_amount = grid.Grid_Tax_amount
                InData.Grid_escalation = grid.Grid_escalation_rate
                InData.Grid_credit = grid.Grid_credit
                InData.NEM_fee = grid.NEM_fee
                InData.SC_flat = grid.SC_flat
                InData.Pbuy_max = grid.Pbuy_max
                InData.Psell_max = grid.Psell_max
                print(f"[get_results] --- Mapped grid parameters ---")
            
            # Map Charge Controller parameters if battery is enabled
            if system_config.Bat and charge_controller:
                InData.C_CH = charge_controller.C_CH
                InData.R_CH = charge_controller.R_CH
                InData.MO_CH = charge_controller.MO_CH
                print(f"[get_results] --- Mapped charge controller parameters ---")
            
            # Map Optimization parameters
            InData.MaxIt = optimization.MaxIt
            InData.nPop = optimization.nPop
            InData.w = optimization.w
            InData.wdamp = optimization.wdamp
            InData.c1 = optimization.c1
            InData.c2 = optimization.c2
            print(f"[get_results] --- Mapped optimization parameters ---")
            
            # Create the X vector (component sizes) based on enabled components
            X = [0, 0, 0, 0, 0]  # [Npv, Nwt, Nbat, N_DG, Cn_I]
            
            # Set component sizes based on system configuration
            if system_config.PV:
                X[0] = 10.0  # Default PV capacity in kW
            if system_config.WT:
                X[1] = 5.0   # Default Wind Turbine capacity in kW
            if system_config.Bat:
                X[2] = 10.0  # Default Battery capacity in kWh
            if system_config.DG:
                X[3] = 5.0   # Default Diesel Generator capacity in kW
            
            # Set inverter capacity based on generation capacity
            if system_config.PV or system_config.WT or system_config.Bat:
                X[4] = max(X[0] + X[1], 5.0)  # Size inverter to handle maximum generation
            
            print(f"[get_results] --- Using system component sizes X = {X} ---")
            
            # Call the Gen_Results function to generate outputs
            try:
                print(f"[get_results] --- Calling Gen_Results ---")
                Gen_Results(X, InData)
                print(f"[get_results] --- Gen_Results completed successfully ---")
            except Exception as e:
                print(f"[get_results] --- Error during Gen_Results: {str(e)} ---")
                raise
            
            # Get paths to generated plots
            plot_paths = [
                "/static/output/figs/Cash_Flow.png",
                "/static/output/figs/Energy_Distribution.png",
                "/static/output/figs/Battery_State_of_Charge.png",
                "/static/output/figs/Grid_Interconnection.png",
                "/static/output/figs/Specific_day_results.png",
                "/static/output/figs/Daily-Monthly-Yearly_average_cost_of_energy_system.png"
            ]
            
            # Return the logs and plot paths
            print(f"[get_results] --- Returning {len(output_logs)} log entries and {len(plot_paths)} plots ---")
            return jsonify({
                "logs": output_logs,
                "plots": plot_paths
            })
        except ValueError as e:
            # Handle validation errors with a 400 status code
            print(f"[get_results] --- Validation Error: {str(e)} ---")
            logger.error(f"Validation error in get_results: {str(e)}")
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            # Log the full error and traceback
            import traceback
            error_trace = traceback.format_exc()
            print(f"[get_results] --- ERROR: {str(e)}\n{error_trace}")
            logger.error(f"Error generating results: {str(e)}\n{error_trace}")
            return jsonify({"error": str(e)}), 500

    return app

# Create the application instance
app = create_app()

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000, debug=app.config['DEBUG'])