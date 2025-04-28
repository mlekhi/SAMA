from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    simulations = db.relationship('Simulation', backref='user', lazy=True)

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
            }
        } 