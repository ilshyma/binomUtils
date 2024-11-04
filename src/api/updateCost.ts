import axios from 'axios';
import logger from '../logger';
import dotenv from 'dotenv';

dotenv.config();

export async function updateCost(campaignId: string, pubValue: string, cost: number) {
  const apiKey = process.env.API_KEY; // Get the API key from environment variables
  const url = `https://turbolit.biz/public/api/v1/clicks/campaign/${campaignId}`;

  // Check if the API key is defined
  if (!apiKey) {
    throw new Error("API_KEY is not defined in the environment variables.");
  }

  const payload = {
    datePreset: "last_3_days",
    dateFrom: "",
    dateTo: "",
    timezone: "UTC",
    tokenId: 1,
    tokenValue: pubValue,
    cost: cost,
    model: "COSTS",
    currency: "usd"
  };

  try {
    const response = await axios.put(url, payload, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    logger.info(`Successfully updated cost for campaign ${campaignId} with pubValue ${pubValue}: ${JSON.stringify(response.data)}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle Axios errors
      logger.error(`Failed to update cost for campaign ${campaignId} with pubValue ${pubValue}: ${error.message}`);
    } else {
      // Handle other errors (e.g., programming errors)
      logger.error(`An unexpected error occurred: ${error}`);
    }
    throw new Error(`Update failed for campaign ${campaignId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}