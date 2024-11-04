import fs from "fs";
import csv from "csv-parser";
import logger from "../logger";
import { updateCost } from "../api/updateCost";
import { HEADER_MAPPINGS } from "./fileHeaderMap";

export interface CampaignData {
  pub: string;
  cost: number;
}

export async function readCSV(filePath: string, campaignId: string) {
  const results: CampaignData[] = [];
  const failedUpdates: string[] = [];
  let hasRequiredColumns = false;
  const foundHeaders: string[] = [];
  const mappedHeaders: string[] = [];  
  let processedCount = 0;

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({ separator: "," }))
      .on("headers", (headers: string[]) => {
        foundHeaders.push(...headers);

        mappedHeaders.push(
          ...headers.map(header => HEADER_MAPPINGS[header] || header)
        );

        logger.info(`Original CSV headers: ${foundHeaders.join(", ")}`);
        logger.info(`Mapped headers (for API): ${mappedHeaders.join(", ")}`);

        if (["pub", "cost"].every(requiredField => mappedHeaders.includes(requiredField))) {
          hasRequiredColumns = true;
        } else {
          reject(
            new Error(
              `CSV file structure is incorrect. Missing required columns. Expected columns are: ${Object.keys(HEADER_MAPPINGS).join(", ")}; Found headers: ${foundHeaders.join(", ")}`
            )
          );
        }
      })
      .on("data", (data: any) => {
        const pub = data[HEADER_MAPPINGS["Zone ID"]] || data["Zone ID"];
        const cost = data[HEADER_MAPPINGS["Cost"]] || data["Cost"];
        
        if (pub && cost) {
          results.push({ pub, cost: parseFloat(cost) });
        }
      })
      .on("end", async () => {
        if (!hasRequiredColumns) return;

        logger.info(`Total rows found in CSV: ${results.length}`);

        const intervalId = setInterval(() => {
          logger.info(`Progress: ${processedCount} rows handled out of ${results.length}`);
        }, 10000);

        for (const { pub, cost } of results) {
          if (cost === 0) continue;
          
          try {
            await updateCost(campaignId, pub, cost);
            await new Promise(resolve => setTimeout(resolve, 250));
            processedCount++;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error occurred";
            logger.error(
              `Error updating cost for campaign ${campaignId} and pub ${pub}: ${errorMessage}`
            );
            failedUpdates.push(pub);
          }
        }

        clearInterval(intervalId); // Stop logging after processing completes

        if (failedUpdates.length > 0) {
          logger.warn(
            `Failed to update costs for pubs: ${failedUpdates.join(", ")}`
          );
        }
        resolve();
      })
      .on("error", (error) => {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        logger.error("Error reading CSV file:", errorMessage);
        reject(error);
      });
  });
}