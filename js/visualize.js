/*jslint browser: true*/
/*global $, jQuery*/

var deathColor = "#f4511e"
var caseColor = "#039be5"

var currentType;
var currentDuration;
var currentCountry;

const DATA_FOLDER = "https://raw.githubusercontent.com/ssannkkallpp/covidsimulator/master/data"

var current_chart = null;
var countries_list;

var daily_dates;
var daily_cases;
var daily_deaths;

var cumulative_dates;
var cumulative_cases;
var cumulative_deaths;

var predicted_dates;
var predicted_cases; 
var predicted_deaths;

const dataType = {
	CASES : "Cases",
	DEATHS : "Deaths",
	DAILY : "Daily",
	CUMULATIVE : "Cumulative",
    PREDICTED : "Predicted"
}

const durationArray = {
	CASES : 0,
    DEATHS : 1,
	DATE : 2
}

const typeArray = {
	DATA : 0,
	DATE : 1,
    COLOR : 2
}

$(document).ready(function() {
    increase_page_load_progress_bar(-100);
    populate_countries();
    increase_page_load_progress_bar(50);
    get_dates();
    increase_page_load_progress_bar(50);

    currentType = dataType.CASES;
    currentDuration = dataType.DAILY;
    currentCountry = countries_list[0];

    update_graph();
    
    $("#country-dropdown").on('change', function() {
        currentCountry = this.value;
        update_graph();
    });
});

function increase_page_load_progress_bar(increase_value) {
    new_value = document.getElementById("page-load-progress-bar").value + increase_value;
    if (new_value >= 100) {
        show_country_elements();
        document.getElementById("main-article").classList.remove("hide");
        document.getElementById("country-dropdown").classList.remove("hide");
        document.getElementById("page-load-progress-bar").classList.add("hide");
        new_value = 100;
    } else if (new_value <= 0) {
        new_value = 0;
        document.getElementById("main-article").classList.add("hide");
        document.getElementById("country-dropdown").classList.add("hide");
        document.getElementById("page-load-progress-bar").classList.remove("hide");
        hide_country_elements();
    } else {
        document.getElementById("main-article").classList.add("hide");
        document.getElementById("country-dropdown").classList.add("hide");
        document.getElementById("page-load-progress-bar").classList.remove("hide")
        hide_country_elements();
    }
    document.getElementById("page-load-progress-bar").value = new_value;
}

function increase_country_progress_bar(increase_value) {
    new_value = document.getElementById("country-progress-bar").value + increase_value;
    if (new_value >= 100) {
        show_country_elements();
        new_value = 100;
    } else if (new_value <= 0) {
        new_value = 0;
        hide_country_elements();
    } else {
        hide_country_elements();
    }
    document.getElementById("country-progress-bar").value = new_value;
}

function show_country_elements() {
    document.getElementById("large-numbers-grid").classList.remove("hide");
    document.getElementById("chart-grid").classList.remove("hide");
    document.getElementById("country-progress-bar").classList.add("hide");
}

function hide_country_elements() {
    document.getElementById("large-numbers-grid").classList.add("hide");
    document.getElementById("chart-grid").classList.add("hide");
    document.getElementById("country-progress-bar").classList.remove("hide");
}

function update_graph() {
    increase_country_progress_bar(-100);
    update_data();
    refresh_graph();
    number_highlights();
}

function number_highlights() {
    document.getElementById("cases-yesterday").textContent = + daily_cases[daily_cases.length - 1];
    document.getElementById("deaths-yesterday").textContent = + daily_deaths[daily_deaths.length - 1];
    document.getElementById("total-cases").textContent = + cumulative_cases[cumulative_cases.length - 1];
    document.getElementById("total-deaths").textContent = + cumulative_deaths[cumulative_deaths.length - 1];
    increase_country_progress_bar(10);
}

function get_dates() {
    $.ajax({
        async: false,
        type: 'GET',
        url: DATA_FOLDER + "/dates",
        success: function(dates_file) {
            daily_dates = get_string_array(dates_file);
            predicted_dates = daily_dates;
            cumulative_dates = daily_dates;
        }
   });
};

function populate_countries() {
    $.ajax({
        async: false,
        type: 'GET',
        url: DATA_FOLDER + "/countries",
        success: function(countries_file) {
            var countries_dropdown = document.getElementById("country-dropdown");
            countries_list = get_string_array(countries_file);
            
            for (var i = 0; i < countries_list.length; i++) {
                var country_option = document.createElement("option");
                country_option.text = countries_list[i];
                country_option.value = countries_list[i];
                countries_dropdown.appendChild(country_option);
            }
        }
   });
}

function update_data() {
    $.ajax({
        async: false,
        type: 'GET',
        url: DATA_FOLDER + "/" + currentCountry + "/incident_total",
        success: function(data) {
            daily_cases = get_int_array(data)
        }
   });

   increase_country_progress_bar(10);

   $.ajax({
       async: false,
        type: 'GET',
        url: DATA_FOLDER + "/" + currentCountry + "/cumulative_total",
        success: function(data) {
            cumulative_cases = get_int_array(data)
        }
    });

    increase_country_progress_bar(10);

    // TODO : Add predicted cases

    predicted_cases = daily_cases;

    increase_country_progress_bar(10);

    $.ajax({
        async: false,
        type: 'GET',
        url: DATA_FOLDER + "/" + currentCountry + "/incident_death",
        success: function(data) {
            daily_deaths = get_int_array(data)
        }
   });

   increase_country_progress_bar(10);

   $.ajax({
       async: false,
        type: 'GET',
        url: DATA_FOLDER + "/" + currentCountry + "/cumulative_death",
        success: function(data) {
            cumulative_deaths = get_int_array(data)
        }
    });

    increase_country_progress_bar(10);

    // TODO : Add predicted deaths

    predicted_deaths = daily_deaths;

    increase_country_progress_bar(10);
}

