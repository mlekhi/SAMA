from flask import request, jsonify
from models import db, PhotovoltaicSystem, Inverter, DieselGenerator, Battery, WindTurbine
import logging

logger = logging.getLogger(__name__)

# PV Config functions
def get_pv_config():
    user_id = request.user['uid']
    pv_system = PhotovoltaicSystem.query.get(user_id)
    if not pv_system:
        return jsonify({'error': 'No PV data found'}), 404
    return jsonify({
        'fpv': pv_system.fpv,
        'Tcof': pv_system.Tcof,
        'Tref': pv_system.Tref,
        'Tc_noct': pv_system.Tc_noct,
        'Ta_noct': pv_system.Ta_noct,
        'G_noct': pv_system.G_noct,
        'n_PV': pv_system.n_PV,
        'Gref': pv_system.Gref,
        'L_PV': pv_system.L_PV,
        'C_PV': pv_system.C_PV,
        'R_PV': pv_system.R_PV,
        'MO_PV': pv_system.MO_PV,
        'Installation_cost': pv_system.Installation_cost,
        'Overhead': pv_system.Overhead,
        'Sales_and_marketing': pv_system.Sales_and_marketing,
        'Permiting_and_Inspection': pv_system.Permiting_and_Inspection,
        'Electrical_BoS': pv_system.Electrical_BoS,
        'Structural_BoS': pv_system.Structural_BoS,
        'Supply_Chain_costs': pv_system.Supply_Chain_costs,
        'Profit_costs': pv_system.Profit_costs,
        'Sales_tax': pv_system.Sales_tax
    })

