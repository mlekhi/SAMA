#!/usr/bin/env python3
"""
Test script for testing submit functionality and file generation
Uses actual Flask endpoints with hardcoded test user ID
Assumes backend is already running on localhost:5000
Assumes data has already been saved via test_endpoints_input.py
"""

import sys
import os
import json
import requests
import time
from typing import Dict, Any

# Add the current directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

class SubmitEndpointTester:
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
    
    def check_data_exists(self):
        """Check if test data exists in the database"""
        print("\n🔍 Checking if test data exists...")
        
        try:
            # Try to get component selection to verify data exists
            response = requests.get(f"{self.base_url}/api/component-selection", 
                                  headers=self.headers,
                                  timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Test data found: {result}")
                return True
            elif response.status_code == 404:
                print("   ❌ No system config found")
                print("   💡 Run test_endpoints_input.py first to save test data")
                return False
            else:
                print(f"   ⚠️  Unexpected response: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"   ❌ Error checking data: {str(e)}")
            return False
    
    def test_submit_endpoint(self):
        """Test the submit endpoint"""
        print("\n🚀 Testing submit endpoint...")
        
        # Debug: Check what user ID we're actually using
        print(f"   🔍 Test user ID: {self.test_user_id}")
        print(f"   🔍 Active token: {self.active_token[:50]}..." if len(self.active_token) > 50 else f"   🔍 Active token: {self.active_token}")
        
        try:
            response = requests.post(f"{self.base_url}/api/submit", 
                                   headers=self.headers,
                                   timeout=30)  # Longer timeout for optimization
            
            print(f"   /api/submit: Status {response.status_code}")
            
            if response.status_code == 200:
                try:
                    result = response.json()
                    print(f"      ✅ SUCCESS - Response received!")
                    print(f"      📝 Message: {result.get('message', 'No message')}")
                    print(f"      📊 Status: {result.get('status', 'No status')}")
                    print(f"      🆔 User ID: {result.get('user_id', 'No user ID')}")
                    
                    # Print the full response structure
                    print(f"\n      🔍 FULL RESPONSE STRUCTURE:")
                    print(f"         Response keys: {list(result.keys())}")
                    
                    # Verify and print optimization results
                    if 'result' in result:
                        print(f"\n      🎯 OPTIMIZATION RESULTS FOUND:")
                        optimization_result = result['result']
                        
                        if isinstance(optimization_result, dict):
                            print(f"         Result type: dict with {len(optimization_result)} keys")
                            print(f"         Result keys: {list(optimization_result.keys())}")
                            
                            # Print key optimization metrics if they exist
                            key_metrics = ['fitness', 'cost', 'reliability', 'renewable_energy', 'lpsp']
                            for metric in key_metrics:
                                if metric in optimization_result:
                                    value = optimization_result[metric]
                                    print(f"         {metric.upper()}: {value}")
                            
                            # Print first few key-value pairs for inspection
                            print(f"\n         📋 SAMPLE RESULT VALUES:")
                            count = 0
                            for key, value in optimization_result.items():
                                if count < 10:  # Limit to first 10 to avoid overwhelming output
                                    if isinstance(value, (int, float)):
                                        print(f"            {key}: {value}")
                                    elif isinstance(value, list) and len(value) <= 5:
                                        print(f"            {key}: {value}")
                                    elif isinstance(value, dict):
                                        print(f"            {key}: dict with {len(value)} keys")
                                    else:
                                        print(f"            {key}: {type(value).__name__} (length: {len(value) if hasattr(value, '__len__') else 'N/A'})")
                                    count += 1
                                else:
                                    remaining = len(optimization_result) - count
                                    print(f"            ... and {remaining} more fields")
                                    break
                        else:
                            print(f"         Result type: {type(optimization_result).__name__}")
                            print(f"         Result value: {optimization_result}")
                    else:
                        print(f"      ⚠️  No optimization results in response")
                    
                    # Print any other important fields
                    if 'generated_files' in result:
                        print(f"\n      📁 Generated Files: {result['generated_files']}")
                    
                    return True
                except json.JSONDecodeError as e:
                    print(f"      ❌ JSON decode error: {e}")
                    print(f"      Raw response: {response.text[:500]}...")
                    return False
            elif response.status_code == 500:
                try:
                    error_data = response.json()
                    print(f"      ❌ SERVER ERROR (500):")
                    print(f"         Error: {error_data.get('error', 'Unknown error')}")
                    if 'traceback' in error_data:
                        print(f"         Traceback: {error_data['traceback'][:500]}...")
                    else:
                        print(f"         No traceback in response")
                except json.JSONDecodeError:
                    print(f"      ❌ SERVER ERROR (500) - Raw response:")
                    print(f"         {response.text[:500]}...")
                return False
            else:
                print(f"      ❌ HTTP ERROR ({response.status_code}):")
                print(f"         {response.text[:300]}...")
                return False
                
        except requests.exceptions.ConnectionError:
            print(f"   /api/submit: ❌ Connection failed")
            return False
        except requests.exceptions.Timeout:
            print(f"   /api/submit: ❌ Timeout (optimization may be running)")
            return False
        except Exception as e:
            print(f"   /api/submit: ❌ Unexpected error: {str(e)}")
            return False
    
    def test_file_generation(self):
        """Test if files were generated after submit"""
        print("\n📁 Testing file generation...")
        
        output_dir = f'../sama_python/output/{self.test_user_id}'
        figs_dir = f'{output_dir}/figs'
        data_dir = f'{output_dir}/data'
        
        files_found = []
        
        # Check for figure files
        if os.path.exists(figs_dir):
            fig_files = [f for f in os.listdir(figs_dir) if f.endswith('.png')]
            files_found.extend([f'figs/{f}' for f in fig_files])
            print(f"   📊 Found {len(fig_files)} figure files")
        
        # Check for data files
        if os.path.exists(data_dir):
            data_files = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
            files_found.extend([f'data/{f}' for f in data_files])
            print(f"   📊 Found {len(data_files)} data files")
        
        if files_found:
            print(f"   ✅ Files generated: {files_found}")
            return True
        else:
            print(f"   ❌ No files generated")
            return False
    
    def test_files_endpoint(self):
        """Test the files listing endpoint"""
        print("\n📋 Testing files endpoint...")
        
        try:
            response = requests.get(f"{self.base_url}/api/files/{self.test_user_id}", 
                                  headers=self.headers,
                                  timeout=10)
            
            print(f"   /api/files/{self.test_user_id}: Status {response.status_code}")
            
            if response.status_code == 200:
                try:
                    result = response.json()
                    files = result.get('files', {}).get('figures', [])
                    print(f"      Found {len(files)} files")
                    for file_info in files:
                        print(f"         - {file_info.get('display_name', 'Unknown')}")
                    return True
                except json.JSONDecodeError:
                    print(f"      Response: {response.text[:200]}...")
                    return False
            else:
                print(f"      Error: {response.text[:200]}...")
                return False
                
        except Exception as e:
            print(f"   /api/files/{self.test_user_id}: ❌ Error: {str(e)}")
            return False
    
    def run_submit_test(self):
        """Run the complete submit endpoint test"""
        print("=" * 80)
        print("🧪 SUBMIT ENDPOINT TESTING")
        print("=" * 80)
        print(f"Test User ID: {self.test_user_id}")
        print(f"Base URL: {self.base_url}")
        print()
        print("⚠️  Note: This test assumes data has already been saved via test_endpoints_input.py")
        print()
        
        try:
            # Check if backend is running
            if not self.check_backend_running():
                print("❌ Cannot proceed without backend running")
                print(f"   Please start your Flask app first: python3 app.py")
                return False
            
            # Check if test data exists
            if not self.check_data_exists():
                print("❌ Cannot proceed without test data")
                print(f"   Please run test_endpoints_input.py first to save test data")
                return False
            
            # Test submit endpoint
            submit_success = self.test_submit_endpoint()
            
            # Test file generation
            file_generation_success = self.test_file_generation()
            
            # Test files endpoint
            files_endpoint_success = self.test_files_endpoint()
            
            # Summary
            print("\n" + "=" * 80)
            print("📊 TEST SUMMARY")
            print("=" * 80)
            print(f"Submit Endpoint: {'✅ PASS' if submit_success else '❌ FAIL'}")
            print(f"File Generation: {'✅ PASS' if file_generation_success else '❌ PASS'}")
            print(f"Files Endpoint: {'✅ PASS' if files_endpoint_success else '❌ FAIL'}")
            
            overall_success = all([submit_success, file_generation_success, files_endpoint_success])
            print(f"\nOverall Result: {'🎉 ALL TESTS PASSED' if overall_success else '💥 SOME TESTS FAILED'}")
            
            return overall_success
            
        except KeyboardInterrupt:
            print("\n⚠️  Test interrupted by user")
            return False
        except Exception as e:
            print(f"\n❌ Test failed with unexpected error: {str(e)}")
            import traceback
            traceback.print_exc()
            return False

def main():
    """Main function to run the submit endpoint test"""
    print("🧪 Starting Submit Endpoint Testing...")
    print("⚠️  Note: This test requires:")
    print("   1. Backend already running on localhost:5000")
    print("   2. All dependencies installed")
    print("   3. Valid METEO.csv file for the test user")
    print("   4. Test data already saved via test_endpoints_input.py")
    print()
    print("💡 To start the backend, run: python3 app.py")
    print("💡 To save test data first, run: python3 test_endpoints_input.py")
    print()
    
    tester = SubmitEndpointTester()
    success = tester.run_submit_test()
    
    if success:
        print("\n🎉 All submit tests completed successfully!")
        sys.exit(0)
    else:
        print("\n💥 Some submit tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main() 