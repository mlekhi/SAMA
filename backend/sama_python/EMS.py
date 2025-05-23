import numpy as np
from numba import jit
import pandas as pd
from sama_python.Battery_Model import KiBaM, IdealizedBattery

"""
Energy management 
"""

#path_BData = 'content/Battery.csv'
#BData = pd.read_csv(path_BData, header=None).values
#Pch_max = np.array(BData[:, 0])
#Pdch_max = np.array(BData[:, 1])

@jit(nopython=True, fastmath=True)
def EMS(Lead_acid, Li_ion, Ich_max_Li_ion, Idch_max_Li_ion, Cnom_Li, Vnom_Li_ion, ef_bat_Li, Q_lifetime_Li, Ppv, alfa_battery_Li_ion, Pwt, Eload, Cn_B, Nbat, Pn_DG, NT, SOC_max, SOC_min, SOC_initial, n_I, Grid, Cbuy, a, b, R_DG, TL_DG, MO_DG, Pinv_max, LR_DG, C_fuel, Pbuy_max, Psell_max, R_B, Q_lifetime_leadacid, self_discharge_rate, alfa_battery_leadacid, c, k, Ich_max_leadacid, Vnom_leadacid, ef_bat_leadacid):

    if Li_ion == 1:
        ef_bat = ef_bat_Li
        Q_lifetime = Q_lifetime_Li

    if Lead_acid == 1:
        ef_bat = ef_bat_leadacid
        Q_lifetime = Q_lifetime_leadacid

    Eb = np.zeros(NT + 1)
    Pch = np.zeros(NT)
    Pdch = np.zeros(NT)
    Pdch_max = np.zeros(NT)
    Pch_max = np.zeros(NT)
    Ech = np.zeros(NT)
    Edch = np.zeros(NT)
    Pdg = np.zeros(NT)
    Edump = np.zeros(NT)
    Ens = np.zeros(NT)
    Psell = np.zeros(NT)
    Pbuy = np.zeros(NT)
    Ebmax = SOC_max * Cn_B
    Ebmin = SOC_min * Cn_B
    Eb[0] = SOC_initial * Cn_B
    dt = 1 #time-step
    price_dg = np.zeros(NT)

    if Grid == 0:
        Pbuy_max = 0
        Psell_max = 0

    P_RE = Ppv + Pwt
    if sum(P_RE + Pbuy) == 0:
        Pdg_min = LR_DG * Pn_DG
    else:
        Pdg_min = 0.01 * Pn_DG

    # Battery Wear Cost
    Cbw = R_B * Cn_B / (Nbat * Q_lifetime * np.sqrt(ef_bat)) if Cn_B > 0 else 0

    # DG fixed cost
    cc_gen = (b * Pn_DG * C_fuel) + ((R_DG * Pn_DG) / (TL_DG)) + MO_DG
    # DG marginal cost
    mar_gen = a * C_fuel
    # DG cost for cases
    for t in range(NT):
        price_dg[t] = ((cc_gen / Eload[t]) + mar_gen) if (Eload[t] != 0 and not np.isnan(Eload[t])) else np.inf

    # Define cases

    load_greater = np.logical_and(P_RE >= (Eload / n_I), (True))

    case1 = np.logical_and(np.logical_not(load_greater),
                           np.logical_and(Cbuy <= price_dg, price_dg <= Cbw))  # Grid, DG , Bat : 1
    case2 = np.logical_and(np.logical_not(load_greater),
                           np.logical_and(Cbuy <= Cbw, Cbw < price_dg))  # Grid, Bat , DG : 2
    case3 = np.logical_and(np.logical_not(load_greater),
                           np.logical_and(price_dg < Cbuy, Cbuy <= Cbw))  # DG, Grid , Bat :3
    case4 = np.logical_and(np.logical_not(load_greater),
                           np.logical_and(price_dg < Cbw, Cbw < Cbuy))  # DG, Bat , Grid :4
    case5 = np.logical_and(np.logical_not(load_greater), np.logical_and(Cbw < price_dg, price_dg < Cbuy))


    for t in range(NT):

        if Li_ion == 1:
            Pdch_max[t], Pch_max[t] = IdealizedBattery(dt, SOC_min, SOC_max, alfa_battery_Li_ion, Nbat, Eb[t], Cn_B, Ich_max_Li_ion, Idch_max_Li_ion, Vnom_Li_ion, ef_bat)

        if Lead_acid == 1:
            Pdch_max[t], Pch_max[t] = KiBaM(dt, Pch[t], Pdch[t], Cn_B, Nbat, Eb[t], SOC_min, SOC_max, alfa_battery_leadacid, c, k, Ich_max_leadacid, Vnom_leadacid, ef_bat)

        if load_greater[t]:
            Eb_e = (Ebmax - Eb[t]) / np.sqrt(ef_bat)
            Pch[t] = min(Eb_e, P_RE[t] - (Eload[t] / n_I))
            Pch[t] = min(Pch[t], Pch_max[t])

            Psur_AC = min(Pinv_max, n_I * (P_RE[t] - Pch[t]) - Eload[t])

            Psell[t] = min(Psur_AC, Psell_max)
            Psell[t] = min(max(0, Pinv_max - Eload[t]), Psell[t])

            Edump[t] = P_RE[t] * n_I - min(Pinv_max, Pch[t] * n_I + (Eload[t] + Psell[t]))
            Ens[t] = max(0, Eload[t] - min(Pinv_max, (P_RE[t] - Pch[t]) * n_I - Psell[t]))

        else:
            Edef_AC = Eload[t] - min(Pinv_max, n_I * P_RE[t])

            if case1[t]:
                Pbuy[t] = min(Edef_AC, Pbuy_max)

                Pdg[t] = min(Edef_AC - Pbuy[t], Pn_DG)
                Pdg[t] = Pdg[t] * (Pdg[t] >= LR_DG * Pn_DG) + LR_DG * Pn_DG * (Pdg[t] < LR_DG * Pn_DG) * (Pdg[t] > Pdg_min)
                Edef_AC = Eload[t] - Pdg[t] - Pbuy[t] - min(Pinv_max, n_I * P_RE[t])
                Edef_DC = (Edef_AC / n_I) * (Edef_AC > 0)
                Eb_e = (Eb[t] - Ebmin) * np.sqrt(ef_bat)
                Pdch[t] = min(Eb_e, Edef_DC)
                Pdch[t] = min(Pdch[t], Pdch_max[t])

                Esur_AC = -Edef_AC * (Edef_AC < 0)
                Pbuy[t] = Pbuy[t] - Esur_AC * (Grid ==1)

            elif case2[t]:
                Pbuy[t] = min(Edef_AC, Pbuy_max)

                Edef_DC = ((Eload[t] - Pbuy[t])/n_I) - P_RE[t]
                Edef_DC = Edef_DC * (Edef_DC > 0)
                Eb_e = (Eb[t] - Ebmin) * np.sqrt(ef_bat)
                Pdch[t] = min(Eb_e, Edef_DC)
                Pdch[t] = min(Pdch[t], Pdch_max[t])

                Edef_AC = Eload[t] - Pbuy[t] - min(Pinv_max, n_I * (P_RE[t] + Pdch[t]))
                Pdg[t] = min(Edef_AC, Pn_DG)
                Pdg[t] = Pdg[t] * (Pdg[t] >= LR_DG * Pn_DG) + LR_DG * Pn_DG * (Pdg[t] < LR_DG * Pn_DG) * (Pdg[t] > Pdg_min)

                Esur_AC = -Edef_AC * (Edef_AC < 0)
                Pbuy[t] = Pbuy[t] - Esur_AC * (Grid == 1)

            elif case3[t]:
                Pdg[t] = min(Edef_AC, Pn_DG)
                Pdg[t] = Pdg[t] * (Pdg[t] >= LR_DG * Pn_DG) + LR_DG * Pn_DG * (Pdg[t] < LR_DG * Pn_DG) * (Pdg[t] > Pdg_min)

                Pbuy[t] = max(0, min(Edef_AC - Pdg[t], Pbuy_max))
                Psell[t] = max(0, min(Pdg[t] - Edef_AC, Psell_max))

                Edef_DC = ((Eload[t] - Pbuy[t] - Pdg[t])/n_I) - P_RE[t]
                Edef_DC = Edef_DC * (Edef_DC > 0)
                Eb_e = (Eb[t] - Ebmin) * np.sqrt(ef_bat)
                Pdch[t] = min(Eb_e, Edef_DC)
                Pdch[t] = min(Pdch[t], Pdch_max[t])

            elif case4[t]:
                Pdg[t] = min(Edef_AC, Pn_DG)
                Pdg[t] = Pdg[t] * (Pdg[t] >= LR_DG * Pn_DG) + LR_DG * Pn_DG * (Pdg[t] < LR_DG * Pn_DG) * (Pdg[t] > Pdg_min)

                Edef_DC = ((Eload[t] - Pdg[t])/n_I) - P_RE[t]
                Edef_DC = Edef_DC * (Edef_DC > 0)
                Eb_e = (Eb[t] - Ebmin) * np.sqrt(ef_bat)
                Pdch[t] = min(Eb_e, Edef_DC)
                Pdch[t] = min(Pdch[t], Pdch_max[t])

                Edef_AC = Eload[t] - Pdg[t] - min(Pinv_max, n_I * (P_RE[t] + Pdch[t]))
                Pbuy[t] = max(0, min(Edef_AC, Pbuy_max))
                Psell[t] = max(0, min(-Edef_AC, Psell_max))

            elif case5[t]:
                Edef_DC = Eload[t]/n_I - P_RE[t]
                Eb_e = (Eb[t] - Ebmin) * np.sqrt(ef_bat)
                Pdch[t] = min(Eb_e, Edef_DC)
                Pdch[t] = min(Pdch[t], Pdch_max[t])

                Edef_AC = Eload[t] - min(Pinv_max, n_I * (P_RE[t] + Pdch[t]))
                Pdg[t] = min(Edef_AC, Pn_DG)
                Pdg[t] = Pdg[t] * (Pdg[t] >= LR_DG * Pn_DG) + LR_DG * Pn_DG * (Pdg[t] < LR_DG * Pn_DG) * (Pdg[t] > Pdg_min)

                Pbuy[t] = max(0, min(Edef_AC - Pdg[t], Pbuy_max))
                Psell[t] = max(0, min(Pdg[t] - Edef_AC, Psell_max))
            else:
                Edef_DC = Eload[t]/n_I - P_RE[t]
                Eb_e = (Eb[t] - Ebmin) * np.sqrt(ef_bat)
                Pdch[t] = min(Eb_e, Edef_DC) * (Edef_DC > 0)
                Pdch[t] = min(Pdch[t], Pdch_max[t])

                Edef_AC = Eload[t] - min(Pinv_max, n_I * (P_RE[t] + Pdch[t]))
                Pbuy[t] = min(Edef_AC, Pbuy_max)

                Pdg[t] = min(Edef_AC - Pbuy[t], Pn_DG)
                Pdg[t] = Pdg[t] * (Pdg[t] >= LR_DG * Pn_DG) + LR_DG * Pn_DG * (Pdg[t] < LR_DG * Pn_DG) * (Pdg[t] > Pdg_min)

                Esur_AC = -Edef_AC * (Edef_AC < 0)
                Pbuy[t] = Pbuy[t] - Esur_AC * (Grid == 1)

            Edef_DC = ((Eload[t] + Psell[t] - Pdg[t] - Pbuy[t])/n_I) - (P_RE[t] + Pdch[t] - Pch[t])

            if Edef_DC < 0:
                Eb_e = (Ebmax - Eb[t]) / np.sqrt(ef_bat)
                Pch[t] = min(Eb_e, Pch[t] - Edef_DC)
                Pch[t] = min(Pch[t], Pch_max[t])

            Esur = P_RE[t] * n_I + Pbuy[t] + Pdg[t] - min(Pinv_max, (Pch[t] - Pdch[t]) * n_I + (Eload[t] + Psell[t]))
            Ens[t] = max(0, Eload[t] - Pbuy[t] - Pdg[t] - min(Pinv_max, (P_RE[t] + Pdch[t] - Pch[t]) * n_I - Psell[t]))
            Edump[t] = Esur * (Esur > 0)

        Ech[t] = Pch[t] * dt
        Edch[t] = Pdch[t] * dt
        Eb[t + 1] = ((1 - self_discharge_rate) * Eb[t]) + (Ech[t] * np.sqrt(ef_bat)) - (Edch[t] / np.sqrt(ef_bat))

    return Pdg, Ens, Pbuy, Psell, Edump, Pch, Pdch, Eb, Pdch_max, Pch_max







