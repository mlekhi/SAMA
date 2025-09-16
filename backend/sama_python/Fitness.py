import numpy as np
from numba import jit
from math import ceil
from sama_python.EMS import EMS

#@jit(nopython=True, fastmath=True)
def fitness(X, data):
    if X.size == 1:
        X = X[0]

    # Extract data from user input instead of using defaults
    Eload = data.Eload
    Ppv_r = data.Ppv_r
    Pwt_r = data.Pwt_r
    Cbt_r = data.Cbt_r
    Cdg_r = data.Cdg_r
    
    # Module flags
    PV = data.PV
    WT = data.WT
    Bat = data.Bat
    DG = data.DG
    Grid = data.Grid
    Lead_acid = data.Lead_acid
    Li_ion = data.Li_ion
    
    T = data.T
    Tc_noct = data.Tc_noct
    G = data.G
    c2 = data.c2
    fpv = data.fpv
    Gref = data.Gref
    Tcof = data.Tcof
    Tref = data.Tref
    Ta_noct = data.Ta_noct
    G_noct = data.G_noct
    n_PV = data.n_PV
    gama = data.gama
    Vw = data.Vw
    
    n_I = data.n_I
    DC_AC_ratio = data.DC_AC_ratio
    C_I = data.C_I
    L_I = data.L_I
    R_I = data.R_I
    MO_I = data.MO_I
    RT_I = data.RT_I

    n = data.n
    ir = data.ir
    RE_incentives = data.RE_incentives
    System_Tax = data.System_Tax
    LPSP_max = data.LPSP_max
    RE_min = data.RE_min
    Budget = data.Budget
    EM = data.EM



    NT = Eload.size  # time step numbers
    Npv = round(X[0], 1)  # PV number
    Nwt = round(X[1], 2)  # WT number
    Nbat = round(X[2])  # Battery pack number
    N_DG = round(X[3], 1)  # number of Diesel Generator
    Cn_I = round(X[4], 2)  # Inverter Capacity

    Pn_PV = Npv * Ppv_r  # PV Total Capacity
    Pn_WT = Nwt * Pwt_r  # WT Total Capacity
    Cn_B = Nbat * Cbt_r  # Battery Total Capacity
    Pn_DG = N_DG * Cdg_r  # Diesel Total Capacity


    if Bat:
        # Extract battery parameters
        R_B = data.R_B
        Q_lifetime_leadacid = data.Q_lifetime_leadacid
        ef_bat_leadacid = data.ef_bat_leadacid
        SOC_max = data.SOC_max
        SOC_min = data.SOC_min
        SOC_initial = data.SOC_initial
        self_discharge_rate = data.self_discharge_rate
        alfa_battery_leadacid = data.alfa_battery_leadacid
        c = data.c
        k = data.k
        Ich_max_leadacid = data.Ich_max_leadacid
        Vnom_leadacid = data.Vnom_leadacid
        Ich_max_Li_ion = data.Ich_max_Li_ion
        Idch_max_Li_ion = data.Idch_max_Li_ion
        Vnom_Li_ion = data.Vnom_Li_ion
        Cnom_Li = data.Cnom_Li
        ef_bat_Li = data.ef_bat_Li
        Q_lifetime_Li = data.Q_lifetime_Li
        alfa_battery_Li_ion = data.alfa_battery_Li_ion
        C_B = data.C_B
        C_CH = data.C_CH
        L_B = data.L_B
        L_CH = data.L_CH
        R_CH = data.R_CH
        MO_B = data.MO_B
        MO_CH = data.MO_CH
        RT_B = data.RT_B
        RT_CH = data.RT_CH
    else:
        # Set default values when battery is not enabled
        R_B = Q_lifetime_leadacid = ef_bat_leadacid = 0
        SOC_max = SOC_min = SOC_initial = 0
        self_discharge_rate = alfa_battery_leadacid = 0
        c = k = Ich_max_leadacid = Vnom_leadacid = 0
        Ich_max_Li_ion = Idch_max_Li_ion = Vnom_Li_ion = 0
        Cnom_Li = ef_bat_Li = Q_lifetime_Li = alfa_battery_Li_ion = 0
        C_B = C_CH = L_B = L_CH = R_CH = 0
        MO_B = MO_CH = RT_B = RT_CH = 0

    # PV Power Calculation
    if PV:
        # Extract PV parameters
        C_PV = data.C_PV
        Engineering_Costs = data.Engineering_Costs
        L_PV = data.L_PV
        R_PV = data.R_PV
        MO_PV = data.MO_PV
        RT_PV = data.RT_PV
        
        #Tc = T + (((Tc_noct - 20) / 800) * G)  # Module Temprature
        # Module Temperature
        Tc = (T + 273.15 + (Tc_noct - Ta_noct) * (G / G_noct) * (1 - ((n_PV * (1 - (Tcof / 100) * (Tref + 273.15))) / gama))) / (1 + (Tc_noct - Ta_noct) * (G / G_noct) * (((Tcof / 100) * n_PV) / gama))
        Ppv = fpv * Pn_PV * (G / Gref) * (1 + (Tcof / 100) * (Tc - 273.15 - Tref))  # output power(kw)_hourly
    else:
        Ppv = np.zeros(8760)

    # Wind turbine Power Calculation
    if WT:
        # Extract wind turbine parameters
        h_hub = data.h_hub
        h0 = data.h0
        alfa_wind_turbine = data.alfa_wind_turbine
        v_cut_in = data.v_cut_in
        v_cut_out = data.v_cut_out
        v_rated = data.v_rated
        C_WT = data.C_WT
        L_WT = data.L_WT
        R_WT = data.R_WT
        MO_WT = data.MO_WT
        RT_WT = data.RT_WT
        
        v1 = Vw  # hourly wind speed
        v2 = ((h_hub / h0) ** (alfa_wind_turbine)) * v1  # v1 is the speed at a reference height;v2 is the speed at a hub height h2

        Pwt = np.zeros(8760)
        true_value = np.logical_and(v_cut_in <= v2, v2 < v_rated)
        Pwt[np.logical_and(v_cut_in <= v2, v2 < v_rated)] = v2[true_value] ** 3 * (Pwt_r / (v_rated ** 3 - v_cut_in ** 3)) - (v_cut_in ** 3 / (v_rated ** 3 - v_cut_in ** 3)) * (Pwt_r)
        Pwt[np.logical_and(v_rated <= v2, v2 < v_cut_out)] = Pwt_r
        Pwt = Pwt * Nwt
    else:
        Pwt = np.zeros(8760)

    ## Energy Management
    # Extract diesel generator parameters
    if DG:
        a = data.a
        b = data.b
        R_DG = data.R_DG
        TL_DG = data.TL_DG
        MO_DG = data.MO_DG
        C_fuel = data.C_fuel
        LR_DG = data.LR_DG
        C_DG = data.C_DG
        CO2 = data.CO2
        NOx = data.NOx
        SO2 = data.SO2
        C_fuel_adj = data.C_fuel_adj
    else:
        a = b = R_DG = TL_DG = MO_DG = C_fuel = LR_DG = C_DG = 0
        CO2 = NOx = SO2 = C_fuel_adj = 0
    
    # Extract grid parameters
    if Grid:
        Cbuy = data.Cbuy
        Pbuy_max = data.Pbuy_max
        Psell_max = data.Psell_max
        Annual_expenses = data.Annual_expenses
        Service_charge = data.Service_charge
        Csell = data.Csell
        Grid_Tax = data.Grid_Tax
        Grid_Tax_amount = data.Grid_Tax_amount
        Grid_credit = data.Grid_credit
        NEM = data.NEM
        NEM_fee = data.NEM_fee
        Grid_escalation = data.Grid_escalation
        E_CO2 = data.E_CO2
        E_SO2 = data.E_SO2
        E_NOx = data.E_NOx
    else:
        Cbuy = Pbuy_max = Psell_max = Annual_expenses = Service_charge = Csell = 0
        Grid_Tax = Grid_Tax_amount = Grid_credit = NEM_fee = Grid_escalation = 0
        NEM = False
        E_CO2 = E_SO2 = E_NOx = 0

    Pdg, Ens, Pbuy, Psell, Edump, Pch, Pdch, Eb, Pdch_max, Pch_max= EMS(Lead_acid, Li_ion, Ich_max_Li_ion, Idch_max_Li_ion, Cnom_Li, Vnom_Li_ion, ef_bat_Li, Q_lifetime_Li, Ppv, alfa_battery_Li_ion, Pwt, Eload, Cn_B, Nbat, Pn_DG, NT, SOC_max, SOC_min, SOC_initial, n_I, Grid, Cbuy, a, b, R_DG, TL_DG, MO_DG, Cn_I, LR_DG, C_fuel, Pbuy_max, Psell_max, R_B, Q_lifetime_leadacid, self_discharge_rate, alfa_battery_leadacid, c, k, Ich_max_leadacid, Vnom_leadacid, ef_bat_leadacid)

    # Diesel generator fuel consumption
    if DG:
        q = (a * Pdg + b * Pn_DG) * (Pdg > 0)  # Fuel consumption of a diesel generator
    else:
        q = np.zeros(8760)

    ## Installation and operation cost

    # Total Investment cost ($)
    I_Cost = 0
    if PV:
        I_Cost += C_PV * (1 - RE_incentives) * Pn_PV
        I_Cost += Engineering_Costs * (1 - RE_incentives) * Pn_PV
    if WT:
        I_Cost += C_WT * (1 - RE_incentives) * Pn_WT
    if DG:
        I_Cost += C_DG * Pn_DG
    if Bat:
        I_Cost += C_B * (1 - RE_incentives) * Cn_B
        I_Cost += C_I * (1 - RE_incentives) * Cn_I
        I_Cost += C_CH * (1 - RE_incentives) * (Nbat > 0)
    if Grid:
        I_Cost += NEM_fee

    Top_DG = np.sum(Pdg > 0) + 1
    L_DG = TL_DG / Top_DG
    RT_DG = ceil(n / L_DG) - 1  # Replacement time

    # Total Replacement Cost ($/year)
    R_Cost = np.zeros(n)
    # Define a resolution factor, for example 10 for deciles of a year
    res = 10
    # Multiply all times by the resolution factor
    n_res = n * res
    L_PV_res = np.int_(L_PV * res)
    L_WT_res = np.int_(L_WT * res)
    L_DG_res = np.int_(L_DG * res)
    L_B_res = np.int_(L_B * res)
    L_I_res = np.int_(L_I * res)
    L_CH_res = np.int_(L_CH * res)

    # Initialize arrays
    RC_PV = np.zeros(n_res)
    RC_WT = np.zeros(n_res)
    RC_DG = np.zeros(n_res)
    RC_B = np.zeros(n_res)
    RC_I = np.zeros(n_res)
    RC_CH = np.zeros(n_res)

    # Calculate replacement costs
    if PV:
        RC_PV[np.arange(L_PV_res, n_res, L_PV_res)] = R_PV * Pn_PV / np.power((1 + ir), 1.001 * np.arange(L_PV_res, n_res, L_PV_res) / res)
    if WT:
        RC_WT[np.arange(L_WT_res, n_res, L_WT_res)] = R_WT * Pn_WT / np.power((1 + ir), 1.001 * np.arange(L_WT_res, n_res, L_WT_res) / res)
    if DG:
        RC_DG[np.arange(L_DG_res, n_res, L_DG_res)] = R_DG * Pn_DG / np.power((1 + ir), 1.001 * np.arange(L_DG_res, n_res, L_DG_res) / res)
    if Bat:
        RC_B[np.arange(L_B_res, n_res, L_B_res)] = R_B * Cn_B / np.power((1 + ir), 1.001 * np.arange(L_B_res, n_res, L_B_res) / res)
        RC_CH[np.arange(L_CH_res, n_res, L_CH_res)] = R_CH / np.power((1 + ir), 1.001 * np.arange(L_CH_res, n_res, L_CH_res) / res)
    
    # Inverter replacement (always enabled)
    RC_I[np.arange(L_I_res, n_res, L_I_res)] = R_I * Cn_I / np.power((1 + ir), 1.001 * np.arange(L_I_res, n_res, L_I_res) / res)

    R_Cost_res = RC_PV + RC_WT + RC_DG + RC_B + RC_I + (RC_CH) * (Nbat > 0)

    for i in range(n):
            R_Cost[i] = np.sum(R_Cost_res[i * res: (i + 1) * res])

    # Total M&O Cost ($/year)
    MO_Cost = 0
    if PV:
        MO_Cost += MO_PV * Pn_PV
    if WT:
        MO_Cost += MO_WT * Pn_WT
    if DG:
        MO_Cost += MO_DG * Pn_DG * np.sum(Pdg > 0)
    if Bat:
        MO_Cost += MO_B * Cn_B
        MO_Cost += MO_CH * (Nbat > 0)
    
    # Inverter M&O (always enabled)
    MO_Cost += MO_I * Cn_I
    MO_Cost = MO_Cost / (1 + ir) ** np.arange(1, n + 1)

    # DG fuel Cost
    if DG:
        C_Fu = (np.sum(C_fuel * q)) * (((1 + C_fuel_adj) ** np.arange(1, n + 1)) / ((1 + ir) ** np.arange(1, n + 1)))
    else:
        C_Fu = np.zeros(n)

    # Salvage
    Salvage = 0
    if PV:
        L_rem = (RT_PV + 1) * L_PV - n
        S_PV = (R_PV * Pn_PV) * L_rem / L_PV * 1 / (1 + ir) ** n  # PV
        Salvage += S_PV
    if WT:
        L_rem = (RT_WT + 1) * L_WT - n
        S_WT = (R_WT * Pn_WT) * L_rem / L_WT * 1 / (1 + ir) ** n  # WT
        Salvage += S_WT
    if DG:
        L_rem = (RT_DG + 1) * L_DG - n
        S_DG = (R_DG * Pn_DG) * L_rem / L_DG * 1 / (1 + ir) ** n  # DG
        Salvage += S_DG
    if Bat:
        L_rem = (RT_B + 1) * L_B - n
        S_B = (R_B * Cn_B) * L_rem / L_B * 1 / (1 + ir) ** n
        Salvage += S_B
    L_rem = (RT_I + 1) * L_I - n
    S_I = (R_I * Cn_I) * L_rem / L_I * 1 / (1 + ir) ** n
    Salvage += S_I
    L_rem = (RT_CH + 1) * L_CH - n
    S_CH = (R_CH) * L_rem / L_CH * 1 / (1 + ir) ** n
    Salvage += S_CH * (Nbat > 0)

    # Emissions produced by Diesel generator (g)
    if DG:
        DG_Emissions = np.sum(q * (CO2 + NOx + SO2)) / 1000  # total emissions (kg/year)
    else:
        DG_Emissions = 0
    if Grid:
        Grid_Emissions = np.sum(Pbuy * (E_CO2 + E_SO2 + E_NOx)) / 1000  # total emissions (kg/year)
    else:
        Grid_Emissions = 0
    
    if Grid:
        cumulative_escalation = np.cumprod(1 + Grid_escalation)
        Grid_Cost = (((Annual_expenses + np.sum(Service_charge) + np.sum(Pbuy * Cbuy) + Grid_Tax_amount * np.sum(Pbuy)) * (cumulative_escalation / ((1 + ir) ** np.arange(1, n + 1)))) * (1 + Grid_Tax) - ((np.sum(Psell * Csell) + Grid_credit) * (cumulative_escalation / ((1 + ir) ** np.arange(1, n + 1)))))
        Grid_Cost_ADJ = (Annual_expenses + np.sum(Service_charge) + np.sum(Pbuy * Cbuy) + Grid_Tax_amount * np.sum(Pbuy)) - (np.sum(Psell * Csell) + Grid_credit)
    else:
        Grid_Cost = np.zeros(n)
        Grid_Cost_ADJ = 0

    # Capital recovery factor
    CRF = (ir * (1 + ir) ** n / ((1 + ir) ** n - 1)) if (ir != 0 and not np.isnan(ir)) else (1 / n)

    # Total Cost
    NPC = (((I_Cost + np.sum(R_Cost) + np.sum(MO_Cost) + np.sum(C_Fu) - Salvage) * (1 + System_Tax)) + np.sum(Grid_Cost))
    Operating_Cost = (CRF * (((np.sum(R_Cost) + np.sum(MO_Cost) + np.sum(C_Fu) - Salvage) * (1 + System_Tax)) + np.sum(Grid_Cost)))

    LCOE = CRF * NPC / np.sum(Eload - Ens + Psell)
    LEM = (DG_Emissions + Grid_Emissions) / np.sum(Eload - Ens)
    Ebmin = SOC_min * Cn_B
    Pb_min = (Eb[1:8761] - Ebmin) + Pdch
    Ptot = (Ppv + Pwt + Pb_min) * n_I + Pdg + Grid * Pbuy_max
    DE = np.maximum(Eload - Ptot, 0)

    LPSP = np.sum(Ens) / np.sum(Eload)
    RE = 1 - np.sum(Pdg + Pbuy) / np.sum(Eload + Psell-Ens)
    if (np.isnan(RE)):
        RE = 0

    Z = 1e2 * NPC + 1e6 * EM * LEM + 1e8 * (np.sum(Grid_Cost) < 0) * (NEM == 1) + 1e4 * (np.sum(Edump)) * (NEM == 1) + 1e6 * (Pn_PV >= DC_AC_ratio * (Cn_I + Pn_WT + Pn_DG + Pbuy_max * (np.sum(Pbuy) > 0.1))) + 1e6 * (LPSP > LPSP_max) + 1e6 * (RE < RE_min) + 100 * (I_Cost > Budget) +\
        1e8 * np.maximum(0, LPSP - LPSP_max) + 1e8 * np.maximum(0, RE_min - RE) + 1e4 * np.maximum(0, I_Cost - Budget)
    return Z



