# This file is completed, no need to change.
# New directory can be created specifically to pickle files into
# File works as intended but needs to be unit tested.

from unittest.main import TestProgram

try:
    import pandas as pd
    import numpy as np
    import json
except ImportError:
    raise ImportError("Data generation script not importing sufficient dependencies\n")
# from pathlib import Path


# Timeframe for the data read is initiated from Jan 22, 2021 : 22/01/2020
_COVID_CASES_OVER_TIME_DATA = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"
_COVID_DEATHS_OVER_TIME_DATA = "https://github.com/CSSEGISandData/COVID-19/blob/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv"
_COVID_RECOVERED_OVER_TIME_DATA = "https://github.com/CSSEGISandData/COVID-19/blob/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv"


_DATA_PATH = "stored_data"


class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return super(NpEncoder, self).default(obj)


def get_incident_cases(array):
    n = len(array)
    if n == 0:
        raise ValueError(
            "Empty list passed to get incident cases from, check fetch_data()\n"
        )
    res = [array[0]]
    for i in range(1, len(array)):
        res.append(array[i] - array[i - 1])

    return res


def fetch_data():

    if (
        _COVID_CASES_OVER_TIME_DATA
        or _COVID_DEATHS_OVER_TIME_DATA
        or _COVID_RECOVERED_OVER_TIME_DATA
    ) is None:
        raise AssertionError(
            "Data links to online csv files not correctly configured\n"
        )

    confirmed_df = pd.read_csv(_COVID_CASES_OVER_TIME_DATA, index_col=0)
    recovered_df = pd.read_csv(_COVID_CASES_OVER_TIME_DATA, index_col=0)
    death_df = pd.read_csv(_COVID_CASES_OVER_TIME_DATA, index_col=0)

    countries = list(confirmed_df["Country/Region"])

    dates = list(confirmed_df.columns.values)[3:]
    # print(dates[0])

    # NOTE dates starts on 22nd Jan, 2020
    c_total_dict = {}
    r_total_dict = {}
    d_total_dict = {}
    c_incident_dict = {}
    r_incident_dict = {}
    d_incident_dict = {}
    for c in range(len(countries)):
        country = countries[c]
        total_confirmed = list(confirmed_df.iloc[c][3:])
        total_death = list(death_df.iloc[c][3:])
        total_recovered = list(recovered_df.iloc[c][3:])
        c_total_dict[country] = total_confirmed
        c_incident_dict[country] = get_incident_cases(total_confirmed)
        r_total_dict[country] = total_recovered
        r_incident_dict[country] = get_incident_cases(total_recovered)
        d_total_dict[country] = total_death
        d_incident_dict[country] = get_incident_cases(total_death)

    #   predicted_confirmed_cases_dict = {}
    #   predicted_recovered_cases_dict = {}
    #   predicted_death_cases_dict = {}
    #   predicted_incident_cases_dict = {}
    #   for c in range(len(countries)):
    #       country = countries[c]
    #       predicted_confirmed_cases_dict[country] = predict.Predict().predict(confirmed_cases_dict[country], dates)
    #       predicted_recovered_cases_dict[country] = predict.Predict().predict(recovered_cases_dict[country], dates)
    #       predicted_death_cases_dict[country] = predict.Predict().predict(death_cases_dict[country], dates)

    data_pickle_file = open(_DATA_PATH, "w")
    db = {}
    db["current_total_confirmed"] = c_total_dict
    db["current_total_recovered"] = r_total_dict
    db["current_total_deaths"] = d_total_dict
    db["current_incident_cases"] = c_incident_dict
    db["current_incident_deaths"] = d_incident_dict
    db["current_incident_recovered"] = r_incident_dict
    db["country_list"] = countries
    db["dates"] = dates

    #   db["predicted_confirmed"] = predicted_confirmed_cases_dict
    #  db["predicted_recovered"] = predicted_recovered_cases_dict
    #    db["predicted_deaths"] = predicted_death_cases_dict
    json.dump(db, data_pickle_file, cls=NpEncoder)

    data_pickle_file.close()

    return []


if __name__ == "__main__":
    fetch_data()
