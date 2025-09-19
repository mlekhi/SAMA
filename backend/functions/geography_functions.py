from flask import request, jsonify
from models import db, GeographyEconomy
import requests
import os
import json
import logging

logger = logging.getLogger(__name__)

NSRDB_API_KEY = os.environ.get('NSRDB_API_KEY')
NSRDB_EMAIL = os.environ.get('NSRDB_EMAIL')

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

        # Validate required fields for new records
        if not geo_economy.latitude:  # If this is a new record or missing required fields
            required_fields = ['latitude', 'longitude', 'address']
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

        # Update fields - only update if provided
        if 'latitude' in data and data['latitude'] is not None:
            geo_economy.latitude = data['latitude']
        if 'longitude' in data and data['longitude'] is not None:
            geo_economy.longitude = data['longitude']
        if 'address' in data and data['address'] is not None:
            geo_economy.address = data['address']
        if 'n_ir_rate' in data and data['n_ir_rate'] is not None:
            geo_economy.n_ir_rate = data['n_ir_rate']
        if 'e_ir_rate' in data and data['e_ir_rate'] is not None:
            geo_economy.e_ir_rate = data['e_ir_rate']
        if 'Tax_rate' in data and data['Tax_rate'] is not None:
            geo_economy.Tax_rate = data['Tax_rate']
        if 'RE_incentives_rate' in data and data['RE_incentives_rate'] is not None:
            geo_economy.RE_incentives_rate = data['RE_incentives_rate']
        
        db.session.commit()

        # Fetch and save METEO.csv only if we have valid coordinates
        if geo_economy.latitude and geo_economy.longitude:
            fetch_and_save_meteo_csv(user_id, geo_economy.latitude, geo_economy.longitude)

        return jsonify({'id': geo_economy.user_id, 'message': 'Geography and economy data saved successfully'}), 200
    except Exception as e:
        logger.error(f"Error saving geography economy data: {str(e)}")
        return jsonify({'error': str(e)}), 500

def get_geography():
    user_id = request.user['uid']
    geo_econ = GeographyEconomy.query.get(user_id)
    if not geo_econ:
        return jsonify({'error': 'No geography data found'}), 404
    return jsonify({
        'n_ir_rate': geo_econ.n_ir_rate,
        'e_ir_rate': geo_econ.e_ir_rate,
        'Tax_rate': geo_econ.Tax_rate,
        'RE_incentives_rate': geo_econ.RE_incentives_rate
    })