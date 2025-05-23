# -*- coding: utf-8 -*-
"""SAM_Monofacial_POA.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1d6MdUsTa6lDI_A-ojvB7X3stOp5lopfU

#SAM Code for Vertical Swinging PV
---

Input data

## Importations and General Purpose Functions
"""

# Commented out IPython magic to ensure Python compatibility.
import pandas as pd
import numpy as np
import scipy as sp
import matplotlib
matplotlib.use('Agg')  # Use a non-GUI backend to avoid macOS GUI issues
import matplotlib.pyplot as plt
# %matplotlib inline 
import seaborn as sns
import time

from scipy.optimize import minimize
from scipy.optimize import fsolve
from scipy.optimize import Bounds
from scipy.optimize import NonlinearConstraint
from scipy.integrate import quad
from math import isnan
from numpy import pi

def create_time_frame(df):
    """
        converts the individual year, month, date, and hour of a
        dataframe into a datetime object in a column named Timeframe.

        returns a new dataframe
    """

    df = df.copy(deep=True)
    df = df.reset_index()
    df['Timeframe'] = pd.to_datetime(df[['Year', 'Month', 'Day', 'Hour']], 
                                     format = '%Y/%M/%D %H')
    return df

"""### Trigonometric Functions"""

def sinRad(x):
    return np.sin(x)

def cosRad(x):
    return np.cos(x)

def tanRad(x):
    return np.tan(x)

def sinDeg(x):
    return np.sin(x*pi/180)

def cosDeg(x):
    return np.cos(x*pi/180)

def tanDeg(x):
    return np.tan(x*pi/180)

def asinRad(x):
    return np.arcsin(x)

def acosRad(x):
    return np.arccos(x)

def atanRad(x):
    return np.arctan(x)

def asinDeg(x):
    return 180*np.arcsin(x)/pi

def acosDeg(x):
    return 180*np.arccos(x)/pi

def atanDeg(x):
    return 180*np.arctan(x)/pi

def cotanRad(x):
    return np.cos(x) / np.sin(x)

def cotanDeg(x):
    return np.cos(x*pi/180) / np.sin(x*pi/180)

def radToDeg(row):
    return row*180/(pi)



"""## Getting Input Data

### Weather Data

#### Extract Metadata from the Dataset
"""

def extractWeatherData(url):

    def findDayOfYear(row):

        if row.year%4 != 0:
            return row.day_of_year

        else:
            if row.month == 1 or row.month == 2:
                return row.day_of_year
            else:
                return row.day_of_year - 1


    #____________________________Extract Metadata______________________________#
    df = pd.read_csv(url, nrows=1)
    metadata = df[['Latitude', 'Longitude', 'Time Zone', 'Elevation']]

    lat     = metadata.loc[0, 'Latitude']       # latitue
    lon     = metadata.loc[0, 'Longitude']      # longitude
    t_z     = metadata.loc[0, 'Time Zone']      # time zone
    elv     = metadata.loc[0, 'Elevation']      # elevation

    #___________________________Extract Timeseries_____________________________#
    df = pd.read_csv(url, skiprows=2)
    # create day of year and ensure February 29 is not included
    df = create_time_frame(df)
    df['Day of Year'] = df.Timeframe.apply(findDayOfYear)
    df = df.drop(df[(df.Month == 2) & (df.Day == 29)].index, axis=0)

    # time inputs
    year = df['Year']   # year
    mon = df['Month']   # month
    day = df['Day'] # day
    hour = df['Hour']   # hour
    min = df['Minute']  # minute
    doy = df['Day of Year'] # day of year

    # weather parameters inputs
    w_speed = df['Wind Speed']  # wind speed
    w_dir = df['Wind Direction']    # wind direction
    amb_temp = df['Temperature']    # ambient temperature
    albedo = df['Surface Albedo']   # surface albedo

    # irradation inputs
    beam_irr = df['DNI'] # beam irradiation (direct normal)
    diffuse_irr = df['DHI'] # diffuse horizontal irradiation
    global_irr = df['GHI']  # global horinzontal irradiation


    return (lat, lon, t_z, elv, year, mon, day, hour, min, doy, w_speed, w_dir,
            amb_temp, albedo, beam_irr, diffuse_irr, global_irr)

