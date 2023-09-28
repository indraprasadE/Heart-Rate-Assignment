"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var moment = require("moment");
var calculateDailyStats = function (heartRateData) {
    var groupedByDate = {};
    heartRateData.forEach(function (entry) {
        var date = moment(entry.timestamps.startTime).format('YYYY-MM-DD');
        var bpm = entry.beatsPerMinute;
        if (!groupedByDate[date]) {
            groupedByDate[date] = [];
        }
        groupedByDate[date].push(bpm);
    });
    var dailyStats = [];
    for (var date in groupedByDate) {
        var bpmValues = groupedByDate[date];
        var min = Math.min.apply(Math, bpmValues);
        var max = Math.max.apply(Math, bpmValues);
        var median = calculateMedian(bpmValues);
        var latestDataTimestamp = moment().format('YYYY-MM-DDTHH:mm:ss'); // Assuming the latest data is the current time
        dailyStats.push({
            date: date,
            min: min,
            max: max,
            median: median,
            latestDataTimestamp: latestDataTimestamp,
        });
    }
    return dailyStats;
};
var calculateMedian = function (values) {
    var sortedValues = values.sort(function (a, b) { return a - b; });
    var mid = Math.floor(sortedValues.length / 2);
    return sortedValues.length % 2 === 0 ? (sortedValues[mid - 1] + sortedValues[mid]) / 2 : sortedValues[mid];
};
var readHeartRateData = function (filePath) {
    try {
        var data = fs.readFileSync(filePath, 'utf-8');
        var parsedData = JSON.parse(data);
        return parsedData;
    }
    catch (error) {
        console.error('Error reading heart rate data:', error);
        return [];
    }
};
var writeOutputToFile = function (output, outputPath) {
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log('Output written to', outputPath);
};
console.log('Reading heart rate data...');
var heartRateData = readHeartRateData('heartrate.json');
console.log('Heart rate data:', heartRateData);
var dailyStats = calculateDailyStats(heartRateData);
console.log('Calculating daily statistics...');
console.log('Daily statistics:', dailyStats);
console.log('Writing output to file...');
writeOutputToFile(dailyStats, 'output.json');
console.log('Process completed.');