function get_string_array(data) {
    return data.split("\n").filter(function (element) {
        return element != "";
    });
}

function get_int_array(data) {
    return data.split("\n").filter(function (element) {
        if (element != "") {
            return Number(element).toPrecision();
        }
    });
}

function get_daily() {
    return [daily_cases, daily_deaths, daily_dates]
}

function get_cumulative() {
    return [cumulative_cases, cumulative_deaths, cumulative_dates]
}

function get_predicted() {
    return [predicted_cases, predicted_deaths, predicted_dates]
}

function get_data(type, duration) {
    var returnArray = null;
    if (duration == dataType.DAILY) {
        returnArray = get_daily();
    } else if (duration == dataType.CUMULATIVE) {
        var returnArray = get_cumulative();
    } else if (duration == dataType.PREDICTED) {
        var returnArray = get_predicted();
    }

    if (returnArray == null) {
        console.error("Cannot have null death data");
    }

    if (type == dataType.CASES) {
        return [returnArray[durationArray.CASES], returnArray[durationArray.DATE], caseColor]
    } else if (type == dataType.DEATHS) {
        return [returnArray[durationArray.DEATHS], returnArray[durationArray.DATE], deathColor]
    }
}

function highlight_duration_button(duration) {
    document.getElementById("daily_button").classList.add("outline");
    document.getElementById("cumulative_button").classList.add("outline");
    document.getElementById("predicted_button").classList.add("outline");

    if (duration == dataType.DAILY) {
        document.getElementById("daily_button").classList.remove("outline");
    } else if (duration == dataType.CUMULATIVE) {
        document.getElementById("cumulative_button").classList.remove("outline");
    } else if (duration == dataType.PREDICTED) {
        document.getElementById("predicted_button").classList.remove("outline");
    }
}

function highlight_type_button(type) {
    document.getElementById("cases_button").classList.add("outline");
    document.getElementById("deaths_button").classList.add("outline");

    if (type == dataType.CASES) {
        document.getElementById("cases_button").classList.remove("outline");
    } else if (type == dataType.DEATHS) {
        document.getElementById("deaths_button").classList.remove("outline");
    }
}

function refresh_graph() {
    var returnData = get_data(currentType, currentDuration)
    draw_graph(returnData[typeArray.DATA], returnData[typeArray.DATE], returnData[typeArray.COLOR], currentType);
    increase_country_progress_bar(10);
    highlight_type_button(currentType)
    increase_country_progress_bar(10);
    highlight_duration_button(currentDuration)
    increase_country_progress_bar(10);
}

function show_daily() {
    currentDuration = dataType.DAILY;
    refresh_graph();
}

function show_cumulative() {
    currentDuration = dataType.CUMULATIVE;
    refresh_graph();
}

function show_predicted() {
    currentDuration = dataType.PREDICTED;
    refresh_graph();
}

function show_cases() {
    currentType = dataType.CASES;
    refresh_graph();
}

function show_deaths() {
    currentType = dataType.DEATHS;
    refresh_graph();
}


function draw_graph(data, dates, lineColor, label) {
    Chart.defaults.global.defaultFontFamily = "Open Sans"
    Chart.defaults.global.defaultFontSize = 16
    var fontColorPrimary = getComputedStyle(document.body).getPropertyValue("color")
    if (current_chart != null) {
        current_chart.destroy();
    }
    current_chart = new Chart(document.getElementById("line-graph"), {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{ 
                data: data,
                label: label,
                fill: false,
                borderColor : lineColor,
                backgroundColor : lineColor,
                pointBackgroundColor : lineColor,
                pointBorderColor : lineColor,
                pointHoverBackgroundColor : lineColor,
                pointHoverBorderColor : lineColor,
                pointHoverRadius : 6
            }]
        },
        
        options: {
            title: {
                display: false
            },
            elements: {
                point:{
                    radius: 1
                }
            },
            tooltips: {
                mode: 'index'
            },
            scales: {
                xAxes: [{
                    ticks : {
                        fontColor : fontColorPrimary,
                        autoSkip: true,
                        maxTicksLimit: 10,
                        min: dates[0]
                    },
                    gridLines : {
                        display : false
                    },
                    type: 'time',
                    time: {
                        parser: 'MM/DD/YYYY',
                        unit: 'month',
                        tooltipFormat : "DD MMMM YY",
                        unitStepSize: 1,
                        displayFormats: {
                            'month': 'MMM \'YY'
                        }
                    }
                }],
                yAxes : [{
                    ticks : {
                        fontColor : fontColorPrimary
                    },
                    gridLines : {
                        display : false
                    }
                }]
            },
            maintainAspectRatio: false,
            legend : {
                display : false
            }
        }
    });
}