"""## Sun Position Calculations

### Adjustment Functions
"""

def adjustTimeOfDay(row):
    if row < 0:
        return row + 24
    elif row > 24:
        return row - 24
    else:
        return row


def adjustEclipticDeg(row):
    a = row - 360 * (row//360)
    if a >= 0:
        return a
    else:
        return a + 360


def adjustEclipticRad(row):
    a = row - 2*pi * (row//(2*pi))
    if a >= 0:
        return a
    else:
        return a + 2*pi


def adjustTime(row):
    a = row - 24 * (row//24)
    if a >= 0:
        return a
    else:
        return a + 24


def adjustRightAscen(col, eclong, obleq):
    for i in range(len(col)):
        if cosRad(eclong[i]) < 0:
            col[i] = col[i] + pi
        elif (cosRad(obleq[i]) * sinRad(eclong[i])) < 0:
              col[i] = col[i] + 2*pi
    return col


def adjustHourAngle(row):
    if row < -pi:
        return row + 2*pi
    elif row > pi:
        return row - 2*pi
    else:
        return row


def adjustAltAngleNoRefr(row):
    if -1 <= row <= 1:
        return asinRad(row)
    elif row > 1:
        return pi/2
    else:
        return -pi/2


def adjustAltAngleRefrStp1(row):
    if row > -0.56:
        res = (3.51561*(0.1594 + 0.0196*row +
                        0.00002*(row**2))) / (1 + 0.505*row + 0.0845*(row**2))
        return res
    else:
        return 0.56


def adjustAltAngleRefrStp2(row):
    if row > 90:
        return pi/2
    else:
        return (pi/180) * row


def adjustAzimuthAngle(row, alpha_0, HA):
    for i in range(len(row)):
        if -1 <= row[i] <= 1:
            row[i] = acosRad(row[i])
        elif (row[i] < -1) or (cosRad(alpha_0[i]) == 0):
            row[i] = pi
        elif row[i] > 1:
            row[i] = 0
        else:
            print("Nothing to do")

        if (-pi <= HA[i] <=0) or (HA[i] >= pi):
            row[i] = pi-row[i]
        elif 0 <= HA[i] <= pi:
            row[i] = pi + row[i]
    return row


def findSunUpDown(hour, h_rise, h_set):
    res = pd.Series(np.zeros(len(h_rise)))
    for i in range(len(h_rise)):
        if (hour[i] < h_rise[i]) or (hour[i] > h_set[i]):
            res[i] = 0
        else:
            res[i] = 1
    return res


def adjustEOT(row):
    if -0.33 <= row <= 0.33:
        return row
    elif row < -0.33:
        return row + 24
    elif row > 0.33:
        return row - 24

"""### Sun Position Angle Calculations Code

#### Find Sun Position Function
"""

def findSunPositions(t_z, lat, lon, year, mon, doy, hour, min):

    #_______________________Effective Time Calculations________________________#
    ## calculate time of day as UTC offset
    tod = hour + min/60 - t_z
    ## corrected time of day
    tod = tod.apply(adjustTimeOfDay)
    ## julian date of the timestep
    julian = 32916.5 + 365*(year -
                            1949) + (year - 1949)/4 + doy + tod/24 - 51545


    #________________________________Sun Angles________________________________#
    ## mean longitude [deg] and asjustment
    mnlong = 280.46 + 0.9856474 * julian
    mnlong = mnlong.apply(adjustEclipticDeg)
    ## mean anomaly in [rad] and adjustment
    mnanom = (pi/180) * (357.528 + 0.9856003 * julian)
    mnanom = mnanom.apply(adjustEclipticRad)
    ## ecliptic longitude [rad] and asjustment
    eclong = (pi/180) * (mnlong + 1.915*sinRad(mnanom) + 0.02*sinRad(2*mnanom))
    eclong = eclong.apply(adjustEclipticRad)
    ## obliquity of ecliptic [rad]
    obleq = (pi/180) * (23.439 - 0.0000004*julian)

    ## celestial Coordinates
    # right ascension [rad] and correction
    ra = atanRad((cosRad(obleq) * sinRad(eclong)) / cosRad(eclong))
    ra = adjustRightAscen(ra, eclong, obleq)
    # declination angle [rad]
    declin = asinRad(sinRad(obleq) * sinRad(eclong))

    ## grenwhich mean siderial time [h]
    gmst = 6.697375 + 0.0657098242*julian + tod
    ## local mean siderial time [h] and adjustment
    lmst = gmst + lon/15
    lmst = lmst.apply(adjustTime)
    ## hour angle [rad]
    HA = 15*(pi/180)*lmst - ra
    HA = HA.apply(adjustHourAngle)
    # HA = HA.apply(adjustHourAngle)
    ## sun altitude angle [rad] (not corrected for refraction)
    alpha_0 = sinRad(declin) * sinRad(pi*lat/180) + \
                cosRad(declin) * cosRad(lat*pi/180) * cosRad(HA)
    alpha_0 = alpha_0.apply(adjustAltAngleNoRefr)
    ## sun altitude angle [rad] (corrected for refraction)
    alpha_0d = 180 * alpha_0 / pi
    r =  alpha_0d.apply(adjustAltAngleRefrStp1)
    alpha = alpha_0d + r
    alpha = alpha.apply(adjustAltAngleRefrStp2)
    ## sun azimuth angle [rad]
    gamma = (sinRad(alpha_0) * sinRad(lat*pi/180) - sinRad(declin)) / \
            (cosRad(alpha_0) * cosRad(lat*pi/180))
    gamma = adjustAzimuthAngle(gamma, alpha_0, HA)
    ## sun zenith angle [rad]
    sun_zenith = (pi/2) - alpha


    #________________________Sunrise and Sunset Hours__________________________#
    ## sunrise hour angle [rad]
    rise_HA = acosRad((cosDeg(90.833)/(cosDeg(lat)*cosRad(declin)) -
                    tanDeg(lat) * tanRad(declin)))
    ## equation of time [hours]
    EOT = ((180/pi)*ra - mnlong)/15
    EOT = (EOT.apply(adjustEOT))
    ## sunrise and sunset hour
    h_rise = 12 - (180/(15*pi))*rise_HA - (lon/15 - t_z) - EOT
    h_set = 12 + (180/(15*pi))*rise_HA - (lon/15 - t_z) - EOT
    ## sunposition up or down
    sunup = findSunUpDown(hour, h_rise, h_set)

    ## convert all angles in [deg]
    sun_zenith = sun_zenith.apply(radToDeg)
    alpha = alpha.apply(radToDeg)
    declin = declin.apply(radToDeg)
    gamma = gamma.apply(radToDeg)

    ### output results
    return sun_zenith, alpha, declin, gamma, sunup

"""### Extraterrestrial Radiation"""

def calcExtraTerrIrr(doy, sun_zen):
    extr_irr = 1367 * (1 + 0.033 * cosDeg(360*doy/365))
    conditions = [(sun_zen > 0) & (sun_zen < 90),
                sun_zen == 0,
                (sun_zen < 0) | (sun_zen >= 90)]
    choice_list = [extr_irr * cosDeg(sun_zen), extr_irr, 0]
    extr_irr = pd.Series(np.select(conditions, choice_list))

"""### True Solar Time and Eccentricity Correction
Provide Code if needed

## Surface Angles
"""

def findSurfaceAngles(tilt, azim, sun_zen, sun_azim, sunup):
    #____________________________Tilt and Azimuth______________________________#
    # both angles in [deg]
    surf_tilt = tilt
    surf_azim = azim

    #____________________________Angle of Incidence____________________________#
    aoi_temp = sinDeg(sun_zen) * cosDeg(sun_azim - surf_azim) * \
                sinDeg(surf_tilt) + cosDeg(sun_zen) * cosDeg(surf_tilt)

    conditions = [aoi_temp < -1,
                  aoi_temp > 1,
                  (aoi_temp >= -1) & (aoi_temp <= 1)]
    choice_list = [pi, 0, acosRad(aoi_temp)]
    aoi_temp = pd.Series(np.select(conditions, choice_list))
    aoi = aoi_temp.apply(radToDeg)

    ## make angle of incidence 0 during nighttime
    conditions = [sunup == 0,
                  sunup == 1]
    choice_list = [0, aoi]
    aoi = pd.Series(np.select(conditions, choice_list))

    return aoi, surf_tilt, surf_azim

"""## Plan of Array (POA) Irradiance

### Helper Functions
"""

def adjust_POA(row):
    if row < 0:
        return 0
    else:
        return row

"""### Main Function"""

def findPoaIrradiances(glob_irr, beam_irr, diff_irr, extr_irr, alb, aoi,
                       surf_tilt, sun_zen, irr_mode=0, sky_model=0, use_alb=1):
    
    #___________________________POA Beam Irradiance____________________________#
    if irr_mode == 0:
        poa_beam = beam_irr * cosDeg(aoi)
    elif irr_mode == 2:
        pass
    poa_beam = poa_beam.apply(adjust_POA)
    

    ## beam irradiance on horizontal surface
    poa_beam_hor = beam_irr * cosDeg(sun_zen)
    if (poa_beam_hor > extr_irr).any == True:
        res = 'Error: Horizontal Beam Irradiation Greater Than' + \
              ' Extraterrestrial Irradiation'
        return res
        

    #________________________POA Sky Diffuse Irradiance________________________#
    if irr_mode == 0:
        diff_irr = diff_irr
    elif irr_mode == 2:
        pass
    else:
        pass

    if sky_model == 0:
        poa_diff = diff_irr * (( 1 + cosDeg(surf_tilt))/2)
    elif sky_model == 1:
        pass
    elif sky_model == 2:
        pass
    else:
        pass

    
    #_________________________POA Reflected Irradiance_________________________#
    poa_refl = alb * (beam_irr * cosDeg(sun_zen) + 
                      diff_irr) * ((1 - cosDeg(surf_tilt))/2)

    return poa_beam, poa_diff, poa_refl

"""## Effective POA Irradiance"""

def findEffectivePoa(poa_beam, poa_diff, poa_refl, soiling = 5, beam_timestep=0,
                     beam_loss=0, diff_loss=0):
    #_________________________Nominal POA Irradinace___________________________#
    nom_irr = poa_beam + poa_diff + poa_refl

    #_______________________Soiling and Shading Factors________________________#
    theta_soiling = 1 - soiling/100
    theta_beam = 1 - beam_loss/100
    theta_diff = 1 - diff_loss/100

    #___________________Irradiance After Shading And Losses____________________#
    poa_beam_eff = poa_beam * theta_soiling * theta_beam * theta_diff
    poa_diff_eff = poa_diff * theta_soiling * theta_beam * theta_diff
    poa_refl_eff = poa_refl * theta_soiling * theta_beam * theta_diff
    poa_tot = poa_beam_eff + poa_diff_eff + poa_refl_eff
    poa_tot_diff = poa_diff_eff + poa_refl_eff

    return (nom_irr, poa_beam_eff, poa_diff_eff, poa_refl_eff, 
            poa_tot, poa_tot_diff)

"""## POA After Reflection"""

def poaAfterReflection(poa_beam, poa_diff, poa_refl, aoi, surf_tilt, sunup):

    #___________________Transmittance as a Function of Theta___________________#
    def tau_alpha_calc(theta_i):
        # refraction angle
        theta_r = asinDeg(sinDeg(theta_i) / n)

        theta_num = theta_r - theta_i
        theta_den = theta_r + theta_i
        tau_a = np.exp(-(K*L)/cosDeg(theta_r))
        sin_val = ((sinDeg(theta_num))**2) / ((sinDeg(theta_den))**2)
        tan_val = ((tanDeg(theta_num))**2) / ((tanDeg(theta_den))**2)
        tau_t = 1 - 0.5*(sin_val + tan_val)
        res = tau_a * tau_t
        return res


    #___________________________Constant Values _______________________________#
    n = 1.526; L = 0.002; K = 4   
    #______________________Global Effective Irradiance_________________________#
    ##################################################
    #glob_irr = poa_beam + poa_diff + poa_refl #######
    ##################################################
    #______________________________Incide Angles_______________________________#
    # sky-diffuse incident angle
    theta_d = 59.7 - 0.1388*surf_tilt + 0.001497*np.square(surf_tilt)
    # ground-reflected incident angle
    theta_g = 90.0 - 0.5788*surf_tilt + 0.002693*np.square(surf_tilt)
    #____________________Transmittance and Angle Modifiers_____________________#
    ## normal surface
    tau_al_n = np.exp(-K*L)*(1 - ((1-n)/(n+1))**2)
    ## beam irradiance
    tau_al_b = tau_alpha_calc(aoi)
    conditions = [sunup == 0,
                  sunup == 1]
    choice_list = [0, tau_al_b]
    tau_al_b = pd.Series(np.select(conditions, choice_list))
    k_tau_b = tau_al_b / tau_al_n
    ## sky diffuse
    tau_al_d = tau_alpha_calc(theta_d)
    k_tau_d = tau_al_d / tau_al_n
    ## ground diffuse
    tau_al_g = tau_alpha_calc(theta_g)
    k_tau_g = tau_al_g / tau_al_n
    ## irradiance absorbed by pv cell
    pv_irr = poa_beam * k_tau_b + poa_diff * k_tau_d + \
                poa_refl * k_tau_g

    return pv_irr

"""## Simulation"""

def runSimulation(weather_url, tilt, azimuth, soiling):

    ## extract weather data
    res = extractWeatherData(weather_url)
    (lat, lon, t_z, elv, year, mon, day, hour, min, doy, w_speed, w_dir, 
     amb_temp, albedo, beam_irr, diffuse_irr, global_irr) = res

    ## sun angles
    (sun_zen, sun_alt, sun_decl, sun_azim, 
     sunup) = findSunPositions(t_z, lat, lon, year, mon, doy, hour, min)

    ## extraterrestrial irradiation
    extr_irr = calcExtraTerrIrr(doy, sun_zen)

    ## surface angles
    aoi, surf_tilt, surf_azim = findSurfaceAngles(tilt, azimuth, sun_zen, 
                                                  sun_azim, sunup)

    ## poa front irradiances
    (poa_beam, poa_diffuse, 
     poa_reflected) = findPoaIrradiances(global_irr, beam_irr, diffuse_irr, 
                                         extr_irr, albedo, aoi, surf_tilt, 
                                         sun_zen)
     
    (poa_beam_rear, poa_diff_rear, poa_refl_rear) = (0, 0, 0)

    ## effective poa irradiances front and back
    res = findEffectivePoa(poa_beam, poa_diffuse, poa_reflected, soiling, 
                            beam_timestep=0, beam_loss=0, diff_loss=0)
    (nom_irr, poa_beam_eff, poa_diff_eff, poa_refl_eff, poa_tot, 
     poa_tot_diff) = res

    ## poa after reflection     
    pv_irr_front = poaAfterReflection(poa_beam_eff, poa_diff_eff, poa_refl_eff, 
                                      aoi, surf_tilt, sunup)

    return pv_irr_front, amb_temp, w_speed


if __name__ == "__main__":
    runSimulation()