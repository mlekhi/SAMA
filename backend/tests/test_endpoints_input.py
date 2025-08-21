#!/usr/bin/env python3
"""
Test script for testing all data input/saving endpoints
Uses actual Flask endpoints with hardcoded test user ID
Assumes backend is already running on localhost:5000
"""

import sys
import os
import json
import requests
from typing import Dict, Any

# Add the current directory to the path
sys.path.append(os.path.dirname(__file__))

class InputEndpointTester:
    def __init__(self):
        self.base_url = "http://127.0.0.1:5000"
        self.test_user_id = "jbUnRQG76wZMyAcBa5W3NCjZx212"  # Real Firebase user ID
        
        # ============================================================================
        # 🔥 FIREBASE CONFIGURATION
        # ============================================================================
        # 
        # Option 1: Use your Vite Firebase config to get real tokens
        # Option 2: Hardcode a token manually
        # Option 3: Use mock token (will get 401 errors)
        #
        # ============================================================================
        
        # 🔑 FIREBASE CONFIG (from your Vite project)
        # Copy these values from your frontend Firebase config
        self.firebase_config = {
            "apiKey": "AIzaSyD89G0n94m1ABEQsaqLTuUEXtLEW1MYISI",
            "authDomain": "sama-7b0e9.firebaseapp.com",
            "projectId": "sama-7b0e9",
            "storageBucket": "sama-7b0e9.firebasestorage.com",
            "messagingSenderId": "118318946498",
            "appId": "1:118318946498:web:0927869eb3f83f6a71c35b"
        }
        
        # 🔑 TEST USER CREDENTIALS
        # Create a test user in Firebase Console or use existing one
        self.test_user_email = "test@example.com"
        self.test_user_password = "testpassword123"
        
        # 🔑 HARDCODED TOKEN (alternative to Firebase Auth)
        # If you prefer to just paste a token manually
        self.hardcoded_token = "YOUR_FIREBASE_ID_TOKEN_HERE"
        
        # Try to get a real token, fall back to hardcoded, then mock
        self.active_token = self._get_authentication_token()
        
        # Load hourly consumption data from Eload(in).csv
        self.hourly_consumption = self._load_hourly_consumption()
        
        # Test data that matches test_app.py values
        self.test_data = {
            'geography_economy': {
                'latitude': 40.7128,
                'longitude': -74.0060,
                'address': 'New York, NY',
                'n_ir_rate': 2.75,
                'e_ir_rate': 2.0,
                'Tax_rate': 0,
                'RE_incentives_rate': 30
            },
            'optimization': {
                'maxIterations': 200,
                'populationSize': 50,
                'inertiaWeight': 1,
                'inertiaWeightDamping': 0.99,
                'personalLearningCoeff': 2,
                'globalLearningCoeff': 2
            },
            'system_config': {
                'lifetime': 25,
                'LPSP_max_rate': 0.0999999,
                'RE_min_rate': 75.0,
                'annualData': 9,
                'PV': True,
                'WT': False,
                'DG': False,
                'Bat': False,
                'consumptionDataSource': 'hourly'  # Changed to hourly
            },
            'pv_config': {
                'fpv': 0.9,
                'Tcof': -0.0047,
                'Tref': 25,
                'Tc_noct': 45,
                'Ta_noct': 20,
                'G_noct': 800,
                'n_PV': 0.9,
                'Gref': 1000,
                'L_PV': 25,
                'C_PV': 2682,
                'R_PV': 0,
                'MO_PV': 0,
                'Installation_cost': 0,
                'Overhead': 0,
                'Sales_and_marketing': 0,
                'Permiting_and_Inspection': 0,
                'Electrical_BoS': 0,
                'Structural_BoS': 0,
                'Supply_Chain_costs': 0,
                'Profit_costs': 0,
                'Sales_tax': 0,
                'azimuth': 180,
                'tilt': 35,
                'soiling': 0.02
            },
            'inverter_config': {
                'n_I': 0.9,
                'L_I': 25,
                'DC_AC_ratio': 1.2,
                'C_I': 440,
                'R_I': 0,
                'MO_I': 0
            },
            'grid': {
                'Grid': 1,
                'NEM': 1,
                'Annual_expenses': 0,
                'Grid_sale_tax_rate': -0.1,
                'Grid_Tax_amount': 0.017,
                'Grid_escalation_rate': 5.7,
                'Grid_credit': 0,
                'NEM_fee': 0,
                'SC_flat': 21.24,
                'Pbuy_max': 200,
                'Psell_max': 200,
                'season': json.dumps([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0]),  # Convert to JSON string
                'holidays': json.dumps([]),  # Empty holidays array as JSON string
                'rateStructure': 'tou',
                'onPrice': json.dumps([0.11, 0.11]),  # Convert to JSON string
                'midPrice': json.dumps([0.064, 0.064]),  # Convert to JSON string
                'offPrice': json.dumps([0.053, 0.053]),  # Convert to JSON string
                'onHours': json.dumps([[11, 12, 13, 14, 15, 16], [7, 8, 9, 10, 17, 18]]),  # Convert to JSON string
                'midHours': json.dumps([[7, 8, 9, 10, 17, 18], [11, 12, 13, 14, 15, 16]]),  # Convert to JSON string
                'compensation_option': '1:1'
            }
        }
        
        self.headers = {
            'Authorization': f'Bearer {self.active_token}',
            'Content-Type': 'application/json'
        }
    
    def _get_authentication_token(self):
        """Get authentication token using Firebase Auth or fallback options"""
        
        # Option 1: Try to use Firebase Auth to get real token
        if self._is_firebase_config_valid():
            print("🔥 Firebase config detected, attempting to get real token...")
            try:
                token = self._get_firebase_token()
                if token:
                    print("✅ Got real Firebase token!")
                    return token
            except Exception as e:
                print(f"⚠️  Firebase Auth failed: {str(e)}")
        
        # Option 2: Use hardcoded token if provided
        if self.hardcoded_token != "YOUR_FIREBASE_ID_TOKEN_HERE":
            print("🔑 Using hardcoded Firebase token")
            return self.hardcoded_token
        
        # Option 3: Fall back to mock token
        print("⚠️  Using mock token - endpoints will return 401 errors")
        print("   To test with real data:")
        print("   1. Fill in your Firebase config above, OR")
        print("   2. Hardcode a Firebase ID token above")
        return "mock_firebase_token"
    
    def _is_firebase_config_valid(self):
        """Check if Firebase config has been filled in"""
        return (self.firebase_config["apiKey"] != "YOUR_FIREBASE_API_KEY_HERE" and
                self.firebase_config["projectId"] != "YOUR_PROJECT_ID")
    
    def _get_firebase_token(self):
        """Get Firebase ID token using Firebase Auth REST API"""
        try:
            # Step 1: Sign in with email/password to get ID token
            sign_in_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={self.firebase_config['apiKey']}"
            
            sign_in_data = {
                "email": self.test_user_email,
                "password": self.test_user_password,
                "returnSecureToken": True
            }
            
            response = requests.post(sign_in_url, json=sign_in_data, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                id_token = result.get('idToken')
                if id_token:
                    print(f"   ✅ Authenticated as: {self.test_user_email}")
                    return id_token
                else:
                    print("   ❌ No ID token in response")
                    return None
            else:
                error_data = response.json()
                error_message = error_data.get('error', {}).get('message', 'Unknown error')
                
                if "USER_NOT_FOUND" in error_message:
                    print(f"   ❌ User {self.test_user_email} not found")
                    print("   💡 Create this user in Firebase Console first")
                elif "INVALID_PASSWORD" in error_message:
                    print(f"   ❌ Invalid password for {self.test_user_email}")
                else:
                    print(f"   ❌ Firebase Auth error: {error_message}")
                
                return None
                
        except Exception as e:
            print(f"   ❌ Error getting Firebase token: {str(e)}")
            return None
    
    def _load_hourly_consumption(self):
        """Load hourly consumption data from Eload(in).csv file"""
        try:
            csv_path = 'Eload(in).csv'
            if not os.path.exists(csv_path):
                print(f"⚠️  Warning: {csv_path} not found, using default annual data")
                return None
            
            print(f"📊 Loading hourly consumption data from {csv_path}...")
            
            with open(csv_path, 'r') as file:
                lines = file.readlines()
            
            # Skip header if it exists, convert to float
            if len(lines) > 8760:  # More than 8760 hours, likely has header
                data_lines = lines[1:8761]  # Skip first line, take next 8760
            else:
                data_lines = lines[:8760]  # Take first 8760 lines
            
            hourly_data = []
            for line in data_lines:
                try:
                    value = float(line.strip())
                    hourly_data.append(value)
                except ValueError:
                    print(f"⚠️  Warning: Invalid value in CSV: {line.strip()}")
                    hourly_data.append(0.0)  # Default to 0 if invalid
            
            if len(hourly_data) == 8760:
                total_consumption = sum(hourly_data)
                print(f"   ✅ Loaded {len(hourly_data)} hourly values")
                print(f"   📊 Total annual consumption: {total_consumption:.2f} MWh")
                print(f"   📊 Average hourly consumption: {total_consumption/8760:.4f} MWh")
                return hourly_data
            else:
                print(f"   ❌ Expected 8760 values, got {len(hourly_data)}")
                return None
                
        except Exception as e:
            print(f"   ❌ Error loading hourly data: {str(e)}")
            return None
    
    def check_backend_running(self):
        """Check if the backend is already running"""
        print("🔍 Checking if backend is running...")
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=5)
            if response.status_code == 200:
                print("✅ Backend is running and responding!")
                return True
            else:
                print(f"❌ Backend health check failed: {response.status_code}")
                return False
        except requests.exceptions.RequestException:
            print("❌ Backend is not responding")
            print(f"   Make sure your Flask app is running on {self.base_url}")
            return False
    
    def test_endpoint(self, endpoint: str, data: Dict[str, Any], method: str = 'POST') -> bool:
        """Test a single endpoint and return success status"""
        try:
            if method == 'POST':
                response = requests.post(f"{self.base_url}{endpoint}", 
                                       json=data, 
                                       headers=self.headers,
                                       timeout=10)
            elif method == 'GET':
                response = requests.get(f"{self.base_url}{endpoint}", 
                                      headers=self.headers,
                                      timeout=10)
            
            print(f"   {endpoint}: Status {response.status_code}")
            
            if response.status_code in [200, 201]:
                try:
                    result = response.json()
                    print(f"      Response: {result.get('message', 'Success')}")
                    return True
                except json.JSONDecodeError:
                    print(f"      Response: {response.text[:100]}...")
                    return True
            else:
                print(f"      Error: {response.text[:200]}...")
                return False
                
        except requests.exceptions.ConnectionError:
            print(f"   {endpoint}: ❌ Connection failed (backend not running?)")
            return False
        except requests.exceptions.Timeout:
            print(f"   {endpoint}: ❌ Timeout")
            return False
        except Exception as e:
            print(f"   {endpoint}: ❌ Unexpected error: {str(e)}")
            return False
    
    def test_data_saving_endpoints(self):
        """Test all data saving endpoints"""
        print("\n📝 Testing data saving endpoints...")
        
        endpoints_to_test = [
            ('/api/geography-economy', self.test_data['geography_economy']),
            ('/api/optimization', self.test_data['optimization']),
            ('/api/grid', self.test_data['grid']),
            ('/api/pv-config', self.test_data['pv_config']),
            ('/api/inverter-config', self.test_data['inverter_config'])
        ]
        
        success_count = 0
        for endpoint, data in endpoints_to_test:
            if self.test_endpoint(endpoint, data):
                success_count += 1
        
        # Test system config (uses form data)
        print("\n   Testing system config (form data)...")
        form_data = {
            'lifetime': 25,
            'LPSP_max_rate': 0.0999999,
            'RE_min_rate': 75.0,
            'annualData': 9,
            'PV': 'true',
            'WT': 'false',
            'DG': 'false',
            'Bat': 'false',
            'consumptionDataSource': 'hourly'
        }
        
        # Add hourly consumption data if available
        if self.hourly_consumption:
            form_data['hourlyData'] = json.dumps(self.hourly_consumption)
            print(f"   📊 Including {len(self.hourly_consumption)} hourly consumption values")
        
        try:
            response = requests.post(f"{self.base_url}/api/system-config", 
                                   data=form_data, 
                                   headers={'Authorization': f'Bearer {self.active_token}'},
                                   timeout=10)
            print(f"   /api/system-config: Status {response.status_code}")
            if response.status_code in [200, 201]:
                success_count += 1
                try:
                    result = response.json()
                    print(f"      Response: {result.get('message', 'Success')}")
                except json.JSONDecodeError:
                    print(f"      Response: {response.text[:100]}...")
            else:
                print(f"      Error: {response.text[:200]}...")
        except Exception as e:
            print(f"   /api/system-config: ❌ Error: {str(e)}")
        
        print(f"\n   📊 Data saving endpoints: {success_count}/{len(endpoints_to_test) + 1} successful")
        return success_count == len(endpoints_to_test) + 1
    
    def run_input_test(self):
        """Run the complete input endpoint test"""
        print("=" * 80)
        print("🧪 INPUT ENDPOINT TESTING")
        print("=" * 80)
        print(f"Test User ID: {self.test_user_id}")
        print(f"Base URL: {self.base_url}")
        print()
        
        try:
            # Check if backend is running
            if not self.check_backend_running():
                print("❌ Cannot proceed without backend running")
                print(f"   Please start your Flask app first: python3 app.py")
                return False
            
            # Test data saving endpoints
            data_saving_success = self.test_data_saving_endpoints()
            
            # Summary
            print("\n" + "=" * 80)
            print("📊 TEST SUMMARY")
            print("=" * 80)
            print(f"Data Saving Endpoints: {'✅ PASS' if data_saving_success else '❌ FAIL'}")
            
            if data_saving_success:
                print(f"\n🎉 All input endpoints working! Ready for submit testing.")
                print(f"💡 Next step: Run test_endpoints_submit.py")
            else:
                print(f"\n💥 Some input endpoints failed!")
            
            return data_saving_success
            
        except KeyboardInterrupt:
            print("\n⚠️  Test interrupted by user")
            return False
        except Exception as e:
            print(f"\n❌ Test failed with unexpected error: {str(e)}")
            import traceback
            traceback.print_exc()
            return False

def main():
    """Main function to run the input endpoint test"""
    print("🧪 Starting Input Endpoint Testing...")
    print("⚠️  Note: This test requires:")
    print("   1. Backend already running on localhost:5000")
    print("   2. All dependencies installed")
    print("   3. Valid Firebase authentication")
    print()
    print("💡 To start the backend, run: python3 app.py")
    print()
    
    tester = InputEndpointTester()
    success = tester.run_input_test()
    
    if success:
        print("\n🎉 Input endpoint test completed successfully!")
        sys.exit(0)
    else:
        print("\n💥 Input endpoint test failed!")
        sys.exit(1)

if __name__ == "__main__":
    main() 