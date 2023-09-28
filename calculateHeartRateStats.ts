import * as fs from 'fs';
import * as moment from 'moment';

interface HeartRateData {
  beatsPerMinute: number;
  timestamps: {
    startTime: string;
    endTime: string;
  };
}

interface DailyHeartRateStats {
  date: string;
  min: number;
  max: number;
  median: number;
  latestDataTimestamp: string;
}

const calculateDailyStats = (heartRateData: HeartRateData[]): DailyHeartRateStats[] => {
  const groupedByDate: { [key: string]: number[] } = {};

  heartRateData.forEach((entry) => {
    const date = moment(entry.timestamps.startTime).format('YYYY-MM-DD');
    const bpm = entry.beatsPerMinute;
    
    if (!groupedByDate[date]) {
      groupedByDate[date] = [];
    }
    
    groupedByDate[date].push(bpm);
  });

  const dailyStats: DailyHeartRateStats[] = [];

  for (const date in groupedByDate) {
    const bpmValues = groupedByDate[date];
    const min = Math.min(...bpmValues);
    const max = Math.max(...bpmValues);
    const median = calculateMedian(bpmValues);
    const latestDataTimestamp = moment().format('YYYY-MM-DDTHH:mm:ss'); // Assuming the latest data is the current time

    dailyStats.push({
      date,
      min,
      max,
      median,
      latestDataTimestamp,
    });
  }

  return dailyStats;
};

const calculateMedian = (values: number[]): number => {
  const sortedValues = values.sort((a, b) => a - b);
  const mid = Math.floor(sortedValues.length / 2);
  return sortedValues.length % 2 === 0 ? (sortedValues[mid - 1] + sortedValues[mid]) / 2 : sortedValues[mid];
};

const readHeartRateData = (filePath: string): HeartRateData[] => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const parsedData = JSON.parse(data) as HeartRateData[];
    return parsedData;
  } catch (error) {
    console.error('Error reading heart rate data:', error);
    return [];
  }
};

const writeOutputToFile = (output: DailyHeartRateStats[], outputPath: string): void => {
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log('Output written to', outputPath);
};

console.log('Reading heart rate data...');
const heartRateData = readHeartRateData('heartrate.json');
console.log('Heart rate data:', heartRateData);

const dailyStats = calculateDailyStats(heartRateData);

console.log('Calculating daily statistics...');
console.log('Daily statistics:', dailyStats);

console.log('Writing output to file...');
writeOutputToFile(dailyStats, 'output.json');
console.log('Process completed.');
