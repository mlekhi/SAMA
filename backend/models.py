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