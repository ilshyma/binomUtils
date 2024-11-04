import { readCSV } from './csv/csvReader';

// Function to parse named arguments
function parseArgs(args: string[]) {
  const parsed: { [key: string]: string } = {};
  args.forEach((arg) => {
    const [key, value] = arg.split("=");
    if (key && value) {
      parsed[key] = value.replace(/['"]/g, ""); // Remove quotes if any
    }
  });
  return parsed;
}

const args = parseArgs(process.argv.slice(2));
const filePath = args.path;
const campaignId = args.campaignid;

if (!filePath || !campaignId) {
  console.error("Usage: node app.js path='/path/to/file.csv' campaignid='345'");
  process.exit(1);
}

readCSV(filePath, campaignId).catch((error: { message: any; }) => {
  console.error("An error occurred:", error.message);
});


// node app.js yarn start path='/Users/vlad/Documents/AM2.0/stat/8797115_stats.csv' campaignid='345' 