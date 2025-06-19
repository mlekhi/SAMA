from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class GeographyEconomy(db.Model):
    user_id = db.Column(db.String(100), primary_key=True)
    
    # Geographic coordinates (from map selection or manual input)
    latitude = db.Column(db.Float, nullable=True)  # From map selection in frontend
    longitude = db.Column(db.Float, nullable=True)  # From map selection in frontend
    address = db.Column(db.String(500), nullable=True)  # Full address from geocoding
    
    # Economic parameters (from user input in Geography & Economy page)
    n_ir_rate = db.Column(db.Float, default=5.5)  # Nominal discount rate (%)
    e_ir_rate = db.Column(db.Float, default=2.0)  # Expected inflation rate (%)
    Tax_rate = db.Column(db.Float, default=0.0)   # Equipment sales tax rate (%)
    RE_incentives_rate = db.Column(db.Float, default=30.0)  # Renewable energy incentives rate (%) 