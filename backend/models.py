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

class SystemConfig(db.Model):
    user_id = db.Column(db.String(100), primary_key=True)
    
    # System configuration parameters
    lifetime = db.Column(db.Integer, nullable=False)  # System lifetime
    LPSP_max_rate = db.Column(db.Float, nullable=False)  # Loss of Power Supply Probability max rate
    RE_min_rate = db.Column(db.Float, nullable=False)  # Renewable Energy minimum rate
    annualData = db.Column(db.Float, nullable=False)  # Annual data
    PV = db.Column(db.Boolean, nullable=False)  # Photovoltaic system
    WT = db.Column(db.Boolean, nullable=False)  # Wind Turbine
    DG = db.Column(db.Boolean, nullable=False)  # Diesel Generator
    Bat = db.Column(db.Boolean, nullable=False)  # Battery
    Lead_acid = db.Column(db.Boolean, nullable=False)  # Lead acid battery
    Li_ion = db.Column(db.Boolean, nullable=False)  # Lithium ion battery 