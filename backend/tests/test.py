#!/usr/bin/env python3
"""
Test script for Input_Data class to verify calculations match expected results.
This script bypasses the web interface and directly tests the core backend logic.
"""

import sys
import os
import numpy as np
import pandas as pd
from math import ceil

# Add the sama_python directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'sama_python'))

from sama_python.Input_Data import Input_Data
from sama_python.pso import run as pso_run

def test_case_1_pv_grid():
    """
    Test Case 1: PV + Grid configuration with user-specified values
    Using exact same inputs as test_endpoints_input.py
    """
    print("=" * 60)
    print("TESTING CASE 1: PV + Grid Configuration")
    print("=" * 60)
    
    # Create Input_Data instance
    print("Creating Input_Data instance...")
    input_data = Input_Data()
    
    # Set up Case 1 configuration (PV + Grid) - EXACT SAME AS test_endpoints_input.py
    print("Setting up Case 1 configuration...")
    input_data.PV = True
    input_data.WT = False
    input_data.DG = False
    input_data.Bat = False
    input_data.Grid = 1
    input_data.NEM = 1
    
    # Geography and Economy settings - EXACT SAME AS test_endpoints_input.py
    print("Setting Geography and Economy parameters...")
    input_data.n_ir_rate = 2.75  # Nominal Discount rate: 2.75%
    input_data.n_ir = input_data.n_ir_rate / 100
    input_data.e_ir_rate = 2.0   # Expected Inflation rate: 2%
    input_data.e_ir = input_data.e_ir_rate / 100
    input_data.ir = (input_data.n_ir - input_data.e_ir) / (1 + input_data.e_ir)  # Real discount rate
    input_data.System_Tax = 0 / 100  # Tax_rate: 0%
    input_data.RE_incentives = 0 / 100  # RE_incentives_rate: 0%
    
    # System Configuration - EXACT SAME AS test_endpoints_input.py
    print("Setting System Configuration...")
    input_data.n = 25  # Lifetime: 25
    input_data.LPSP_max = 0.0999999 / 100  # Max loss of power supply probability: 0.0999999%
    input_data.RE_min = 75.0 / 100  # Minimum renewable energy percentage: 75.0%
    
    # Component Information - Photovoltaic - EXACT SAME AS test_endpoints_input.py
    print("Setting Photovoltaic parameters...")
    input_data.fpv = 0.9
    input_data.Tcof = -0.003
    input_data.Tref = 25
    input_data.Tc_noct = 45
    input_data.Ta_noct = 20
    input_data.G_noct = 800
    input_data.n_PV = 0.9
    input_data.Gref = 1000
    input_data.L_PV = 25
    input_data.C_PV = 2682
    input_data.R_PV = 0
    input_data.MO_PV = 0
    input_data.Installation_cost = 0
    input_data.Overhead = 0
    input_data.Sales_and_marketing = 0
    input_data.Permiting_and_Inspection = 0
    input_data.Electrical_BoS = 0
    input_data.Structural_BoS = 0
    input_data.Supply_Chain_costs = 0
    input_data.Profit_costs = 0
    input_data.Sales_tax = 0
    input_data.azimuth = 180
    input_data.tilt = 34
    input_data.soiling = 0.05
    
    # Inverter Configuration - EXACT SAME AS test_endpoints_input.py
    print("Setting Inverter parameters...")
    input_data.n_I = 0.9
    input_data.L_I = 25
    input_data.DC_AC_ratio = 1.2
    input_data.C_I = 0
    input_data.R_I = 0
    input_data.MO_I = 0
    
    # Grid Information - EXACT SAME AS test_endpoints_input.py
    print("Setting Grid Information...")
    input_data.Grid = 1  # Grid connected: Yes
    input_data.NEM = 1   # Net metering: Yes
    
    # Summer months: May, June, July, August, September, October
    input_data.season = [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0]  # 1 = Summer
    
    # Grid expenses and taxes - EXACT SAME AS test_endpoints_input.py
    input_data.Annual_expenses = 0  # Annual expenses for grid interconnection
    input_data.Grid_sale_tax_rate = -0.1  # Sale tax percentage (negative for credit)
    input_data.Grid_Tax = input_data.Grid_sale_tax_rate / 100
    input_data.Grid_Tax_amount = 0.017  # Grid adjustments in kWh
    input_data.Grid_escalation_rate = 5.7  # Yearly escalation rate
    input_data.Grid_escalation = input_data.Grid_escalation_rate / 100
    input_data.Grid_credit = 0  # Annual credits offered by utility grid
    input_data.NEM_fee = 0  # Net metering one-time setup fee
    
    # Monthly fixed charge - EXACT SAME AS test_endpoints_input.py
    input_data.SC_flat = 21.24  # Grid monthly fixed charge
    input_data.Service_charge = np.ones(12) * input_data.SC_flat
    
    # Rate Structure: Time of Use - EXACT SAME AS test_endpoints_input.py
    input_data.rateStructure = 'tou'  # Time of use rate
    
    # TOU rates - EXACT SAME AS test_endpoints_input.py
    input_data.onPrice = [0.11, 0.11]  # [summer, winter] peak rates
    input_data.midPrice = [0.064, 0.064]  # [summer, winter] mid-peak rates
    input_data.offPrice = [0.053, 0.053]  # [summer, winter] off-peak rates
    
    # TOU hours - EXACT SAME AS test_endpoints_input.py
    input_data.onHours = [
        [11, 12, 13, 14, 15, 16],  # Summer peak: 11-16
        [7, 8, 9, 10, 17, 18]      # Winter peak: 7-10 & 17-18
    ]
    input_data.midHours = [
        [7, 8, 9, 10, 17, 18],     # Summer mid-peak: 7-10 & 17-18
        [11, 12, 13, 14, 15, 16]   # Winter mid-peak: 11-16
    ]
    
    # Holidays (empty array as in test_endpoints_input.py)
    input_data.holidays = []
    
    # Purchase and Sell Capacity - EXACT SAME AS test_endpoints_input.py
    input_data.Pbuy_max = 200  # Purchase Capacity
    input_data.Psell_max = 200  # Sell Capacity
    
    # Compensation option: 1:1 compensation - EXACT SAME AS test_endpoints_input.py
    input_data.sellStructure = 3  # 1:1 compensation
    
    # Optimization parameters - EXACT SAME AS test_endpoints_input.py
    print("Setting Optimization parameters...")
    input_data.MaxIt = 200  # maxIterations
    input_data.nPop = 50    # populationSize
    input_data.w = 1        # inertiaWeight
    input_data.wdamp = 0.99 # inertiaWeightDamping
    input_data.c1 = 2       # personalLearningCoeff
    input_data.c2 = 2       # globalLearningCoeff
    
    # Calculate Cbuy using TOU rate calculator (this happens automatically in the real system)
    print("Calculating TOU rates...")
    try:
        from sama_python.calcTouRate import calcTouRate
        input_data.Cbuy = calcTouRate(input_data.year, input_data.onPrice, input_data.midPrice, 
                                     input_data.offPrice, input_data.onHours, input_data.midHours, 
                                     input_data.season, input_data.daysInMonth, input_data.holidays)
        print("   ✅ TOU rates calculated successfully")
    except Exception as e:
        print(f"   ⚠️  TOU rate calculation failed: {e}")
        # Fallback to default Cbuy
        input_data.Cbuy = np.ones(8760) * 0.11
    
    # Set Csell equal to Cbuy for 1:1 compensation
    input_data.Csell = input_data.Cbuy
    
    # Note: Input_Data class already loads eload from Eload.csv in its __init__ method
    # No need to override it here - the class will use its own eload data
    
    # Verify critical values
    print(f"Service charge (SC_flat): ${input_data.SC_flat}")
    print(f"Rate structure: {input_data.rateStructure}")
    print(f"Sell structure: {input_data.sellStructure}")
    print(f"Grid escalation rate: {input_data.Grid_escalation_rate}%")
    print(f"Grid credit: ${input_data.Grid_credit}")
    print(f"Real discount rate: {input_data.ir:.4f}")
    print(f"PV Capital Cost: ${input_data.C_PV}")
    print(f"PV Efficiency: {input_data.n_PV}")
    print(f"PV Temperature Coefficient: {input_data.Tcof}")
    print(f"PV Azimuth: {input_data.azimuth}°")
    print(f"PV Tilt: {input_data.tilt}°")
    print(f"Inverter Efficiency: {input_data.n_I}")
    print(f"Inverter Lifetime: {input_data.L_I} years")
    print(f"DC/AC Ratio: {input_data.DC_AC_ratio}")
    
    # Test the optimization
    print("Running PSO optimization...")
    print(f"Input_Data instance ID: {id(input_data)}")
    print(f"Input_Data has eload: {hasattr(input_data, 'Eload')}")
    print(f"Input_Data has Cbuy: {hasattr(input_data, 'Cbuy')}")
    print(f"Input_Data has Service_charge: {hasattr(input_data, 'Service_charge')}")
    
    try:
        result = pso_run(input_data)
        
        if result and 'error' not in result:
            print("\n" + "=" * 60)
            print("OPTIMIZATION RESULTS:")
            print("=" * 60)
            
            # Extract key results
            if 'system_size' in result:
                sys_size = result['system_size']
                print(f"PV Capacity: {sys_size.get('pv_capacity_kw', 'N/A')} kW")
                print(f"Wind Capacity: {sys_size.get('wind_capacity_kw', 'N/A')} kW")
                print(f"Battery Capacity: {sys_size.get('battery_capacity_kwh', 'N/A')} kWh")
                print(f"Diesel Capacity: {sys_size.get('diesel_capacity_kw', 'N/A')} kW")
                print(f"Inverter Capacity: {sys_size.get('inverter_capacity_kw', 'N/A')} kW")
            
            if 'financial_metrics' in result:
                fin_metrics = result['financial_metrics']
                print(f"\nNPC: ${fin_metrics.get('npc', 'N/A'):,.2f}")
                print(f"LCOE: ${fin_metrics.get('lcoe', 'N/A')}/kWh")
                print(f"Total Grid Costs: ${fin_metrics.get('total_grid_costs', 'N/A'):,.2f}")
                print(f"Total Avoided Costs: ${fin_metrics.get('total_avoided_costs', 'N/A'):,.2f}")
                        
        else:
            print(f"Optimization failed: {result}")
            
    except Exception as e:
        print(f"Error during optimization: {str(e)}")
        import traceback
        traceback.print_exc()

