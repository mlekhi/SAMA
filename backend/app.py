from flask import Flask, Response, request, jsonify, send_from_directory
from flask_cors import CORS
from sama_python.Input_Data import InData
from sama_python.Input_Data import Input_Data
import requests
import os
import pandas as pd
import numpy as np
import sama_python.pso as pso
from math import ceil
import json
from datetime import datetime
import os
import pandas as pd
from sama_python.Results import output_logs
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
# CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}})

# Get API keys from environment variables
NREL_API_KEY = os.getenv('NREL_API_KEY')
HOLIDAY_API_KEY = os.getenv('HOLIDAY_API_KEY')

if not NREL_API_KEY or not HOLIDAY_API_KEY:
    raise ValueError("API keys not found in environment variables. Please check your .env file.")

@app.route("/mapAPI")
def mapAPIFetch():
    longitude = request.args.get("lat") # get from frontend
    latitude = request.args.get("long") # get from frontend

    
    email = "dbharga@uwo.ca"
    api_key = NREL_API_KEY  # Use environment variable
    # first do a general data query to check what regions are available
    nsrdb_data_query_url = f'https://developer.nrel.gov/api/solar/nsrdb_data_query.json?api_key={api_key}&wkt=POINT({latitude}+{longitude})'
    dq_response = requests.get(nsrdb_data_query_url)
    if not dq_response.ok:
        return jsonify({"error": f"Failed to fetch data", "status": dq_response.status_code, "details": dq_response.text}), dq_response.status_code#\return {'error': 'Failed to fetch NSRDB data'}
    dq_response_json = dq_response.json()
    # loop through outputs and check that displayName is 
    foundLink = ""
    foundLinks = []
    selectedItem = {"Error": "No data found for your region"}

    #if "outputs" in dq_response_json and isinstance(dq_response["outputs"], list):
    for item in dq_response_json["outputs"]:
        # North America
        if isinstance(item, dict) and (item.get("displayName") == "Physical Solar Model v3 TMY"):
            foundLinks = item.get("links")
            foundLink = foundLinks[0].get("link")
            selectedItem = item 
            break
        # Europe, Africa, Middle East
        elif isinstance(item, dict) and item.get("displayName") == "Meteosat Prime Meridian V1.0.0 TMY":
            foundLinks = item.get("links")
            foundLink = foundLinks[0].get("link")
            selectedItem = item
            break
        # Asia, Australia
        elif isinstance(item, dict) and item.get("displayName") == "Himawari TMY":
            foundLinks = item.get("links")
            foundLink = foundLinks[0].get("link")
            selectedItem = item
            break
        elif isinstance(item, dict) and item.get("displayName") == "NSRDB MSG V1.0.0 TMY":
            foundLinks = item.get("links")
            foundLink = foundLinks[0].get("link")
            selectedItem = item
            break

    if(foundLink != ""):
        foundLink = foundLink.replace('yourapikey', api_key)
        foundLink = foundLink.replace('youremail', email)
        downloaded = requests.get(foundLink)
        if not dq_response.ok:
            return jsonify({"error": f"Failed to fetch data", "status": downloaded.status_code, "details": downloaded.text}), downloaded.status_code#\return {'error': 'Failed to fetch NSRDB data'}
        # save to file acually called METEO.csv
        with open("../backend/sama_python/content/METEO.csv", mode="w", newline="") as f:
            f.write(downloaded.text)
        #return selectedItem
        return Response(downloaded, mimetype="text/csv")  

    return dq_response_json #foundLink

#results - graph
IMAGES_FOLDER = os.path.join(os.path.dirname(__file__), 'sama_python/output/figs') 
@app.route("/image/<filename>")
def get_image(filename):
    try:
        return send_from_directory(IMAGES_FOLDER, filename)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404

# results - time series
@app.route('/api/csv_data', methods=['GET'])
def get_csv_data():
    # Path to your CSV file
    csv_file_path = '../backend/sama_python/output/data/Outputforplotting.csv'

    # Read CSV file with pandas
    try:
        df = pd.read_csv(csv_file_path)
        # Convert DataFrame to JSON format
        data = df.to_dict(orient='records')
        return jsonify(data)  # Send the data as a JSON response
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
#results - summary   
@app.route('/get_logs', methods=['GET'])
def get_logs():
    return jsonify(output_logs)

