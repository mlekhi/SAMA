import numpy as np
from numba import jit
from math import ceil
from sama_python.EMS import EMS

#@jit(nopython=True, fastmath=True)
def fitness(X, input_data):
    if X.size == 1:
        X = X[0]

    Eload = input_data.Eload
    Ppv_r = input_data.Ppv_r
    Pwt_r = input_data.Pwt_r
    Cbt_r = input_data.Cbt_r
    Cdg_r = input_data.Cdg_r
    T = input_data.T
    Tc_noct = input_data.Tc_noct
    G = input_data.G
    c2 = input_data.c2
    fpv = input_data.fpv
    Gref = input_data.Gref
    Tcof = input_data.Tcof
    Tref = input_data.Tref
    Ta_noct = input_data.Ta_noct
    G_noct = input_data.G_noct
    n_PV =  input_data.n_PV
    gama =  input_data.gama
    Vw = input_data.Vw
    h_hub = input_data.h_hub
    h0 = input_data.h0
    alfa_wind_turbine = input_data.alfa_wind_turbine
    v_cut_in = input_data.v_cut_in
    v_cut_out = input_data.v_cut_out
    v_rated = input_data.v_rated
    R_B = input_data.R_B
    Q_lifetime_leadacid = input_data.Q_lifetime_leadacid
    ef_bat_leadacid = input_data.ef_bat_leadacid
    b = input_data.b
    C_fuel = input_data.C_fuel
    R_DG = input_data.R_DG
    TL_DG = input_data.TL_DG
    MO_DG = input_data.MO_DG
    SOC_max = input_data.SOC_max
    SOC_min = input_data.SOC_min
    SOC_initial = input_data.SOC_initial
    n_I = input_data.n_I
    DC_AC_ratio=input_data.DC_AC_ratio
    Grid = input_data.Grid
    Cbuy = input_data.Cbuy
    a = input_data.a
    LR_DG = input_data.LR_DG
    Pbuy_max = input_data.Pbuy_max
    Psell_max = input_data.Psell_max
    self_discharge_rate = input_data.self_discharge_rate
    alfa_battery_leadacid = input_data.alfa_battery_leadacid
    c = input_data.c
    k = input_data.k
    Ich_max_leadacid = input_data.Ich_max_leadacid
    Vnom_leadacid = input_data.Vnom_leadacid
    RE_incentives = input_data.RE_incentives
    C_PV = input_data.C_PV
    C_WT = input_data.C_WT
    C_DG = input_data.C_DG
    C_B = input_data.C_B
    C_I=input_data.C_I
    C_CH=input_data.C_CH
    Engineering_Costs=input_data.Engineering_Costs
    n=input_data.n
    L_PV=input_data.L_PV
    R_PV=input_data.R_PV
    ir=input_data.ir
    L_WT=input_data.L_WT
    R_WT=input_data.R_WT
    L_B=input_data.L_B
    L_I=input_data.L_I
    R_I=input_data.R_I
    L_CH=input_data.L_CH
    R_CH=input_data.R_CH
    MO_PV=input_data.MO_PV
    MO_WT=input_data.MO_WT
    MO_B=input_data.MO_B
    MO_I=input_data.MO_I
    MO_CH=input_data.MO_CH
    RT_PV=input_data.RT_PV
    RT_WT=input_data.RT_WT
    RT_B=input_data.RT_B
    RT_I=input_data.RT_I
    RT_CH=input_data.RT_CH
    CO2=input_data.CO2
    NOx=input_data.NOx
    SO2=input_data.SO2
    E_CO2=input_data.E_CO2
    E_SO2=input_data.E_SO2
    E_NOx=input_data.E_NOx
    Annual_expenses=input_data.Annual_expenses
    Service_charge=input_data.Service_charge
    Csell=input_data.Csell
    Grid_Tax=input_data.Grid_Tax
    System_Tax=input_data.System_Tax
    EM=input_data.EM
    LPSP_max=input_data.LPSP_max
    RE_min=input_data.RE_min
    Budget=input_data.Budget
    Grid_escalation = input_data.Grid_escalation
    C_fuel_adj = input_data.C_fuel_adj
    Grid_Tax_amount = input_data.Grid_Tax_amount
    Grid_credit = input_data.Grid_credit
    NEM = input_data.NEM
    NEM_fee = input_data.NEM_fee
    Lead_acid = input_data.Lead_acid
    Li_ion = input_data.Li_ion
    Ich_max_Li_ion = input_data.Ich_max_Li_ion
    Idch_max_Li_ion = input_data.Idch_max_Li_ion
    Vnom_Li_ion = input_data.Vnom_Li_ion
    Cnom_Li = input_data.Cnom_Li
    ef_bat_Li = input_data.ef_bat_Li
    Q_lifetime_Li = input_data.Q_lifetime_Li
    alfa_battery_Li_ion = input_data.alfa_battery_Li_ion

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

    # PV Power Calculation
    #Tc = T + (((Tc_noct - 20) / 800) * G)  # Module Temprature
    # Module Temperature
    Tc = (T + 273.15 + (Tc_noct - Ta_noct) * (G / G_noct) * (1 - ((n_PV * (1 - (Tcof / 100) * (Tref + 273.15))) / gama))) / (1 + (Tc_noct - Ta_noct) * (G / G_noct) * (((Tcof / 100) * n_PV) / gama))
    Ppv = fpv * Pn_PV * (G / Gref) * (1 + (Tcof / 100) * (Tc - 273.15 - Tref))  # output power(kw)_hourly

    # Wind turbine Power Calculation
    v1 = Vw  # hourly wind speed
    v2 = ((h_hub / h0) ** (alfa_wind_turbine)) * v1  # v1 is the speed at a reference height;v2 is the speed at a hub height h2

    Pwt = np.zeros(8760)
    true_value = np.logical_and(v_cut_in <= v2, v2 < v_rated)
    Pwt[np.logical_and(v_cut_in <= v2, v2 < v_rated)] = v2[true_value] ** 3 * (Pwt_r / (v_rated ** 3 - v_cut_in ** 3)) - (v_cut_in ** 3 / (v_rated ** 3 - v_cut_in ** 3)) * (Pwt_r)
    Pwt[np.logical_and(v_rated <= v2, v2 < v_cut_out)] = Pwt_r
    Pwt = Pwt * Nwt

    ## Energy Management

    Pdg, Ens, Pbuy, Psell, Edump, Pch, Pdch, Eb, Pdch_max, Pch_max= EMS(Lead_acid, Li_ion, Ich_max_Li_ion, Idch_max_Li_ion, Cnom_Li, Vnom_Li_ion, ef_bat_Li, Q_lifetime_Li, Ppv, alfa_battery_Li_ion, Pwt, Eload, Cn_B, Nbat, Pn_DG, NT, SOC_max, SOC_min, SOC_initial, n_I, Grid, Cbuy, a, b, R_DG, TL_DG, MO_DG, Cn_I, LR_DG, C_fuel, Pbuy_max, Psell_max, R_B, Q_lifetime_leadacid, self_discharge_rate, alfa_battery_leadacid, c, k, Ich_max_leadacid, Vnom_leadacid, ef_bat_leadacid)

    q = (a * Pdg + b * Pn_DG) * (Pdg > 0)  # Fuel consumption of a diesel generator

    ## Installation and operation cost

    # Total Investment cost ($)
    I_Cost = C_PV * (1 - RE_incentives) * Pn_PV + C_WT * (1 - RE_incentives) * Pn_WT + C_DG * Pn_DG + C_B * (1 - RE_incentives) * Cn_B + C_I * (1 - RE_incentives) * Cn_I + C_CH * (1 - RE_incentives)*(Nbat > 0) + Engineering_Costs * (1 - RE_incentives) * Pn_PV + NEM_fee

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
    RC_PV[np.arange(L_PV_res, n_res, L_PV_res)] = R_PV * Pn_PV / np.power((1 + ir), 1.001 * np.arange(L_PV_res, n_res, L_PV_res) / res)
    RC_WT[np.arange(L_WT_res, n_res, L_WT_res)] = R_WT * Pn_WT / np.power((1 + ir), 1.001 * np.arange(L_WT_res, n_res, L_WT_res) / res)
    RC_DG[np.arange(L_DG_res, n_res, L_DG_res)] = R_DG * Pn_DG / np.power((1 + ir), 1.001 * np.arange(L_DG_res, n_res, L_DG_res) / res)
    RC_B[np.arange(L_B_res, n_res, L_B_res)] = R_B * Cn_B / np.power((1 + ir), 1.001 * np.arange(L_B_res, n_res, L_B_res) / res)
    RC_I[np.arange(L_I_res, n_res, L_I_res)] = R_I * Cn_I / np.power((1 + ir), 1.001 * np.arange(L_I_res, n_res, L_I_res) / res)
    RC_CH[np.arange(L_CH_res, n_res, L_CH_res)] = R_CH / np.power((1 + ir), 1.001 * np.arange(L_CH_res, n_res, L_CH_res) / res)

    R_Cost_res = RC_PV + RC_WT + RC_DG + RC_B + RC_I + (RC_CH) * (Nbat > 0)

    for i in range(n):
            R_Cost[i] = np.sum(R_Cost_res[i * res: (i + 1) * res])

    # Total M&O Cost ($/year)
    MO_Cost = ((MO_PV * Pn_PV + MO_WT * Pn_WT + MO_DG * Pn_DG * np.sum(Pdg > 0) + MO_B * Cn_B + MO_I * Cn_I + MO_CH * (Nbat > 0)) / (1 + ir) ** np.arange(1, n + 1))

    # DG fuel Cost
    C_Fu = (np.sum(C_fuel * q)) * (((1 + C_fuel_adj) ** np.arange(1, n + 1)) / ((1 + ir) ** np.arange(1, n + 1)))

    # Salvage
    L_rem = (RT_PV + 1) * L_PV - n
    S_PV = (R_PV * Pn_PV) * L_rem / L_PV * 1 / (1 + ir) ** n  # PV
    L_rem = (RT_WT + 1) * L_WT - n
    S_WT = (R_WT * Pn_WT) * L_rem / L_WT * 1 / (1 + ir) ** n  # WT
    L_rem = (RT_DG + 1) * L_DG - n
    S_DG = (R_DG * Pn_DG) * L_rem / L_DG * 1 / (1 + ir) ** n  # DG
    L_rem = (RT_B + 1) * L_B - n
    S_B = (R_B * Cn_B) * L_rem / L_B * 1 / (1 + ir) ** n
    L_rem = (RT_I + 1) * L_I - n
    S_I = (R_I * Cn_I) * L_rem / L_I * 1 / (1 + ir) ** n
    L_rem = (RT_CH + 1) * L_CH - n
    S_CH = (R_CH) * L_rem / L_CH * 1 / (1 + ir) ** n
    Salvage = S_PV + S_WT + S_DG + S_B + S_I + S_CH * (Nbat > 0)

    # Emissions produced by Disesl generator (g)
    DG_Emissions = np.sum(q * (CO2 + NOx + SO2)) / 1000  # total emissions (kg/year)
    Grid_Emissions = np.sum(Pbuy * (E_CO2 + E_SO2 + E_NOx)) / 1000  # total emissions (kg/year)
    
    cumulative_escalation = np.cumprod(1 + Grid_escalation)

    Grid_Cost = (((Annual_expenses + np.sum(Service_charge) + np.sum(Pbuy * Cbuy) + Grid_Tax_amount * np.sum(Pbuy)) * (cumulative_escalation / ((1 + ir) ** np.arange(1, n + 1)))) * (1 + Grid_Tax) - ((np.sum(Psell * Csell) + Grid_credit) * (cumulative_escalation / ((1 + ir) ** np.arange(1, n + 1))))) * (Grid > 0)

    Grid_Cost_ADJ = (Annual_expenses + np.sum(Service_charge) + np.sum(Pbuy * Cbuy) + Grid_Tax_amount * np.sum(Pbuy)) - (np.sum(Psell * Csell) + Grid_credit)

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