def save_pv_config():
    try:
        user_id = request.user['uid']
        data = request.get_json()
        pv = PhotovoltaicSystem.query.get(user_id)
        if not pv:
            pv = PhotovoltaicSystem(user_id=user_id)
            db.session.add(pv)
        for field in [
            'fpv', 'Tcof', 'Tref', 'Tc_noct', 'Ta_noct', 'G_noct', 'n_PV', 'Gref', 'L_PV',
            'C_PV', 'R_PV', 'MO_PV', 'Installation_cost', 'Overhead', 'Sales_and_marketing',
            'Permiting_and_Inspection', 'Electrical_BoS', 'Structural_BoS', 'Supply_Chain_costs',
            'Profit_costs', 'Sales_tax', 'azimuth', 'tilt', 'soiling']:
            if field in data:
                setattr(pv, field, data[field])
        db.session.commit()
        return jsonify({field: getattr(pv, field) for field in [
            'user_id', 'fpv', 'Tcof', 'Tref', 'Tc_noct', 'Ta_noct', 'G_noct', 'n_PV', 'Gref', 'L_PV',
            'C_PV', 'R_PV', 'MO_PV', 'Installation_cost', 'Overhead', 'Sales_and_marketing',
            'Permiting_and_Inspection', 'Electrical_BoS', 'Structural_BoS', 'Supply_Chain_costs',
            'Profit_costs', 'Sales_tax', 'azimuth', 'tilt', 'soiling']}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Inverter functions
def get_inverter():
    user_id = request.user['uid']
    inverter = Inverter.query.get(user_id)
    if not inverter:
        return jsonify({'error': 'No inverter data found'}), 404
    return jsonify({
        'n_I': inverter.n_I,
        'L_I': inverter.L_I,
        'DC_AC_ratio': inverter.DC_AC_ratio,
        'C_I': inverter.C_I,
        'R_I': inverter.R_I,
        'MO_I': inverter.MO_I
    })

def save_inverter_config():
    try:
        user_id = request.user['uid']
        data = request.get_json()
        inv = Inverter.query.get(user_id)
        if not inv:
            inv = Inverter(user_id=user_id)
            db.session.add(inv)
        for field in ['n_I', 'L_I', 'DC_AC_ratio', 'C_I', 'R_I', 'MO_I']:
            if field in data:
                setattr(inv, field, data[field])
        db.session.commit()
        return jsonify({field: getattr(inv, field) for field in [
            'user_id', 'n_I', 'L_I', 'DC_AC_ratio', 'C_I', 'R_I', 'MO_I']}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Diesel Generator functions
def get_diesel_config():
    user_id = request.user['uid']
    diesel = DieselGenerator.query.get(user_id)
    if not diesel:
        return jsonify({'error': 'No diesel generator data found'}), 404
    return jsonify({
        'a': diesel.a,
        'b': diesel.b,
        'min_load_ratio': diesel.min_load_ratio,
        'C_DG': diesel.C_DG,
        'R_DG': diesel.R_DG,
        'MO_DG': diesel.MO_DG,
        'C_fuel': diesel.C_fuel,
        'C_fuel_adj_rate': diesel.C_fuel_adj_rate,
        'diesel_lifetime': diesel.diesel_lifetime
    })

def save_dg_config():
    try:
        user_id = request.user['uid']
        data = request.get_json()
        dg = DieselGenerator.query.get(user_id)
        if not dg:
            dg = DieselGenerator(user_id=user_id)
            db.session.add(dg)
        for field in ['a', 'b', 'min_load_ratio', 'C_DG', 'R_DG', 'MO_DG', 'C_fuel', 'C_fuel_adj_rate', 'diesel_lifetime']:
            if field in data:
                setattr(dg, field, data[field])
        db.session.commit()
        return jsonify({field: getattr(dg, field) for field in [
            'user_id', 'a', 'b', 'min_load_ratio', 'C_DG', 'R_DG', 'MO_DG', 'C_fuel', 'C_fuel_adj_rate', 'diesel_lifetime']}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Battery functions
def get_battery_config():
    user_id = request.user['uid']
    battery = Battery.query.get(user_id)
    if not battery:
        return jsonify({'error': 'No battery data found'}), 404
    return jsonify({
        'Lead_acid': battery.Lead_acid,
        'Li_ion': battery.Li_ion,
        'SOC_min': battery.SOC_min,
        'SOC_max': battery.SOC_max,
        'SOC_initial': battery.SOC_initial,
        'self_discharge_rate': battery.self_discharge_rate,
        'L_B': battery.L_B,
        'Cnom_Leadacid': battery.Cnom_Leadacid,
        'alfa_battery_leadacid': battery.alfa_battery_leadacid,
        'c': battery.c,
        'k': battery.k,
        'Ich_max_leadacid': battery.Ich_max_leadacid,
        'Vnom_leadacid': battery.Vnom_leadacid,
        'ef_bat_leadacid': battery.ef_bat_leadacid,
        'Q_lifetime_leadacid': battery.Q_lifetime_leadacid,
        'Ich_max_Li_ion': battery.Ich_max_Li_ion,
        'Idch_max_Li_ion': battery.Idch_max_Li_ion,
        'alfa_battery_Li_ion': battery.alfa_battery_Li_ion,
        'Vnom_Li_ion': battery.Vnom_Li_ion,
        'ef_bat_Li': battery.ef_bat_Li,
        'Cnom_Li': battery.Cnom_Li,
        'Q_lifetime_Li': battery.Q_lifetime_Li,
        'L_B_Li': battery.L_B_Li,
        'C_B': battery.C_B,
        'R_B': battery.R_B,
        'MO_B': battery.MO_B
    })

def save_battery_config():
    try:
        user_id = request.user['uid']
        data = request.get_json()
        bat = Battery.query.get(user_id)
        if not bat:
            bat = Battery(user_id=user_id)
            db.session.add(bat)
        for field in [
            'Lead_acid', 'Li_ion', 'SOC_min', 'SOC_max', 'SOC_initial', 'self_discharge_rate', 'L_B',
            'Cnom_Leadacid', 'alfa_battery_leadacid', 'c', 'k', 'Ich_max_leadacid', 'Vnom_leadacid',
            'ef_bat_leadacid', 'Q_lifetime_leadacid', 'Ich_max_Li_ion', 'Idch_max_Li_ion', 'alfa_battery_Li_ion',
            'Vnom_Li_ion', 'ef_bat_Li', 'Cnom_Li', 'Q_lifetime_Li', 'L_B_Li', 'C_B', 'R_B', 'MO_B']:
            if field in data:
                setattr(bat, field, data[field])
        db.session.commit()
        return jsonify({field: getattr(bat, field) for field in [
            'user_id', 'Lead_acid', 'Li_ion', 'SOC_min', 'SOC_max', 'SOC_initial', 'self_discharge_rate', 'L_B',
            'Cnom_Leadacid', 'alfa_battery_leadacid', 'c', 'k', 'Ich_max_leadacid', 'Vnom_leadacid',
            'ef_bat_leadacid', 'Q_lifetime_leadacid', 'Ich_max_Li_ion', 'Idch_max_Li_ion', 'alfa_battery_Li_ion',
            'Vnom_Li_ion', 'ef_bat_Li', 'Cnom_Li', 'Q_lifetime_Li', 'L_B_Li', 'C_B', 'R_B', 'MO_B']}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Wind Turbine functions
def get_wind_config():
    user_id = request.user['uid']
    wind = WindTurbine.query.get(user_id)
    if not wind:
        return jsonify({'error': 'No wind turbine data found'}), 404
    return jsonify({
        'Pwt_r': wind.Pwt_r,
        'h_hub': wind.h_hub,
        'h0': wind.h0,
        'nw': wind.nw,
        'v_cut_out': wind.v_cut_out,
        'v_cut_in': wind.v_cut_in,
        'v_rated': wind.v_rated,
        'alfa_wind_turbine': wind.alfa_wind_turbine,
        'L_WT': wind.L_WT,
        'C_WT': wind.C_WT,
        'R_WT': wind.R_WT,
        'MO_WT': wind.MO_WT,
    })

def save_wind_config():
    try:
        user_id = request.user['uid']
        data = request.get_json()
        wind = WindTurbine.query.get(user_id)
        if not wind:
            wind = WindTurbine(user_id=user_id)
            db.session.add(wind)
        for field in [
            'Pwt_r', 'h_hub', 'h0', 'nw', 'v_cut_out', 'v_cut_in', 'v_rated', 'alfa_wind_turbine', 'L_WT',
            'C_WT', 'R_WT', 'MO_WT']:
            if field in data:
                setattr(wind, field, data[field])
        db.session.commit()
        return jsonify({field: getattr(wind, field) for field in [
            'user_id', 'Pwt_r', 'h_hub', 'h0', 'nw', 'v_cut_out', 'v_cut_in', 'v_rated', 'alfa_wind_turbine', 'L_WT',
            'C_WT', 'R_WT', 'MO_WT']}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