# for geography page
@app.route("/process/geo", methods=["POST"])
def process_geographical_data():
    try:
        data = request.json
        
        InData.n_ir_rate = (float(data["nomDiscRate"]))
        InData.n_ir = InData.n_ir_rate / 100
        InData.e_ir_rate = (float(data["expInfRate"]))
        InData.e_ir = InData.e_ir_rate / 100
         # real discount rate
        InData.ir = (InData.n_ir - InData.e_ir) / (1 + InData.e_ir)
        InData.Tax_rate = (float(data["equipSalePercent"]))
        InData.System_Tax = InData.Tax_rate / 100
        InData.RE_incentives_rate = (float(data["invTaxCredit"]))
        InData.RE_incentives = InData.RE_incentives_rate / 100

        response_data = convert_ndarrays(vars(InData))
        return jsonify({
            "message": "GeoAndEconomy parameters processed successfully",
            "data": response_data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400  # Return error if something goes wrong


 #for system config page
@app.route("/systemConfig", methods=["POST"])
def system_config():

    try:
        
        data = request.get_json()  # Get JSON data from frontend
        
        if not data:
            return jsonify({"error": "No JSON data Received"}), 400
        print("Recieved JSON:", data)
        
         # Validate expected fields
        required_fields = {
            "lifetime": int,
            "maxPL": float,
            "minRenewEC": int,
            "hasHourly": bool,
            "monthlyData": (list, type(None)),
            "annualData": (int, float, type(None)),
            "selectedSystems": dict,
            "batteryType": str
        }

        errors = []
        
        for key, expected_type in required_fields.items():
            if key not in data:
                errors.append(f"Missing key: {key}")
            elif not isinstance(data[key], expected_type):
                errors.append(f"Incorrect type for '{key}': Expected {expected_type}, got {type(data[key])}")

        # Check if selectedSystems contains valid boolean values
        if "selectedSystems" in data and isinstance(data["selectedSystems"], dict):
            for sys_key, sys_value in data["selectedSystems"].items():
                if not isinstance(sys_value, bool):
                    errors.append(f"Invalid value in selectedSystems[{sys_key}]: Expected bool, got {type(sys_value)}")

        if errors:
            return jsonify({"error": "Invalid data format", "details": errors}), 400

        processed_data = process_system_config(InData, data)
        # If everything is correct, continue processing
        return jsonify({
            "message": "System info processed successfully",
            "processed_data": processed_data
        }), 200

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500
    
#handles the CSV file upload 
@app.route("/upload_csv", methods=["POST"])
def upload_csv():
    try:
        SAVE_DIR = "../backend/sama_python/content"  
        os.makedirs(SAVE_DIR, exist_ok=True)  # Ensure directory exists

        file = request.files.get("file")
        if not file:
            return jsonify({"error": "No file uploaded."}), 400

        file_path = os.path.join(SAVE_DIR, "Eload.csv")  # Define file path
        file.save(file_path)  

        # Read CSV and validate format
        df = pd.read_csv(file_path, header=None)
        if df.shape[0] != 8760 or df.shape[1] != 1:
            os.remove(file_path)  # Delete invalid file
            return jsonify({"error": "Invalid CSV format: Must have 8760 rows and 1 column."}), 400

        return jsonify({"message": "CSV uploaded successfully", "file_path": file_path}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/process/systemConfig")
def process_system_config(Input_Data, data):
    
    
    #lifetime
    Input_Data.n = (data['lifetime'])
    #Max Power Loss
    Input_Data.LPSP_max_rate = (data['maxPL'])
    Input_Data.LPSP_max = Input_Data.LPSP_max_rate /100
    #Minimum Renew 
    Input_Data.RE_min_rate=(data['minRenewEC'])
    Input_Data.RE_min = Input_Data.RE_min_rate /100
    
    # Energy Systems
    Input_Data.PV = 1 if data["selectedSystems"].get("PV", False) else 0
    Input_Data.WT = 1 if data["selectedSystems"].get("WT", False) else 0
    Input_Data.DG = 1 if data["selectedSystems"].get("DG", False) else 0
    Input_Data.Bat = 1 if data["selectedSystems"].get("Battery", False) else 0
    # Battery Type
    if Input_Data.Bat:  # Only set battery type if a battery is selected
        if data["batteryType"] == "Li-Ion":
            Input_Data.Li_ion = 1
            Input_Data.Lead_acid = 0
        else:
            Input_Data.Li_ion = 0
            Input_Data.Lead_acid = 1
            
     # Handle Monthly vs. Annual Data
    load_type = "None"
    load_value = None

    if data["hasHourly"]:
        load_type = "Hourly"
        load_value = "CSV file uploaded"
        Input_Data.annual_load = None
        Input_Data.monthly_load = None

    elif data["hasMonthly"] and data["monthlyData"] is not None:
        load_type = "Monthly"
        load_value = data["monthlyData"]
        Input_Data.monthly_load = data["monthlyData"]
        Input_Data.annual_load = None

    elif data["hasAnnual"] and data["annualData"] is not None:
        load_type = "Annual"
        load_value = data["annualData"]
        Input_Data.annual_load = data["annualData"]
        Input_Data.monthly_load = None

    else:
        # If no data, set default annual load
        load_type = "Annual (Default)"
        load_value = 9
        Input_Data.annual_load = 9
        Input_Data.monthly_load = None

    # Returning the assigned values
    return {
        "Lifetime (years)": Input_Data.n,
        "Max Power Loss %": Input_Data.LPSP_max_rate,
        "Min Renewable Energy %": Input_Data.RE_min_rate,
        "Load Type": load_type,
        "Load Value": load_value,
        "Energy Systems": {
            "PV": Input_Data.PV,
            "WT": Input_Data.WT,
            "DG": Input_Data.DG,
            "Battery": Input_Data.Bat
        },
        "Battery Type": "Li-Ion" if Input_Data.Li_ion else "Lead-Acid" if Input_Data.Lead_acid else "None"
    }
 

from sama_python.calcFlatRate import calcFlatRate

# gridInfo
@app.route("/process/gridInfo")
def process_grid_info(Input_Data, data):
    
    rate_structure_keys = [
    'flatPrice', 'seasonalPrices', 'monthlyPrices', 'tieredPrices', 'tierMax',
    'seasonalTieredPrices', 'seasonalTierMax', 'monthlyTieredPrices', 'monthlyTierLimits',
    'onPrice', 'midPrice', 'offPrice', 'onHours', 'midHours'
    ]
    for key in rate_structure_keys:
        if hasattr(Input_Data, key):
            delattr(Input_Data, key)
    
    rate_structure_map = {
        'flatrate': 1,
        'seasonalrate': 2,
        'monthlyrate': 3,
        'tieredrate': 4,
        'seasonaltier': 5,
        'monthlytier': 6,
        'timeofuse': 7
    }
    rate_structure_type = data['utilityStructure']
    Input_Data.rateStructure = rate_structure_map.get(rate_structure_type)

    
    if data.get('isGridConnected', False):
        Input_Data.Grid = 1 if data['isGridConnected'] == "Yes" else 0
        Input_Data.NEM = 1 if data['isNetMetered'] == "Yes" else 0
        
    else:
        Input_Data.Grid = 0
        Input_Data.NEM = 0
        
    # Convert selected summer months into a season array (1 for summer, 0 otherwise)
    summer_months = data.get('summerMonths', [])
    all_months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December']

    Input_Data.season = [1 if month in summer_months else 0 for month in all_months]

    
    if 'annualExpense' in data:
        Input_Data.Annual_expenses = float(data['annualExpense'])
        
    if 'saleTaxPrecentage' in data:
        Input_Data.Grid_sale_tax_rate = float(data['saleTaxPrecentage'])
        Input_Data.Grid_Tax = Input_Data.Grid_sale_tax_rate / 100
        
    if 'gridAdjust' in data:
        Input_Data.Grid_Tax_amount = float(data['gridAdjust'])
        

    if 'yearlyEscRate' in data:
    #   Input_Data.Grid_escalation_rate = float(data['yearlyEscRate'])
        Input_Data.Grid_escalation_rate = np.full(25, float(data['yearlyEscRate']))
        Input_Data.Grid_escalation = Input_Data.Grid_escalation_rate / 100
        
    if 'annualCredits' in data:
        Input_Data.Grid_credit = float(data['annualCredits'])
        
    if 'netMetering' in data:
        Input_Data.NEM_fee = float(data['netMetering'])
        
    if 'monthlyFixedCharge' in data:
        Input_Data.SC_flat = float(data['monthlyFixedCharge'])
        Input_Data.Service_charge = np.ones(12) * float(data['monthlyFixedCharge'])
        
    if 'purchaseCapacity' in data:
        Input_Data.Pbuy_max = float(data['purchaseCapacity'])
        
    if 'sellCapacity' in data:
        Input_Data.Psell_max = float(data['sellCapacity'])
        
    
    if Input_Data.rateStructure == 1:  # Flat Rate
        Input_Data.flatPrice = float(data['prices']['flatPrice'])
        Input_Data.Cbuy = calcFlatRate(Input_Data.flatPrice)
        # print(Input_Data.Cbuy)
        # print(Input_Data.flatPrice)
        # print(calcFlatRate(Input_Data.flatPrice))

    
    elif Input_Data.rateStructure == 2: # seasonal rate
        Input_Data.seasonalPrices = np.array([
            float(data['prices']['summerPrice']), 
            float(data['prices']['winterPrice'])
        ])
        from sama_python.calcSeasonalRate import calcSeasonalRate
        Input_Data.Cbuy = calcSeasonalRate(Input_Data.seasonalPrices, Input_Data.season, Input_Data.daysInMonth)


    elif Input_Data.rateStructure == 3: # monthly rate
        Input_Data.monthlyPrices = np.array([
            float(data['prices']['monthlyPrices'][month]) 
            for month in ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December']
        ])
        from sama_python.calcMonthlyRate import calcMonthlyRate
        Input_Data.Cbuy = calcMonthlyRate(Input_Data.monthlyPrices, Input_Data.daysInMonth)


    elif Input_Data.rateStructure == 4: # Tiered Rate
        Input_Data.tieredPrices = np.array([
            float(data['prices']['tieredRate']['lowTierPrice']),
            float(data['prices']['tieredRate']['mediumTierPrice']),
            float(data['prices']['tieredRate']['highTierPrice'])
        ])
        Input_Data.tierMax = np.array([
            float(data['prices']['tieredRate']['lowTierMaxLoad']),
            float(data['prices']['tieredRate']['mediumTierMaxLoad']),
            float(data['prices']['tieredRate']['highTierMaxLoad'])
        ])
        from sama_python.calcTieredRate import calcTieredRate
        Input_Data.Cbuy = calcTieredRate(Input_Data.tieredPrices, Input_Data.tierMax, Input_Data.Eload, Input_Data.daysInMonth)
    
    
    elif Input_Data.rateStructure == 5: # Seasonal Tiered Rate
        Input_Data.seasonalTieredPrices = np.array([
            [
                float(data['prices']['seasonalTieredRate']['summer']['lowTierPrice']),
                float(data['prices']['seasonalTieredRate']['summer']['mediumTierPrice']),
                float(data['prices']['seasonalTieredRate']['summer']['highTierPrice'])
            ],
            [
                float(data['prices']['seasonalTieredRate']['winter']['lowTierPrice']),
                float(data['prices']['seasonalTieredRate']['winter']['mediumTierPrice']),
                float(data['prices']['seasonalTieredRate']['winter']['highTierPrice'])
            ]
        ])
        Input_Data.seasonalTierMax = np.array([
            [
                float(data['prices']['seasonalTieredRate']['summer']['lowTierMaxLoad']),
                float(data['prices']['seasonalTieredRate']['summer']['mediumTierMaxLoad']),
                float(data['prices']['seasonalTieredRate']['summer']['highTierMaxLoad'])
            ],
            [
                float(data['prices']['seasonalTieredRate']['winter']['lowTierMaxLoad']),
                float(data['prices']['seasonalTieredRate']['winter']['mediumTierMaxLoad']),
                float(data['prices']['seasonalTieredRate']['winter']['highTierMaxLoad'])
            ]
        ])
        from sama_python.calcSeasonalTieredRate import calcSeasonalTieredRate
        Input_Data.Cbuy = calcSeasonalTieredRate(Input_Data.seasonalTieredPrices, Input_Data.seasonalTierMax, Input_Data.Eload, Input_Data.season)
       
       
    elif Input_Data.rateStructure == 6: # Monthly Tiered Rate
        Input_Data.monthlyTieredPrices = np.array([
            [
                float(data['prices']['monthlyTieredRate'][month]['lowTierPrice']),
                float(data['prices']['monthlyTieredRate'][month]['mediumTierPrice']),
                float(data['prices']['monthlyTieredRate'][month]['highTierPrice'])
            ] for month in ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        ])
        Input_Data.monthlyTierLimits = np.array([
            [
                float(data['prices']['monthlyTieredRate'][month]['lowTierMaxLoad']),
                float(data['prices']['monthlyTieredRate'][month]['mediumTierMaxLoad']),
                float(data['prices']['monthlyTieredRate'][month]['highTierMaxLoad'])
            ] for month in ['January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December']
        ])
        from sama_python.calcMonthlyTieredRate import calcMonthlyTieredRate
        Input_Data.Cbuy = calcMonthlyTieredRate(Input_Data.monthlyTieredPrices, Input_Data.monthlyTierLimits, Input_Data.Eload)
    
    
    elif Input_Data.rateStructure == 7: # Time of Use
        Input_Data.onPrice = np.array([
            float(data['prices']['timeOfUse']['summerPeakRate']),
            float(data['prices']['timeOfUse']['winterPeakRate'])
        ])
        Input_Data.midPrice = np.array([
            float(data['prices']['timeOfUse']['summerMidPeakRate']),
            float(data['prices']['timeOfUse']['winterMidPeakRate'])
        ])
        Input_Data.offPrice = np.array([
            float(data['prices']['timeOfUse']['summerOffPeakRate']),
            float(data['prices']['timeOfUse']['winterOffPeakRate'])
        ])
        Input_Data.onHours = [
            [hour for hour_range in data['prices']['timeOfUse']['summerPeakHours'] 
            for hour in generate_hour_range(hour_range['start'], hour_range['end'])],
            [hour for hour_range in data['prices']['timeOfUse']['winterPeakHours'] 
            for hour in generate_hour_range(hour_range['start'], hour_range['end'])]
        ]   
        Input_Data.midHours = [
            [hour for hour_range in data['prices']['timeOfUse']['summerMidPeakHours'] 
            for hour in generate_hour_range(hour_range['start'], hour_range['end'])],
            [hour for hour_range in data['prices']['timeOfUse']['winterMidPeakHours'] 
            for hour in generate_hour_range(hour_range['start'], hour_range['end'])]
        ]
        
        # If no hours are defined = empty arrays
        if not Input_Data.onHours[0]:  
            Input_Data.onHours[0] = []  
        if not Input_Data.onHours[1]:  
            Input_Data.onHours[1] = []  

        if not Input_Data.midHours[0]:  
            Input_Data.midHours[0] = [] 
        if not Input_Data.midHours[1]:  
            Input_Data.midHours[1] = [] 
        
        from sama_python.calcTouRate import calcTouRate
        Input_Data.Cbuy = calcTouRate(Input_Data.year, Input_Data.onPrice, Input_Data.midPrice, Input_Data.offPrice, Input_Data.onHours, Input_Data.midHours, Input_Data.season, Input_Data.daysInMonth, Input_Data.holidays)
        
        
    compensation_map = {
        'flatcomp': 1,
        'monthlycomp': 2,
        'one-to-one': 3
    }
    compensation_type = data['compensation']
    Input_Data.sellStructure = compensation_map.get(compensation_type)
    
    if Input_Data.sellStructure == 1:  
        flat_compensation_price = float(data['prices']['flatComp'])
        Input_Data.Csell = np.full(8760, flat_compensation_price)

    
    elif Input_Data.sellStructure == 2:  # Monthly Compensation
        Input_Data.monthlysellprices = np.array([
                float(data['prices']['monthlyComp'][month]) 
                for month in [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                ]
            ])
        from sama_python.calcMonthlyRate import calcMonthlyRate
        Input_Data.Csell = calcMonthlyRate(Input_Data.monthlysellprices, Input_Data.daysInMonth)
    
    elif Input_Data.sellStructure == 3:  # 1:1 Compensation
        Input_Data.Csell = Input_Data.Cbuy

    return Input_Data


# Converts start and end time from 12-hour format to a list of hours in 24-hour format.
def generate_hour_range(start_time, end_time):
    def convert_to_24hr(hour_str):
        hour = int(hour_str.split(":")[0])  # Get the hour part
        if "pm" in hour_str.lower() and hour != 12:
            hour += 12  # Convert pm times to 24-hour format
        elif "am" in hour_str.lower() and hour == 12:
            hour = 0  # Midnight case: "12am" -> 0
        return hour

    # Convert the start and end times to 24-hour format
    start_hour = convert_to_24hr(start_time)
    end_hour = convert_to_24hr(end_time)
    
    # Generate the array of hours (inclusive of start and end)
    return list(range(start_hour, end_hour + 1))


# Recursively convert NumPy arrays to lists to make them JSON serializable
def convert_ndarrays(obj):
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_ndarrays(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_ndarrays(value) for value in obj]
    else:
        return obj


@app.route("/gridInfo", methods=["POST"])
def grid_info():
    try:
        data = request.json  # Get JSON data from frontend
        updated_data = process_grid_info(InData, data)  # Process grid info
        
        response_data = convert_ndarrays(vars(updated_data))

        return jsonify({
            "message": "Grid info processed successfully",
            "data": response_data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400  # Return error if something goes wrong
    
    

# Holiday API
@app.route('/fetch-holidays', methods=["GET"])
def fetch_holidays():
    try:
        country = request.args.get('country')
        year = '2024' 
        
        api_key = HOLIDAY_API_KEY  # Use environment variable
        url = 'https://holidayapi.com/v1/holidays'

        params = {
            'key': api_key,
            'country': country,
            'year': year,
            'public': True
        }

        response = requests.get(url, params=params)
        response_data = response.json()

        holiday_dates = [holiday['date'] for holiday in response_data.get('holidays', [])]
        
        holidays = [] 
        
        for date in holiday_dates:
            date_obj = datetime.strptime(date, "%Y-%m-%d")
            day_of_year = date_obj.timetuple().tm_yday
            
            holidays.append(day_of_year)    
        
        InData.holidays = holidays

        return jsonify({
            'message': 'Holidays fetched successfully',
            'holidays': holidays
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def tou_hour_array_conversion(hour_array):
    hours = list()
    for i, boolVal in enumerate(hour_array):
        if boolVal:
            hours.append(i)
    return hours
        
        
# Save Excel in Downloads folder
downloads_folder = os.path.join(os.path.expanduser("~"), "Downloads")
EXCEL_FILE_PATH = os.path.join(downloads_folder, "test_data.xlsx")

# Optimization
@app.route("/process/optim", methods=["POST"])
def process_optimization():
    try:
        data = request.json  # Get JSON data from frontend
        
        InData.MaxIt = int(data['maxIterations'])  
        InData.nPop = int(data['populationSize'])  
        InData.w = float(data['inertiaWeight'])
        InData.wdamp = float(data['inertiaWeightDamping'])
        InData.c1 = float(data['personalLearningCoeff'])
        InData.c2 = float(data['globalLearningCoeff'])

        T_type = 1 # Determine the way you want to input the Temperature by choosing one of the numbers above

        if T_type == 1:

            from sama_python.sam_monofacial_poa import runSimulation
            temp_result = runSimulation(InData.weather_url, InData.tilt, InData.azimuth, InData.soiling)
            T_pd_to_numpy = temp_result[1]
            InData.T = T_pd_to_numpy.values

        elif T_type == 2:

            InData.path_T = 'content/Temperature.csv'
            InData.TData = pd.read_csv(InData.path_T, header=None).values
            InData.T = np.array(InData.TData[:, 0])

        elif T_type == 3:

            InData.Monthly_average_temperature = np.array([-2, -5, -2, 1, 3, 6, 15, 22, 27, 23, 16, 7])  # Define the monthly hourly averages for temperature here

            from sama_python.dataextender import dataextender
            InData.T = dataextender(InData.daysInMonth, InData.Monthly_average_temperature)

        else: # Annual average Temperature
            InData.Annual_average_temperature = 12

            InData.T = np.full(8760, InData.Annual_average_temperature)
            
        # Wind speed definitions
        # 1=Hourly Wind speed based on the NSEDB file
        # 2=Hourly Wind speed based on the user CSV file
        # 3=Monthly average Wind speed
        # 4=Annual average Wind speed

        InData.WS_type = 1 # Determine the way you want to input the Wind speed by choosing one of the numbers above

        if InData.WS_type == 1:

            from sama_python.sam_monofacial_poa import runSimulation
            temp_result = runSimulation(InData.weather_url, InData.tilt, InData.azimuth, InData.soiling)
            WS_pd_to_numpy = temp_result[2]
            InData.Vw = WS_pd_to_numpy.values

        elif InData.WS_type == 2:

            InData.path_WS = 'content/WSPEED.csv'
            InData.WSData = pd.read_csv(InData.path_WS, header=None).values
            InData.Vw = np.array(InData.WSData[:, 0])

        elif InData.WS_type == 3:
            InData.Monthly_average_windspeed = np.array([14.1, 21, 12.2, 31, 12.2, 11.2, 12.1, 13, 21, 9.2, 12.3, 18.1])  # Define the monthly hourly averages for load here

            from sama_python.dataextender import dataextender
            InData.Vw = dataextender(InData.daysInMonth, InData.Monthly_average_windspeed)

        else: # Annual average Wind speed

            InData.Annual_average_windspeed = 10
            InData.Vw = np.full(8760, InData.Annual_average_windspeed)
        
        data = {'Eload': InData.Eload, 'G': InData.G, 'T': InData.T, 'Vw': InData.Vw}
        df = pd.DataFrame(data)
        df.to_csv('../backend/sama_python/output/data/Inputs.csv', index=False)
        
        response_data = convert_ndarrays(vars(InData))
        
        # Convert the dictionary to a pandas DataFrame
        df = pd.DataFrame(list(response_data.items()), columns=["Parameter", "Value"])

        # Save DataFrame as Excel file
        df.to_excel(EXCEL_FILE_PATH, index=False)
            
            
        return jsonify({
            "message": "Optimization parameters processed successfully",
            "data": response_data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400  # Return error if something goes wrong


# component pv
@app.route("/process/pv")
def process_componentPV(Input_Data, data):
    InData.azimuth = float(data['azimuthPV'])
    InData.tilt = float(data['tiltPV'])
    InData.soiling = float(data['soilingPV'])
    InData.fpv = float(data['deratingFactor'])
    InData.Tcof = float(data['tempCoefficient'])
    InData.Tref = float(data['tempStandardTestCondition'])
    InData.Tc_noct = float(data['nominalOpCellTemp'])
    InData.Ta_noct = float(data['ambientTemp'])
    InData.G_noct = float(data['solarRadiation'])
    InData.n_PV = float(data['efficiency'])
    InData.Gref = float(data['referenceIrradianc'])
    InData.L_PV = float(data['moduleLifetime'])

    InData.RT_PV  = ceil(InData.n/InData.L_PV) - 1

    InData.C_PV = float(data['capitalCostPV'])
    InData.R_PV = float(data['moduleReplacementCostPV'])
    InData.MO_PV = float(data['OMCostPV'])

    InData.Engineering_Costs = float(data['engineeringOtherCosts'])   
    return Input_Data

@app.route("/pv", methods=["POST"])
def component_PV():
    try:
        data = request.json  # Get JSON data from frontend
        updated_data = process_componentPV(InData, data)
        response_data = convert_ndarrays(vars(updated_data))

        return jsonify({
            "message": "PV component processed successfully",
            "data": response_data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400  # Return error if something goes wrong
    
# component inverter
@app.route("/process/inverter")
def process_componentI(Input_Data, data):
    InData.n_I = float(data['inverterEfficiency'])
    InData.L_I = float(data['inverterLifetime']) 
    InData.DC_AC_ratio = float(data['maxAcceptableRatio']) 
    InData.C_I = float(data['capitalCostI']) 
    InData.R_I = float(data['replacementCostI']) 
    InData.MO_I = float(data['OMCostI']) 
    InData.RT_I = ceil(InData.n/InData.L_I) - 1  
    return Input_Data

@app.route("/inverter", methods=["POST"])
def component_I():
    try:
        data = request.json  # Get JSON data from frontend
        updated_data = process_componentI(InData, data)
        response_data = convert_ndarrays(vars(updated_data))

        return jsonify({
            "message": "Inverter component processed successfully",
            "data": response_data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400  # Return error if something goes wrong

# component diesel generator
@app.route("/process/dg")
def process_componentDG(Input_Data, data):
    InData.a = float(data['slope'])
    InData.b = float(data['interceptCoefficient']) 
    InData.C_DG = float(data['capitalCostDG']) 
    InData.R_DG = float(data['replacementCostDG']) 
    InData.MO_DG = float(data['OMCostDG']) 
    InData.C_fuel = float(data['fuelCostDG'])
    InData.C_fuel_adj_rate = float(data['DGFuelCostRate'])
    InData.C_fuel_adj = InData.C_fuel_adj_rate / 100
    return Input_Data

@app.route("/dg", methods=["POST"])
def component_DG():
    try:
        data = request.json  # Get JSON data from frontend
        updated_data = process_componentDG(InData, data)
        response_data = convert_ndarrays(vars(updated_data))

        return jsonify({
            "message": "DG component processed successfully",
            "data": response_data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400  # Return error if something goes wrong

# component battery
@app.route("/process/bat")
def process_componentB(Input_Data, data):
    InData.SOC_min = float(data['minSoC'])    
    InData.SOC_max = float(data['maxSoC'])
    InData.SOC_initial = float(data['initalSoC'])
    InData.self_discharge_rate = float(data['hourlySelfDischarge'])
    InData.L_B = float(data['batteryLifetime'])
    InData.RT_B = ceil(InData.n / InData.L_B) - 1  

    #if else battery type
    if data.get('batteryType', 'Lead Acid'):
        InData.Cnom_Leadacid = float(data['nomialCapacityLA'])
        InData.alfa_battery_leadacid = float(data['maxChargeRateLA'])
        InData.c = float(data['capacityRatioLA'])
        InData.k = float(data['rateConstantLA'])
        InData.Ich_max_leadacid = float(data['maxChargeCurrentLA'])
        InData.Vnom_leadacid = float(data['nominalVoltageLA'])
        InData.ef_bat_leadacid = float(data['roundTripEfficiencyLA'])
        InData.Q_lifetime_leadacid = float(data['throughoutLA'])
        InData.Cbt_r = (InData.Vnom_leadacid * InData.Cnom_Leadacid) / 1000  # Battery rated Capacity (kWh)
    elif data.get('batterType', 'Li-ion'):
        InData.Ich_max_Li_ion = float(data['maxChargeCurrentL'])
        InData.Idch_max_Li_ion = float(data['maxDischargeCurrentL'])
        InData.alfa_battery_Li_ion = float(data['maxChargeRateL'])
        InData.Vnom_Li_ion = float(data['nominalVoltageL'])
        InData.Cnom_Li = float(data['nominalCapacityL'])
        InData.ef_bat_Li = float(data['roundTripEfficiencyL'])
        InData.Q_lifetime_Li = float(data['throughoutL'])
        InData.Cbt_r = (InData.Vnom_Li_ion * InData.Cnom_Li) / 1000  # Battery rated Capacity (kWh)

    InData.C_B = float(data['capitalCostB']) 
    InData.R_B = float(data['replacementCostB']) 
    InData.MO_B = float(data['maintenanceCostB']) 
    return Input_Data

@app.route("/bat", methods=["POST"])
def component_B():
    try:
        data = request.json  # Get JSON data from frontend
        updated_data = process_componentB(InData, data)
        response_data = convert_ndarrays(vars(updated_data))

        return jsonify({
            "message": "Battery component processed successfully",
            "data": response_data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400  # Return error if something goes wrong

# component wind turbine
@app.route("/process/wt")
def process_componentWT(Input_Data, data):
    InData.h_hub = float(data['hubHeight'])
    InData.h0 = float(data['anemometerHeight'])
    InData.nw = float(data['electricalEfficiency'])
    InData.v_cut_out = float(data['cutOutSpeed'])
    InData.v_cut_in = float(data['cutInSpeed'])
    InData.v_rated = float(data['ratedSpeed'])
    InData.alfa_wind_turbine = float(data['coefficientFriction'])
    InData.L_WT = float(data['lifetimeWT'])
    InData.RT_WT = ceil(InData.n/InData.L_WT)-1

    InData.C_WT = float(data['capitalCostWT'])
    InData.R_WT = float(data['replacementCostWT'])
    InData.MO_WT = float(data['OMCostWT'])

    InData.Engineering_Costs = float(data['engineeringOtherCosts'])

    return Input_Data

@app.route("/wt", methods=["POST"])
def component_WT():
    try:
        data = request.json  # Get JSON data from frontend
        updated_data = process_componentWT(InData, data)
        response_data = convert_ndarrays(vars(updated_data))

        return jsonify({
            "message": "WT component processed successfully",
            "data": response_data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400  # Return error if something goes wrong
    
#routing
@app.route('/get/routing',methods=["GET"])
def get_system_config():
    # Retrieving the current values for energy systems and battery type
    energy_systems = {
        "PV": InData.PV,
        "WT": InData.WT,
        "DG": InData.DG,
        "Battery": InData.Bat
    }
    
    battery_type = "Li-Ion" if InData.Li_ion else "Lead-Acid" if InData.Lead_acid else "None"
    
    return {
        "Energy Systems": energy_systems,
        "Battery Type": battery_type
    }

@app.route('/submit/advanced', methods=['POST'])
def submit_advanced():
    try:
        response_data = convert_ndarrays(vars(InData))
        InData.completeInitialization()
        print("My InData max" + str(InData.MaxIt))
        answer = pso.run(InData)
        # answer["isGeneralCalculator"] = False
        print(answer)
        return jsonify({"message": "in data processed successfully",
            "data": response_data})
    except Exception as e:
        app.logger.error(f'Error in submit_advanced: {e}')
        return jsonify({
            'error': str(e)
        }), 500



if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000, debug=True, threaded=True)