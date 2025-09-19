#!/usr/bin/env python3
"""
Test script for Case 1: PV+Grid system using Flask test client
This tests the actual app.py endpoints and flow, not just replicating the logic.
Based on the specifications provided:
- Nominal Discount rate: 2.75%
- Expected Inflation rate: 2%
- PV Capital Cost: 2682
- Grid connected with Time of Use rates
- System: PV=1, WT=0, DG=0, Bat=0, Grid=1
"""

import os
import sys
import json
import numpy as np
from datetime import datetime
import unittest
from unittest.mock import patch

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models import (
    GeographyEconomy, Optimization, SystemConfig, Grid, 
    PhotovoltaicSystem, Inverter, DieselGenerator, Battery, WindTurbine
)

# Dummy user ID for testing
DUMMY_USER_ID = "test_case1_user"

class TestCase1PVGrid(unittest.TestCase):
    """Test Case 1: PV+Grid system using Flask test client"""
    
    def setUp(self):
        """Set up test client and database"""
        self.app = app
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.create_all()
            # Clear any existing test data
            GeographyEconomy.query.filter_by(user_id=DUMMY_USER_ID).delete()
            Optimization.query.filter_by(user_id=DUMMY_USER_ID).delete()
            SystemConfig.query.filter_by(user_id=DUMMY_USER_ID).delete()
            Grid.query.filter_by(user_id=DUMMY_USER_ID).delete()
            PhotovoltaicSystem.query.filter_by(user_id=DUMMY_USER_ID).delete()
            Inverter.query.filter_by(user_id=DUMMY_USER_ID).delete()
            db.session.commit()
    
    def create_dummy_token(self):
        """Create a dummy Firebase token for testing"""
        # Mock Firebase token verification
        return {
            'uid': DUMMY_USER_ID,
            'email': 'test@example.com'
        }
    
    def setup_meteo_file(self):
        """Verify the existing METEO.csv file is available for testing"""
        meteo_file = f'backend/sama_python/output/{DUMMY_USER_ID}/data/METEO.csv'
        
        if os.path.exists(meteo_file):
            print(f"Using existing METEO.csv file at {meteo_file}")
        else:
            print(f"Warning: METEO.csv file not found at {meteo_file}")
            # Create the directory structure if it doesn't exist
            meteo_dir = f'backend/sama_python/output/{DUMMY_USER_ID}/data'
            os.makedirs(meteo_dir, exist_ok=True)
            print(f"Created directory structure: {meteo_dir}")
    
    @patch('app.auth.verify_id_token')
    def test_geography_economy_endpoint(self, mock_verify):
        """Test the geography-economy endpoint"""
        mock_verify.return_value = self.create_dummy_token()
        
        data = {
            'latitude': 40.7128,
            'longitude': -74.0060,
            'address': 'New York, NY, USA',
            'n_ir_rate': 2.75,  # Nominal Discount rate: 2.75%
            'e_ir_rate': 2.0,   # Expected Inflation rate: 2%
            'Tax_rate': 0.0,
            'RE_incentives_rate': 0.0
        }
        
        response = self.client.post('/api/geography-economy', 
                                  json=data,
                                  headers={'Authorization': 'Bearer dummy_token'})
        
        self.assertEqual(response.status_code, 200)
        result = response.get_json()
        self.assertEqual(result['id'], DUMMY_USER_ID)
        print("✓ Geography-Economy endpoint test passed")
    
    @patch('app.auth.verify_id_token')
    def test_optimization_endpoint(self, mock_verify):
        """Test the optimization endpoint"""
        mock_verify.return_value = self.create_dummy_token()
        
        data = {
            'maxIterations': 200,
            'populationSize': 50,
            'inertiaWeight': 1,
            'inertiaWeightDamping': 0.99,
            'personalLearningCoeff': 2,
            'globalLearningCoeff': 2.0
        }
        
        response = self.client.post('/api/optimization', 
                                  json=data,
                                  headers={'Authorization': 'Bearer dummy_token'})
        
        self.assertEqual(response.status_code, 200)
        result = response.get_json()
        self.assertEqual(result['id'], DUMMY_USER_ID)
        print("✓ Optimization endpoint test passed")
    
    @patch('app.auth.verify_id_token')
    def test_system_config_endpoint(self, mock_verify):
        """Test the system-config endpoint"""
        mock_verify.return_value = self.create_dummy_token()
        
        data = {
            'lifetime': '25',
            'LPSP_max_rate': '0.0999999',
            'RE_min_rate': '75.0',
            'annualData': '9500',
            'PV': 'true',
            'WT': 'false',
            'DG': 'false',
            'Bat': 'false',
            'consumptionDataSource': 'annual'
        }
        
        response = self.client.post('/api/system-config', 
                                  data=data,
                                  headers={'Authorization': 'Bearer dummy_token'})
        
        self.assertEqual(response.status_code, 200)
        result = response.get_json()
        self.assertEqual(result['id'], DUMMY_USER_ID)
        print("✓ System Config endpoint test passed")
    
    @patch('app.auth.verify_id_token')
    def test_pv_config_endpoint(self, mock_verify):
        """Test the pv-config endpoint"""
        mock_verify.return_value = self.create_dummy_token()
        
        data = {
            'fpv': 0.9,
            'Tcof': -0.3,
            'Tref': 25.0,
            'Tc_noct': 45.0,
            'Ta_noct': 20.0,
            'G_noct': 800.0,
            'n_PV': 0.2182,
            'Gref': 1000.0,
            'L_PV': 25.0,
            'C_PV': 2382.0,  # Capital cost as specified
            'R_PV': 2382.0,
            'MO_PV': 26.0,
            'Installation_cost': 0.0,
            'Overhead': 0.0,
            'Sales_and_marketing': 0.0,
            'Permiting_and_Inspection': 0.0,
            'Electrical_BoS': 0.0,
            'Structural_BoS': 0.0,
            'Supply_Chain_costs': 0.0,
            'Profit_costs': 0.0,
            'Sales_tax': 0.0,
            'azimuth': 180.0,
            'tilt': 34.0,
            'soiling': 5
        }
        
        response = self.client.post('/api/pv-config', 
                                  json=data,
                                  headers={'Authorization': 'Bearer dummy_token'})
        
        self.assertEqual(response.status_code, 200)
        result = response.get_json()
        self.assertEqual(result['user_id'], DUMMY_USER_ID)
        self.assertEqual(result['C_PV'], 2682.0)
        print("✓ PV Config endpoint test passed")
    
    @patch('app.auth.verify_id_token')
    def test_inverter_config_endpoint(self, mock_verify):
        """Test the inverter-config endpoint"""
        mock_verify.return_value = self.create_dummy_token()
        
        data = {
            'n_I': 0.96,
            'L_I': 25.0,
            'DC_AC_ratio': 1.2,
            'C_I': 300.0,
            'R_I': 300.0,
            'MO_I': 0.0
        }
        
        response = self.client.post('/api/inverter-config', 
                                  json=data,
                                  headers={'Authorization': 'Bearer dummy_token'})
        
        self.assertEqual(response.status_code, 200)
        result = response.get_json()
        self.assertEqual(result['user_id'], DUMMY_USER_ID)
        print("✓ Inverter Config endpoint test passed")
    
    @patch('app.auth.verify_id_token')
    def test_grid_config_endpoint(self, mock_verify):
        """Test the grid endpoint with Time of Use rates"""
        mock_verify.return_value = self.create_dummy_token()
        
        data = {
            'Grid': True,
            'NEM': True,
            'Annual_expenses': 0.0,
            'Grid_sale_tax_rate': -0.1,
            'Grid_Tax_amount': 0.017,
            'Grid_escalation_rate': 5.7,
            'Grid_credit': 0.0,
            'NEM_fee': 0.0,
            'SC_flat': 21.24,
            'Pbuy_max': 200.0,
            'Psell_max': 200.0,
            'compensation_option': '1:1',
            'rateStructure': 'tou',
            'season': [5, 6, 7, 8, 9, 10],  # Summer months: May-October
            'holidays': [],
            'onPrice': [0.11, 0.11],      # Summer/Winter Peak Rate
            'midPrice': [0.064, 0.064],   # Summer/Winter Mid-Peak Rate
            'offPrice': [0.053, 0.053],   # Summer/Winter Off-Peak Rate
            'onHours': [11, 16, 7, 10, 17, 18],  # Peak hours flattened
            'midHours': [7, 10, 17, 18, 11, 16]  # Mid-peak hours flattened
        }
        
        response = self.client.post('/api/grid', 
                                  json=data,
                                  headers={'Authorization': 'Bearer dummy_token'})
        
        self.assertEqual(response.status_code, 200)
        result = response.get_json()
        self.assertEqual(result['id'], DUMMY_USER_ID)
        print("✓ Grid Config endpoint test passed")
    
    @patch('app.auth.verify_id_token')
    def test_complete_flow(self, mock_verify):
        """Test the complete flow from data entry to optimization"""
        mock_verify.return_value = self.create_dummy_token()
        
        # Setup weather data using existing METEO.csv
        self.setup_meteo_file()
        
        # Step 1: Geography and Economy
        geo_data = {
            'latitude': 40.7128,
            'longitude': -74.0060,
            'address': 'New York, NY, USA',
            'n_ir_rate': 2.75,
            'e_ir_rate': 2.0,
            'Tax_rate': 8.0,
            'RE_incentives_rate': 0.0
        }
        response = self.client.post('/api/geography-economy', 
                                  json=geo_data,
                                  headers={'Authorization': 'Bearer dummy_token'})
        self.assertEqual(response.status_code, 200)
        
        # Step 2: Optimization
        opt_data = {
            'maxIterations': 50,
            'populationSize': 30,
            'inertiaWeight': 0.9,
            'inertiaWeightDamping': 0.99,
            'personalLearningCoeff': 2.0,
            'globalLearningCoeff': 2.0
        }
        response = self.client.post('/api/optimization', 
                                  json=opt_data,
                                  headers={'Authorization': 'Bearer dummy_token'})
        self.assertEqual(response.status_code, 200)
        
        # Step 3: System Configuration
        sys_data = {
            'lifetime': '25',
            'LPSP_max_rate': '5.0',
            'RE_min_rate': '0.0',
            'annualData': '10000.0',
            'PV': 'true',
            'WT': 'false',
            'DG': 'false',
            'Bat': 'false',
            'consumptionDataSource': 'annual'
        }
        response = self.client.post('/api/system-config', 
                                  data=sys_data,
                                  headers={'Authorization': 'Bearer dummy_token'})
        self.assertEqual(response.status_code, 200)
        
        # Step 4: PV Configuration
        pv_data = {
            'fpv': 0.9, 'Tcof': -0.004, 'Tref': 25.0, 'Tc_noct': 45.0,
            'Ta_noct': 20.0, 'G_noct': 800.0, 'n_PV': 0.18, 'Gref': 1000.0,
            'L_PV': 25.0, 'C_PV': 2682.0, 'R_PV': 2682.0, 'MO_PV': 20.0,
            'Installation_cost': 0.0, 'Overhead': 0.0, 'Sales_and_marketing': 0.0,
            'Permiting_and_Inspection': 0.0, 'Electrical_BoS': 0.0,
            'Structural_BoS': 0.0, 'Supply_Chain_costs': 0.0,
            'Profit_costs': 0.0, 'Sales_tax': 0.0, 'azimuth': 180.0,
            'tilt': 30.0, 'soiling': 0.95
        }
        response = self.client.post('/api/pv-config', 
                                  json=pv_data,
                                  headers={'Authorization': 'Bearer dummy_token'})
        self.assertEqual(response.status_code, 200)
        
        # Step 5: Inverter Configuration
        inv_data = {
            'n_I': 0.95, 'L_I': 15.0, 'DC_AC_ratio': 1.2,
            'C_I': 300.0, 'R_I': 300.0, 'MO_I': 10.0
        }
        response = self.client.post('/api/inverter-config', 
                                  json=inv_data,
                                  headers={'Authorization': 'Bearer dummy_token'})
        self.assertEqual(response.status_code, 200)
        
        # Step 6: Grid Configuration
        grid_data = {
            'Grid': True, 'NEM': True, 'Annual_expenses': 0.0,
            'Grid_sale_tax_rate': -0.1, 'Grid_Tax_amount': 0.017,
            'Grid_escalation_rate': 5.7, 'Grid_credit': 0.0,
            'NEM_fee': 0.0, 'SC_flat': 21.24, 'Pbuy_max': 200.0,
            'Psell_max': 200.0, 'compensation_option': '1:1',
            'rateStructure': 'tou', 'season': [5, 6, 7, 8, 9, 10],
            'holidays': [], 'onPrice': [0.11, 0.11],
            'midPrice': [0.064, 0.064], 'offPrice': [0.053, 0.053],
            'onHours': [11, 16, 7, 10, 17, 18],
            'midHours': [7, 10, 17, 18, 11, 16]
        }
        response = self.client.post('/api/grid', 
                                  json=grid_data,
                                  headers={'Authorization': 'Bearer dummy_token'})
        self.assertEqual(response.status_code, 200)
        
        print("✓ Complete flow test passed - all endpoints working correctly")
        
        # Step 7: Test submit endpoint (this will run the actual optimization)
        print("\nTesting submit endpoint (this will run the actual PSO optimization)...")
        response = self.client.post('/api/submit', 
                                  headers={'Authorization': 'Bearer dummy_token'})
        
        # The submit endpoint should return success even if optimization takes time
        self.assertEqual(response.status_code, 200)
        result = response.get_json()
        self.assertEqual(result['user_id'], DUMMY_USER_ID)
        self.assertEqual(result['status'], 'success')
        
        print("✓ Submit endpoint test passed - optimization completed successfully!")

def main():
    """Run the test suite"""
    print("=" * 60)
    print("SAMA Test Case 1: PV+Grid System (Flask App Testing)")
    print("=" * 60)
    print(f"Test User ID: {DUMMY_USER_ID}")
    print(f"System Configuration: PV=1, WT=0, DG=0, Bat=0, Grid=1")
    print(f"PV Capital Cost: $2682/kW")
    print(f"Grid: Time of Use rates with 1:1 compensation")
    print("=" * 60)
    
    # Run the test suite
    unittest.main(verbosity=2, exit=False)

if __name__ == "__main__":
    main()
