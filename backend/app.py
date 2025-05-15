from flask import Flask, Response, request, jsonify, send_from_directory, session
from flask_cors import CORS
from config import Config
from models import db, SessionData, GeographyEconomy, SystemConfiguration, PhotovoltaicSystem, Inverter, DieselGenerator, Battery, Grid, Optimization, WindTurbine, ChargeController, GridSelling
import requests
from datetime import datetime
import json
from sama_python.Results import output_logs
from sama_python.Input_Data import InData
import sama_python.pso as pso
from math import ceil
import os
import logging
import uuid

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    CORS(app, resources={r"/*": {"origins": "*"}})
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
    def validate_coordinates(lat, lng):
        if not isinstance(lat, (int, float)) or not isinstance(lng, (int, float)):
            raise ValueError("Latitude and longitude must be numbers")
        if not -90 <= lat <= 90:
            raise ValueError("Latitude must be between -90 and 90")
        if not -180 <= lng <= 180:
            raise ValueError("Longitude must be between -180 and 180")
        return True

    def fetch_nrel_data(lat, lng, api_key):
        email = "dbharga@uwo.ca"
        nsrdb_data_query_url = f'https://developer.nrel.gov/api/solar/nsrdb_data_query.json?api_key={api_key}&wkt=POINT({lat}+{lng})'
        
        try:
            dq_response = requests.get(nsrdb_data_query_url, timeout=10)
            dq_response.raise_for_status()
            return dq_response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"NREL API request failed: {str(e)}")
            raise

    def process_nrel_response(response_data):
        valid_sources = [
            "Physical Solar Model v3 TMY",
            "Meteosat Prime Meridian V1.0.0 TMY",
            "Himawari TMY",
            "NSRDB MSG V1.0.0 TMY"
        ]
        
        for item in response_data.get("outputs", []):
            if isinstance(item, dict) and item.get("displayName") in valid_sources:
                links = item.get("links", [])
                if links:
                    return links[0].get("link"), item
        return None, {"Error": "No data found for your region"}

    def save_meteo_data(data, file_path):
        try:
            with open(file_path, mode="w", newline="") as f:
                f.write(data)
            return True
        except IOError as e:
            logger.error(f"Failed to save METEO data: {str(e)}")
            raise

    # API Routes
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

    @app.route("/api/sessions", methods=["POST"])
    def create_session():
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400

            # Use session ID from request or create a new one
            session_id = data.get("session_id") or str(uuid.uuid4())
            session["session_id"] = session_id

            # Create new session data
            session_data = SessionData(
                session_id=session_id,
                latitude=data.get("latitude"),
                longitude=data.get("longitude"),
                system_capacity=data.get("system_capacity"),
                azimuth=data.get("azimuth"),
                tilt=data.get("tilt"),
                array_type=data.get("array_type"),
                module_type=data.get("module_type"),
                losses=data.get("losses")
            )

            db.session.add(session_data)
            db.session.commit()

            return jsonify(session_data.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating session: {str(e)}")
            return jsonify({"error": "Failed to create session"}), 500

    @app.route("/api/map", methods=["GET"])
    def mapAPIFetch():
        try:
            # Validate coordinates
            lat = request.args.get("lat", type=float)
            lng = request.args.get("long", type=float)
            
            if not lat or not lng:
                return jsonify({"error": "Missing required parameters: lat and long"}), 400
            
            validate_coordinates(lat, lng)
            
            # Fetch data from NREL
            api_key = app.config['NREL_API_KEY']
            response_data = fetch_nrel_data(lat, lng, api_key)
            
            # Process response
            found_link, selected_item = process_nrel_response(response_data)
            
            if not found_link:
                return jsonify(selected_item), 404
            
            # Download and save data
            found_link = found_link.replace('yourapikey', api_key).replace('youremail', "dbharga@uwo.ca")
            downloaded = requests.get(found_link, timeout=30)
            downloaded.raise_for_status()
            
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], "METEO.csv")
            save_meteo_data(downloaded.text, file_path)
            
            return Response(downloaded, mimetype="text/csv")
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except requests.exceptions.RequestException as e:
            return jsonify({"error": "Failed to fetch data from NREL", "details": str(e)}), 500
        except Exception as e:
            logger.error(f"Error in mapAPIFetch: {str(e)}")
            return jsonify({"error": "Internal server error", "details": str(e)}), 500

    @app.route("/api/sessions/<string:session_id>", methods=["GET"])
    def get_session(session_id):
        try:
            session_data = SessionData.query.get_or_404(session_id)
            return jsonify(session_data.to_dict())
        except Exception as e:
            logger.error(f"Error fetching session {session_id}: {str(e)}")
            return jsonify({"error": "Failed to fetch session"}), 500

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

    @app.route("/api/sessions/<string:session_id>", methods=["DELETE"])
    def delete_session(session_id):
        try:
            session_data = SessionData.query.get_or_404(session_id)
            
            # Delete all associated components first
            component_models = [
                GeographyEconomy, SystemConfiguration, PhotovoltaicSystem, 
                Inverter, DieselGenerator, Battery, Grid, Optimization,
                WindTurbine, ChargeController, GridSelling
            ]
            
            for model in component_models:
                components = model.query.filter_by(session_id=session_id).all()
                for component in components:
                    db.session.delete(component)
            
            # Then delete the session data itself
            db.session.delete(session_data)
            db.session.commit()
            
            return jsonify({"message": "Session and all associated data deleted successfully"})
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting session {session_id}: {str(e)}")
            return jsonify({"error": "Failed to delete session"}), 500

    @app.route('/api/defaults', methods=['GET'])
    def get_defaults():
        try:
            from sama_python.Input_Data import Input_Data
            in_data = Input_Data()
            
            defaults = {
                # Geo and Economy defaults
                'nomDiscRate': in_data.n_ir_rate,
                'expInfRate': in_data.e_ir_rate,
                'equipSalePercent': in_data.Tax_rate,
                'invTaxCredit': in_data.RE_incentives_rate,
                
                # System Config defaults
                'lifetime': in_data.n,
                'maxPL': in_data.LPSP_max_rate,
                'minRenewEC': in_data.RE_min_rate,
                'annualData': 9,  # Default load type
                
                # Battery defaults
                'SOC_min': in_data.SOC_min,
                'SOC_max': in_data.SOC_max,
                'SOC_initial': in_data.SOC_initial,
                'self_discharge_rate': in_data.self_discharge_rate,
                'battery_lifetime': in_data.L_B,
                
                # PV defaults
                'pv_derating': in_data.fpv,
                'temp_coef': in_data.Tcof,
                'temp_ref': in_data.Tref,
                'temp_noct': in_data.Tc_noct,
                'pv_efficiency': in_data.n_PV,
                'pv_lifetime': in_data.L_PV,
                
                # Inverter defaults
                'inverter_efficiency': in_data.n_I,
                'inverter_lifetime': in_data.L_I,
                'dc_ac_ratio': in_data.DC_AC_ratio,
                
                # Wind defaults
                'hub_height': in_data.h_hub,
                'anemometer_height': in_data.h0,
                'wind_efficiency': in_data.nw,
                'cut_out_speed': in_data.v_cut_out,
                'cut_in_speed': in_data.v_cut_in,
                'rated_speed': in_data.v_rated,
                'wind_lifetime': in_data.L_WT,
                
                # Diesel defaults
                'min_load_ratio': in_data.LR_DG,
                'fuel_curve_a': in_data.a,
                'fuel_curve_b': in_data.b,
                'diesel_lifetime': in_data.TL_DG,
                
                # Grid defaults
                'grid_sale_tax': in_data.Grid_sale_tax_rate,
                'grid_tax_amount': in_data.Grid_Tax_amount,
                'grid_credit': in_data.Grid_credit,
                'nem_fee': in_data.NEM_fee,

                # Optimization defaults
                'max_iterations': in_data.MaxIt,
                'population_size': in_data.nPop,
                'inertia_weight': in_data.w,
                'inertia_weight_damping': in_data.wdamp,
                'personal_learning_coeff': in_data.c1,
                'global_learning_coeff': in_data.c2,
                'run_time': in_data.Run_Time
            }
            
            return jsonify(defaults)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route("/process/geo", methods=["POST", "OPTIONS"])
    def process_geo():
        if request.method == "OPTIONS":
            return "", 200
            
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400

            # Check if session_id is provided
            session_id = data.get('session_id')
            if not session_id:
                return jsonify({"error": "session_id is required"}), 400

            # Create a new GeographyEconomy instance
            geo_economy = GeographyEconomy(
                session_id=session_id,
                n_ir_rate=float(data.get('nomDiscRate', 0)),
                e_ir_rate=float(data.get('expInfRate', 0)),
                Tax_rate=float(data.get('equipSalePercent', 0)),
                RE_incentives_rate=float(data.get('invTaxCredit', 0))
            )
            
            # Save to database
            db.session.add(geo_economy)
            db.session.commit()

            return jsonify({
                "message": "Geography and Economy data saved successfully",
                "id": geo_economy.id
            }), 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error saving geography and economy data: {str(e)}")
            return jsonify({"error": str(e)}), 500

    # Initialize a new session
    @app.route("/api/session/initialize", methods=["POST"])
    def initialize_session():
        try:
            data = request.get_json() or {}
            
            # Create a new session with a unique ID
            session_id = data.get("session_id") or str(uuid.uuid4())
            session_data = SessionData(
                session_id=session_id
            )
            
            db.session.add(session_data)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'session_id': session_data.session_id
            })
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error initializing session: {str(e)}")
            return jsonify({"error": "Failed to initialize session", "details": str(e)}), 500

    # Add a generic component route
    @app.route("/api/component/<component_type>", methods=["POST"])
    def save_component(component_type):
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400
                
            # Check if session_id is provided
            session_id = data.get('session_id')
            if not session_id:
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
                return jsonify({"error": f"Unknown component type: {component_type}"}), 400
                
            model_class = component_models[component_type]
            
            # Extract component data (remove session_id as it's handled separately)
            component_data = {k: v for k, v in data.items() if k != 'session_id'}
            
            # Check if component already exists for this session
            existing = model_class.query.filter_by(session_id=session_id).first()
            
            if existing:
                # Update existing component
                for key, value in component_data.items():
                    if hasattr(existing, key):
                        setattr(existing, key, value)
                component = existing
            else:
                # Create new component
                component = model_class(session_id=session_id, **component_data)
                db.session.add(component)
                
            db.session.commit()
            
            return jsonify({
                "message": f"{component_type} saved successfully",
                "id": component.id,
                "session_id": session_id
            }), 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error saving {component_type}: {str(e)}")
            return jsonify({"error": str(e)}), 500

    # Special route to recreate database tables (REMOVE IN PRODUCTION)
    @app.route("/api/reset_db", methods=["GET"])
    def reset_db():
        try:
            db.drop_all()
            db.create_all()
            return jsonify({"message": "Database tables reset successfully"})
        except Exception as e:
            logger.error(f"Error resetting database: {str(e)}")
            return jsonify({"error": "Failed to reset database", "details": str(e)}), 500

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host='127.0.0.1', port=5000, debug=app.config['DEBUG'])