def test_input_data_defaults():
    """
    Test that Input_Data has the correct default values
    """
    print("\n" + "=" * 60)
    print("TESTING INPUT_DATA DEFAULTS")
    print("=" * 60)
    
    input_data = Input_Data()
    
    # Test critical defaults
    expected_defaults = {
        'SC_flat': 9.95,
        'rateStructure': 6,
        'sellStructure': 3,
        'Grid_escalation_rate': 5.7,
        'Grid_credit': 121.4,
        'n': 25,
        'LPSP_max_rate': 0.0999999,
        'RE_min_rate': 75
    }
    
    print("Checking default values...")
    for attr, expected_value in expected_defaults.items():
        actual_value = getattr(input_data, attr, None)
        if hasattr(actual_value, '__len__') and len(actual_value) > 1:
            # Handle arrays (like Grid_escalation_rate)
            actual_value = actual_value[0]
        
        status = "✓" if actual_value == expected_value else "✗"
        print(f"{status} {attr}: Expected {expected_value}, Got {actual_value}")
    
def test_grid_calculations():
    """
    Test grid-related calculations
    """
    print("\n" + "=" * 60)
    print("TESTING GRID CALCULATIONS")
    print("=" * 60)
    
    input_data = Input_Data()
    
    # Test service charge calculation
    print(f"SC_flat: ${input_data.SC_flat}")
    print(f"Service_charge array: {input_data.Service_charge}")
    print(f"Annual service charge: ${np.sum(input_data.Service_charge):.2f}")
    
    # Test rate structure
    print(f"Rate structure: {input_data.rateStructure}")
    print(f"Cbuy array length: {len(input_data.Cbuy)}")
    print(f"Csell array length: {len(input_data.Csell)}")
    
    # Check if Cbuy and Csell are properly set
    if hasattr(input_data, 'Cbuy') and input_data.Cbuy is not None:
        print(f"Cbuy first 5 values: {input_data.Cbuy[:5]}")
    else:
        print("✗ Cbuy is not set")
    
    if hasattr(input_data, 'Csell') and input_data.Csell is not None:
        print(f"Csell first 5 values: {input_data.Csell[:5]}")
    else:
        print("✗ Csell is not set")

if __name__ == "__main__":
    print("SAMA Backend Test Script")
    print("Testing Input_Data class with user-specified configuration...")
    
    try:
        test_case_1_pv_grid()
        
    except Exception as e:
        print(f"Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 60)
    print("TEST COMPLETED")
    print("=" * 60)