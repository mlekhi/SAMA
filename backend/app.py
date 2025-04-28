from flask import Flask, Response, request, jsonify, send_from_directory
from flask_cors import CORS
from config import Config
from models import db, User, Simulation
import requests
import pandas as pd
import numpy as np
from datetime import datetime
import json
from sama_python.Results import output_logs
from sama_python.Input_Data import InData
import sama_python.pso as pso
from math import ceil
import os

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    CORS(app, resources={r"/*": {"origins": "*"}})
    db.init_app(app)
    
    # Error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad Request', 'message': str(error)}), 400
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not Found', 'message': str(error)}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal Server Error', 'message': str(error)}), 500

    # API Routes
    @app.route("/mapAPI")
    def mapAPIFetch():
        try:
            longitude = request.args.get("lat", type=float)
            latitude = request.args.get("long", type=float)
            
            if not longitude or not latitude:
                return jsonify({"error": "Missing required parameters: lat and long"}), 400

            email = "dbharga@uwo.ca"
            api_key = app.config['NREL_API_KEY']
            
            # First do a general data query to check what regions are available
            nsrdb_data_query_url = f'https://developer.nrel.gov/api/solar/nsrdb_data_query.json?api_key={api_key}&wkt=POINT({latitude}+{longitude})'
            dq_response = requests.get(nsrdb_data_query_url)
            
            if not dq_response.ok:
                return jsonify({
                    "error": "Failed to fetch data",
                    "status": dq_response.status_code,
                    "details": dq_response.text
                }), dq_response.status_code
                
            dq_response_json = dq_response.json()
            
            # Process the response and find appropriate data source
            foundLink = ""
            selectedItem = {"Error": "No data found for your region"}
            
            for item in dq_response_json.get("outputs", []):
                if isinstance(item, dict):
                    display_name = item.get("displayName")
                    if display_name in [
                        "Physical Solar Model v3 TMY",
                        "Meteosat Prime Meridian V1.0.0 TMY",
                        "Himawari TMY",
                        "NSRDB MSG V1.0.0 TMY"
                    ]:
                        links = item.get("links", [])
                        if links:
                            foundLink = links[0].get("link")
                            selectedItem = item
                            break

            if foundLink:
                foundLink = foundLink.replace('yourapikey', api_key).replace('youremail', email)
                downloaded = requests.get(foundLink)
                
                if not downloaded.ok:
                    return jsonify({
                        "error": "Failed to fetch data",
                        "status": downloaded.status_code,
                        "details": downloaded.text
                    }), downloaded.status_code
                
                # Save to file
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], "METEO.csv")
                with open(file_path, mode="w", newline="") as f:
                    f.write(downloaded.text)
                
                return Response(downloaded, mimetype="text/csv")
            
            return jsonify(dq_response_json)

        except Exception as e:
            app.logger.error(f"Error in mapAPIFetch: {str(e)}")
            return jsonify({"error": "Internal server error", "details": str(e)}), 500

    # Add other routes here...

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host='127.0.0.1', port=5000, debug=app.config['DEBUG'])