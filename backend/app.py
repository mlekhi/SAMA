from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase_admin import credentials, initialize_app, auth
import os
from functools import wraps
import logging
import json
from models import db, GeographyEconomy
from config import Config

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
def health_check():
    return jsonify({'status': 'healthy'}), 200

@app.route('/api/geography-economy', methods=['POST'])
@require_auth
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

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='127.0.0.1', port=5000, debug=True)
