# File works as intended but needs to be unit tested.

import pandas as pd
import numpy as np
import os
import json

# from pathlib import Path


# Timeframe for the data read is initiated from Jan 22, 2021 : 22/01/2020
_COVID_CASES_OVER_TIME_DATA = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"
_COVID_DEATHS_OVER_TIME_DATA = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv"
_COVID_RECOVERED_OVER_TIME_DATA = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv"


_DATA_PATH = "data"

_FTypes = [
    "cumulative_total",
    "cumulative_death",
    "cumulative_recovered",
    "incident_total",
    "incident_death",
    "incident_recovered",
]


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


def write_to_file(name, content):
    with open(_DATA_PATH + "/" + name, "w") as f:
        for stuff in content:
            f.write("%s\n" % stuff)


def fetch_data():

    if (
        _COVID_CASES_OVER_TIME_DATA
        or _COVID_DEATHS_OVER_TIME_DATA
        or _COVID_RECOVERED_OVER_TIME_DATA
    ) is None:
        raise AssertionError(
            "Data links to online csv files not correctly configured\n"
        )

    #   print("Loading data from online repo...\n")
    confirmed_df = pd.read_csv(_COVID_CASES_OVER_TIME_DATA)
    recovered_df = pd.read_csv(_COVID_RECOVERED_OVER_TIME_DATA)
    death_df = pd.read_csv(_COVID_DEATHS_OVER_TIME_DATA)

    countries = confirmed_df["Country/Region"].unique()

    confirmed_df = confirmed_df.drop(columns=["Province/State", "Lat", "Long"])
    confirmed_df = confirmed_df.groupby("Country/Region").agg("sum")

    recovered_df = recovered_df.drop(columns=["Province/State", "Lat", "Long"])
    recovered_df = recovered_df.groupby("Country/Region").agg("sum")

    death_df = death_df.drop(columns=["Province/State", "Lat", "Long"])
    death_df = death_df.groupby("Country/Region").agg("sum")

    #  print("Extracted data, now saving to dataset...\n")
    dates = list(confirmed_df.columns.values)

    if not os.path.isdir(_DATA_PATH):
        os.mkdir(_DATA_PATH)

    for c in countries:
        dir_string = _DATA_PATH + "/" + str(c)
        if not os.path.isdir(dir_string):
            os.mkdir(dir_string)

    num_countries = len(countries)
    for c in range(num_countries):
        country_name = confirmed_df.iloc[c].name
        data_table = []
        data_table.append(list(confirmed_df.iloc[c]))
        data_table.append(list(death_df.iloc[c]))
        data_table.append(list(recovered_df.iloc[c]))
        data_table.append(get_incident_cases(data_table[0]))
        data_table.append(get_incident_cases(data_table[1]))
        data_table.append(get_incident_cases(data_table[2]))

        for idx in range(len(_FTypes)):
            file = open(_DATA_PATH + "/" + country_name + "/" + _FTypes[idx], "w")
            np.savetxt(file, data_table[idx])
            file.close()

    write_to_file("dates", dates)
    write_to_file("countries", countries)
    #  print("Done loading and saving data set\n")
    return []


if __name__ == "__main__":
    fetch_data()
