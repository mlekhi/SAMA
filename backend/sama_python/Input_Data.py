import numpy as np
import pandas as pd
import os
from math import ceil
from sama_python.daysInMonth import daysInMonth

# Optimization
# PSO Parameters
class Input_Data:
    def __init__(self):
        # Calculate the directory where this file is located for robust path construction
        self.current_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Set all default values
        self._set_defaults()
        
        # Load weather and electrical data
        self._load_weather_data()
        self._load_electrical_data()

    def _set_defaults(self):
        """Set all default parameter values"""
        # PSO Parameters
        self.Cash_Flow_adv = 0
        self.MaxIt = 200  # Maximum Number of Iterations
        self.nPop = 50  # Population Size (Swarm Size)
        self.w = 1  # Inertia Weight
        self.wdamp = 0.99  # Inertia Weight Damping Ratio
        self.c1 = 2 # Personal Learning Coefficient
        self.c2 = 2  # Global Learning Coefficient

        # Multi-run
        self.Run_Time = 1  # Total number of runs in simulation

        # Calendar
        self.n = 25  # Lifetime of system in simulations (years)
        self.year = 2023  # Specify the desired year
        self.daysInMonth = daysInMonth(self.year)

        # System Configuration
        self.PV = 1
        self.WT = 0
        self.DG = 0
        self.Bat = 0
        self.Lead_acid = 0
        self.Li_ion = 1
        self.Grid = 1
        self.NEM = 1

        # Constraints
        self.LPSP_max_rate = 0.0999999  # Maximum loss of power supply probability percentage
        self.LPSP_max = self.LPSP_max_rate / 100
        self.RE_min_rate = 75  # Minimum Renewable Energy Capacity percentage
        self.RE_min = self.RE_min_rate / 100
        self.EM = 0  # 0: NPC, 1:NPC+LEM

        # PV Parameters
        self.fpv = 0.9  # the PV derating factor [%]
        self.Tcof = -0.3  # temperature coefficient [%/C]
        self.Tref = 25  # temperature at standard test condition
        self.Tc_noct = 45  # Nominal operating cell temperature
        self.Ta_noct = 20
        self.G_noct = 800
        self.gama = 0.9
        self.n_PV = 0.2182  # Efficiency of PV module
        self.Gref = 1000  # 1000 W/m^2
        self.L_PV = 25  # Life time (year)
        self.RT_PV = ceil(self.n/self.L_PV) - 1  # Replacement time

        # Inverter Parameters
        self.n_I = 0.96  # Efficiency
        self.L_I = 25  # Life time (year)
        self.DC_AC_ratio = 1.99  # Maximum acceptable DC to AC ratio
        self.RT_I = ceil(self.n/self.L_I) - 1  # Replacement time

        # Wind Turbine Parameters
        self.h_hub = 17  # Hub height
        self.h0 = 43.6  # anemometer height
        self.nw = 1  # Electrical Efficiency
        self.v_cut_out = 25  # cut out speed
        self.v_cut_in = 2.5  # cut in speed
        self.v_rated = 9.5  # rated speed(m/s)
        self.alfa_wind_turbine = 0.14  # Coefficient of friction
        self.L_WT = 20  # Life time (year)
        self.RT_WT = ceil(self.n/self.L_WT) - 1  # Replacement time

        # Diesel Generator Parameters
        self.LR_DG = 0.25  # Minimum Load Ratio (%)
        self.a = 0.2730  # L/hr/kW output
        self.b = 0.0330  # L/hr/kW rated
        self.TL_DG = 24000  # Life time (h)
        self.CO2 = 2621.7  # Emissions produced by Diesel generator
        self.CO = 16.34
        self.NOx = 6.6
        self.SO2 = 20

        # Battery Parameters
        self.SOC_min = 0.1
        self.SOC_max = 1
        self.SOC_initial = 0.5
        self.self_discharge_rate = 0  # Hourly self-discharge rate
        self.L_B = 7.5  # Life time (year)
        self.RT_B = ceil(self.n / self.L_B) - 1  # Replacement time

        # Lead Acid Battery
        self.Cnom_Leadacid = 83.4  # Li-ion nominal capacity [Ah]
        self.alfa_battery_leadacid = 1  # is the storage's maximum charge rate [A/Ah]
        self.c = 0.403  # the storage capacity ratio [unitless]
        self.k = 0.827  # the storage rate constant [1/h]
        self.Ich_max_leadacid = 16.7  # the storage's maximum charge current [A]
        self.Vnom_leadacid = 12  # the storage's nominal voltage [V]
        self.ef_bat_leadacid = 0.8  # Round trip efficiency
        self.Q_lifetime_leadacid = 8000  # Throughout in kWh

        # Li-ion Battery
        self.Ich_max_Li_ion = 167  # the storage's maximum charge current [A]
        self.Idch_max_Li_ion = 500  # the storage's maximum discharge current [A]
        self.alfa_battery_Li_ion = 1  # is the storage's maximum charge rate [A/Ah]
        self.Vnom_Li_ion = 6  # the storage's nominal voltage [V]
        self.Cnom_Li = 167  # Li-ion nominal capacity [Ah]
        self.ef_bat_Li = 0.90  # Round trip efficiency
        self.Q_lifetime_Li = 3000  # Throughout in kWh

        # Charger
        self.L_CH = 25  # Life time (year)
        self.RT_CH = ceil(self.n/self.L_CH) - 1  # Replacement time

        # Rated capacity
        self.Ppv_r = 1  # PV module rated power (kW)
        self.Pwt_r = 1  # WT rated power (kW)
        if self.Lead_acid == 1:
            self.Cbt_r = (self.Vnom_leadacid * self.Cnom_Leadacid) / 1000  # Battery rated Capacity (kWh)
        if self.Li_ion == 1:
            self.Cbt_r = (self.Vnom_Li_ion * self.Cnom_Li) / 1000  # Battery rated Capacity (kWh)
        self.Cdg_r = 1  # DG rated Capacity (kW)

        # Economic Parameters
        self.n_ir_rate = 5.5  # Nominal discount rate
        self.n_ir = self.n_ir_rate / 100
        self.e_ir_rate = 2  # Expected inflation rate
        self.e_ir = self.e_ir_rate / 100
        self.ir = (self.n_ir - self.e_ir) / (1 + self.e_ir)  # real discount rate
        self.Budget = 200e3  # Limit On Total Capital Cost
        self.Tax_rate = 0  # Equipment sale tax Percentage
        self.System_Tax = self.Tax_rate / 100
        self.RE_incentives_rate = 30  # Federal tax credit percentage
        self.RE_incentives = self.RE_incentives_rate / 100

        # Pricing method
        self.Pricing_method = 2  # 1=Top down 2=bottom up

        # Set pricing based on method
        if self.Pricing_method == 1:
            self._set_top_down_pricing()
        else:
            self._set_bottom_up_pricing()

        # Grid Parameters
        self.Annual_expenses = 0  # Annual expenses in $ for grid if any
        self.Grid_sale_tax_rate = 6.88  # Sale tax percentage of grid electricity
        self.Grid_Tax = self.Grid_sale_tax_rate / 100
        self.Grid_Tax_amount = 0.0016  # Grid tax in $/kWh if any
        self.Grid_escalation_rate = np.full(25, 5.7)  # Yearly escalation flat rate
        self.Grid_escalation = self.Grid_escalation_rate / 100
        self.Grid_credit = 121.4  # Credits offered by grid to users in $
        self.NEM_fee = 0  # Net metering one time setup fee

        # Monthly fixed charge structure
        self.Monthly_fixed_charge_system = 1
        if self.Monthly_fixed_charge_system == 1:  # Flat
            self.SC_flat = 0
            self.Service_charge = np.ones(12) * self.SC_flat

        # Rate structure (default to flat rate)
        self.rateStructure = 1
        self.flatPrice = 0.191
        self.Cbuy = np.full(8760, self.flatPrice)

        # Sell to the Grid
        self.sellStructure = 2
        if self.sellStructure == 1:
            self.Csell = np.full(8760, 0.049)
        elif self.sellStructure == 2:
            self.monthlysellprices = np.array([0.0638, 0.14538, 0.09079, 0.07914, 0.06469, 0.05336, 0.04612, 0.04411, 0.04737, 0.04591, 0.04512, 0.04415])
            from sama_python.calcMonthlyRate import calcMonthlyRate
            self.Csell = calcMonthlyRate(self.monthlysellprices, self.daysInMonth)
        elif self.sellStructure == 3:
            self.Csell = self.Cbuy

        # Grid emission information
        self.E_CO2 = 1.43  # Emissions produced by Grid generators (kg/kWh)
        self.E_SO2 = 0.01
        self.E_NOx = 0.39

        # Constraints for buying/selling from/to grid
        self.Pbuy_max = 6  # ceil(1.2 * max(self.Eload))  # kWh
        self.Psell_max = 200  # self.Pbuy_max

        # Weather data parameters (needed for weather loading)
        self.weather_url = os.path.join(self.current_dir, 'content', 'METEO.csv')
        self.azimuth = 180
        self.tilt = 28.1  # Tilt angle of PV modules
        self.soiling = 5  # Soiling losses in percentage

    def _set_top_down_pricing(self):
        """Set top-down pricing parameters"""
        Total_PV_price = 2950
        from sama_python.top_down import top_down_pricing
        self.Engineering_Costs, self.C_PV, self.R_PV, self.C_I, self.R_I, self.r_Sales_tax = top_down_pricing(Total_PV_price)
        
        # PV
        self.MO_PV = 28.12 * (1 + self.r_Sales_tax)  # PV O&M cost ($/year/kw)
        
        # Inverter
        self.MO_I = 3 * (1 + self.r_Sales_tax)  # Inverter O&M cost ($/kW.year)
        
        # WT
        self.C_WT = 1200 * (1 + self.r_Sales_tax)  # Capital cost ($) per KW
        self.R_WT = 1200 * (1 + self.r_Sales_tax)  # Replacement Cost of WT Per KW
        self.MO_WT = 40 * (1 + self.r_Sales_tax)  # O&M cost ($/year/kw)
        
        # Diesel generator
        self.C_DG = 240.45 * (1 + self.r_Sales_tax)  # Capital cost ($/kW)
        self.R_DG = 240.45 * (1 + self.r_Sales_tax)  # Replacement Cost ($/kW)
        self.MO_DG = 0.064 * (1 + self.r_Sales_tax)  # O&M+ running cost ($/op.h)
        self.C_fuel = 1.39 * (1 + self.r_Sales_tax)  # Fuel Cost ($/L)
        self.C_fuel_adj_rate = 2  # DG fuel cost yearly escalation rate
        self.C_fuel_adj = self.C_fuel_adj_rate / 100
        
        # Battery
        self.C_B = 458.06 * (1 + self.r_Sales_tax)  # Capital cost ($/kWh)
        self.R_B = 458.06 * (1 + self.r_Sales_tax)  # Replacement Cost ($/kWh)
        self.MO_B = 10 * (1 + self.r_Sales_tax)  # Maintenance cost ($/kWh.year)
        
        # Charger
        self.C_CH = 149.99 * (1 + self.r_Sales_tax)  # Capital Cost ($)
        self.R_CH = 149.99 * (1 + self.r_Sales_tax)  # Replacement Cost ($)
        self.MO_CH = 0 * (1 + self.r_Sales_tax)  # O&M cost ($/year)

    def _set_bottom_up_pricing(self):
        """Set bottom-up pricing parameters"""
        # Engineering Costs (Per/kW)
        self.Installation_cost = 160
        self.Overhead = 260
        self.Sales_and_marketing = 400
        self.Permiting_and_Inspection = 210
        self.Electrical_BoS = 370
        self.Structrual_BoS = 160
        self.Supply_Chain_costs = 0
        self.Profit_costs = 340
        self.Sales_tax = 80
        self.Engineering_Costs = (self.Sales_tax + self.Profit_costs + self.Installation_cost + 
                                 self.Overhead + self.Sales_and_marketing + self.Permiting_and_Inspection + 
                                 self.Electrical_BoS + self.Structrual_BoS + self.Supply_Chain_costs)

        # PV
        self.C_PV = 534.54  # Capital cost ($) per KW
        self.R_PV = 534.54  # Replacement Cost of PV modules Per KW
        self.MO_PV = 28.88  # O&M cost ($/year/kw)

        # Inverter
        self.C_I = 440  # Capital cost ($/kW)
        self.R_I = 440  # Replacement cost ($/kW)
        self.MO_I = 3.4  # O&M cost ($/kw.year)

        # WT
        self.C_WT = 1200  # Capital cost ($) per KW
        self.R_WT = 1200  # Replacement Cost of WT Per KW
        self.MO_WT = 40  # O&M cost ($/year/kw)

        # Diesel generator
        self.C_DG = 240.45  # Capital cost ($/KW)
        self.R_DG = 240.45  # Replacement Cost ($/kW)
        self.MO_DG = 0.066  # O&M+ running cost ($/op.h)
        self.C_fuel = 1.428  # Fuel Cost ($/L)
        self.C_fuel_adj_rate = 2  # DG fuel cost yearly escalation rate
        self.C_fuel_adj = self.C_fuel_adj_rate / 100

        # Battery
        self.C_B = 458.06  # Capital cost ($/KWh)
        self.R_B = 458.06  # Replacement Cost ($/kW)
        self.MO_B = 10.27  # Maintenance cost ($/kw.year)

        # Charger
        self.C_CH = 0  # Capital Cost ($)
        self.R_CH = 0  # Replacement Cost ($)
        self.MO_CH = 0  # O&M cost ($/year)

    def _load_weather_data(self):
        """Load weather data (irradiance, temperature, wind speed)"""
        # Irradiance definitions
        G_type = 1  # 1=Hourly irradiance based on POA calculator, 2=Hourly POA irradiance based on CSV

        if G_type == 1:
            from sama_python.sam_monofacial_poa import runSimulation
            temp_result = runSimulation(self.weather_url, self.tilt, self.azimuth, self.soiling)
            G_pd_to_numpy = temp_result[0]
            self.G = G_pd_to_numpy.values
        elif G_type == 2:
            self.path_G = os.path.join(self.current_dir, 'content', 'Irradiance.csv')
            self.GData = pd.read_csv(self.path_G, header=None).values
            self.G = np.array(self.GData[:, 0])

        # Temperature definitions
        T_type = 1  # 1=Hourly Temperature based on NSEDB, 2=CSV, 3=Monthly avg, 4=Annual avg

        if T_type == 1:
            from sama_python.sam_monofacial_poa import runSimulation
            temp_result = runSimulation(self.weather_url, self.tilt, self.azimuth, self.soiling)
            T_pd_to_numpy = temp_result[1]
            self.T = T_pd_to_numpy.values
        elif T_type == 2:
            self.path_T = os.path.join(self.current_dir, 'content', 'Temperature.csv')
            self.TData = pd.read_csv(self.path_T, header=None).values
            self.T = np.array(self.TData[:, 0])
        elif T_type == 3:
            self.Monthly_average_temperature = np.array([-2, -5, -2, 1, 3, 6, 15, 22, 27, 23, 16, 7])
            from dataextender import dataextender
            self.T = dataextender(self.daysInMonth, self.Monthly_average_temperature)
        else:  # Annual average Temperature
            self.Annual_average_temperature = 12
            self.T = np.full(8760, self.Annual_average_temperature)

        # Wind speed definitions
        WS_type = 1  # 1=Hourly Wind speed based on NSEDB, 2=CSV, 3=Monthly avg, 4=Annual avg

        if WS_type == 1:
            from sama_python.sam_monofacial_poa import runSimulation
            temp_result = runSimulation(self.weather_url, self.tilt, self.azimuth, self.soiling)
            WS_pd_to_numpy = temp_result[2]
            self.Vw = WS_pd_to_numpy.values
        elif WS_type == 2:
            self.path_WS = os.path.join(self.current_dir, 'content', 'WSPEED.csv')
            self.WSData = pd.read_csv(self.path_WS, header=None).values
            self.Vw = np.array(self.WSData[:, 0])
        elif WS_type == 3:
            self.Monthly_average_windspeed = np.array([14.1, 21, 12.2, 31, 12.2, 11.2, 12.1, 13, 21, 9.2, 12.3, 18.1])
            from dataextender import dataextender
            self.Vw = dataextender(self.daysInMonth, self.Monthly_average_windspeed)
        else:  # Annual average Wind speed
            self.Annual_average_windspeed = 10
            self.Vw = np.full(8760, self.Annual_average_windspeed)

    def _load_electrical_data(self):
        """Load electrical load data"""
        load_type = 1  # Determine the way you want to input the electrical load

        if load_type == 1:
            # Use path relative to this file's location
            self.path_Eload = os.path.join(self.current_dir, 'content', 'Eload.csv')
            self.EloadData = pd.read_csv(self.path_Eload, header=None).values
            self.Eload = np.array(self.EloadData[:, 0])
        elif load_type == 2:
            self.Monthly_haverage_load = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
            from dataextender import dataextender
            self.Eload = dataextender(self.daysInMonth, self.Monthly_haverage_load)
        elif load_type == 3:
            self.Monthly_daverage_load = np.array([10, 20, 31, 14, 15, 16, 17, 18, 19, 10, 11, 12])
            self.Monthly_haverage_load = self.Monthly_daverage_load / 24
            from dataextender import dataextender
            self.Eload = dataextender(self.daysInMonth, self.Monthly_haverage_load)
        elif load_type == 4:
            self.Monthly_total_load = np.array([321, 223, 343, 423, 544, 623, 237, 843, 239, 140, 121, 312])
            self.Monthly_haverage_load = self.Monthly_total_load / (self.daysInMonth * 24)
            from dataextender import dataextender
            self.Eload = dataextender(self.daysInMonth, self.Monthly_haverage_load)
        elif load_type == 5:  # Based on the generic load
            peak_month = 'July'
            user_defined_load = np.array([300, 350, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320])
            from generic_load import generic_load
            self.Eload = generic_load(load_type, 1, peak_month, self.daysInMonth, user_defined_load)
        elif load_type == 6:
            self.Annual_haverage_load = 1
            self.Eload = np.full(8760, self.Annual_haverage_load)
        elif load_type == 7:
            self.Annual_daverage_load = 10
            self.Annual_haverage_load = self.Annual_daverage_load / 24
            self.Eload = np.full(8760, self.Annual_haverage_load)
        elif load_type == 8:  # Annual total load
            self.Annual_total_load = 12879.10
            peak_month = 'July'
            from generic_load import generic_load
            self.Eload = generic_load(load_type, 1, peak_month, self.daysInMonth, self.Annual_total_load)
        else:
            peak_month = 'July'
            from generic_load import generic_load
            self.Eload = generic_load(load_type, 1, peak_month, self.daysInMonth, 1)

        # Save inputs to CSV
        data = {'Eload': self.Eload, 'G': self.G, 'T': self.T, 'Vw': self.Vw}
        df = pd.DataFrame(data)
        df.to_csv(os.path.join(self.current_dir, 'output', 'data', 'Inputs.csv'), index=False)

        print(self)        

InData = Input_Data()