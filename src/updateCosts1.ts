// import fs from 'fs';
// import csv from 'csv-parser';
// import axios from 'axios';
// import winston from 'winston';

// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.simple(),
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({ filename: 'error.log', level: 'error' }),
//   ],
// });

// interface CampaignData {
//   campaign: string;
//   pub: string;
//   cost: number;
// }

// const failures: string[] = [];

// const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// async function updateCost(campaign: string, pub: string, cost: number) {
//   const url = `http://track_domain.com/?page=save_update_costs&camp_id=${campaign}&type=1&date=1&timezone=3&token_number=1&token_value=${cost}&[cpc/cost]=${cost}&api_key=123456789vf8fhj`;

//   try {
//     const response = await axios.get(url);
//     logger.info(`Updated cost for campaign ${campaign} and pub ${pub}: ${response.data}`);
//   } catch (error) {
//     logger.error(`Failed to update cost for campaign ${campaign} and pub ${pub}: ${error.message}`);
//     failures.push(`Campaign: ${campaign}, Pub: ${pub}, Error: ${error.message}`);
//   }
// }

// async function readCSV(filePath: string) {
//   const results: CampaignData[] = [];
//   let hasRequiredColumns = false;

//   fs.createReadStream(filePath)
//     .pipe(csv())
//     .on('headers', (headers: string[]) => {
//       if (headers.includes('campaign') && headers.includes('pub') && headers.includes('cost')) {
//         hasRequiredColumns = true;
//       } else {
//         throw new Error('CSV file structure is incorrect: Required columns are missing.');
//       }
//     })
//     .on('data', (data: any) => {
//       const { campaign, pub, cost } = data;
//       if (campaign && pub && cost) {
//         results.push({ campaign, pub, cost: parseFloat(cost) });
//       }
//     })
//     .on('end', async () => {
//       if (!hasRequiredColumns) return;

//       for (const { campaign, pub, cost } of results) {
//         await updateCost(campaign, pub, cost);
//         await delay(1000); // Delay for 1 second
//       }
//       if (failures.length > 0) {
//         logger.error('Failures:', failures);
//       }
//     })
//     .on('error', (error) => {
//       logger.error('Error reading CSV file:', error.message);
//       throw error; // Rethrow error for handling
//     });
// }

// // Start the process
// readCSV('path/to/your/file.csv');