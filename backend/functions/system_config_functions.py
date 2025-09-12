from flask import request, jsonify
from models import db, SystemConfig, GeographyEconomy, Optimization, PhotovoltaicSystem, WindTurbine, Battery, DieselGenerator, Grid
import json
import logging

logger = logging.getLogger(__name__)

def get_system_config():
    user_id = request.user['uid']
    sys_config = SystemConfig.query.get(user_id)
    if not sys_config:
        return jsonify({'error': 'No system config found'}), 404
    return jsonify({
        'lifetime': sys_config.lifetime,
        'LPSP_max_rate': sys_config.LPSP_max_rate,
        'RE_min_rate': sys_config.RE_min_rate,
        'PV': sys_config.PV,
        'WT': sys_config.WT,
        'DG': sys_config.DG,
        'Bat': sys_config.Bat,
        'consumption_data_source': sys_config.consumption_data_source,
        'annualData': sys_config.annualData,
        'hourly_consumption': sys_config.hourly_consumption,
        'monthly_consumption': sys_config.monthly_consumption
    })

def save_system_config():
    try:
        user_id = request.user['uid']
        
        # Check if record exists
        system_config = SystemConfig.query.get(user_id)
        if not system_config:
            system_config = SystemConfig(user_id=user_id)
            db.session.add(system_config)

        # Handle form data (from system config page)
        data = request.form
        system_config.lifetime = data.get('lifetime')
        system_config.LPSP_max_rate = data.get('LPSP_max_rate')
        system_config.RE_min_rate = data.get('RE_min_rate')
        system_config.annualData = data.get('annualData')
        
        # Handle boolean fields from form data
        system_config.PV = data.get('PV', 'false').lower() == 'true'
        system_config.WT = data.get('WT', 'false').lower() == 'true'
        system_config.DG = data.get('DG', 'false').lower() == 'true'
        system_config.Bat = data.get('Bat', 'false').lower() == 'true'
        
        # Handle consumption data source and storage
        consumption_data_source = data.get('consumptionDataSource')
        system_config.consumption_data_source = consumption_data_source
        
        # Handle CSV data upload
        if consumption_data_source == 'hourly':
            # Check if hourly data is provided as JSON string
            hourly_data_json = data.get('hourlyData')
            if hourly_data_json:
                try:
                    hourly_data = json.loads(hourly_data_json)
                    if len(hourly_data) == 8760:
                        system_config.hourly_consumption = hourly_data_json
                    else:
                        return jsonify({'error': f'Invalid hourly data length. Expected 8760 values, got {len(hourly_data)}'}), 400
                except json.JSONDecodeError:
                    return jsonify({'error': 'Invalid JSON format for hourly data'}), 400
            else:
                # Fallback to individual form fields (for backward compatibility)
                hourly_data = []
                for i in range(8760):
                    hour_key = f'hour_{i}'
                    if hour_key in data and data[hour_key]:
                        hourly_data.append(float(data[hour_key]))
                    else:
                        return jsonify({'error': f'Missing hourly data for hour {i+1}'}), 400
                
                system_config.hourly_consumption = json.dumps(hourly_data)
            
        elif consumption_data_source == 'monthly':
            # Check if monthly data is provided as JSON string
            monthly_data_json = data.get('monthlyData')
            if monthly_data_json:
                try:
                    monthly_data = json.loads(monthly_data_json)
                    if len(monthly_data) == 12:
                        system_config.monthly_consumption = monthly_data_json
                    else:
                        return jsonify({'error': f'Invalid monthly data length. Expected 12 values, got {len(monthly_data)}'}), 400
                except json.JSONDecodeError:
                    return jsonify({'error': 'Invalid JSON format for monthly data'}), 400
            else:
                # Fallback to individual form fields (for backward compatibility)
                monthly_data = []
                for i in range(12):
                    month_key = f'month_{i}'
                    if month_key in data and data[month_key]:
                        monthly_data.append(float(data[month_key]))
                    else:
                        return jsonify({'error': f'Missing monthly data for month {i+1}'}), 400
                
                system_config.monthly_consumption = json.dumps(monthly_data)
            
        elif consumption_data_source in ['annual', 'manual']:
            # Annual data is already stored in annualData field
            if not system_config.annualData or system_config.annualData == '':
                return jsonify({'error': 'Annual consumption data is required'}), 400
        
        db.session.commit()
        return jsonify({'id': system_config.user_id, 'message': 'System configuration data saved successfully'}), 200
    except Exception as e:
        logger.error(f"Error saving system configuration data: {str(e)}")
        return jsonify({'error': str(e)}), 500
