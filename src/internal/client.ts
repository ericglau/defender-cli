import { DeployClient } from "@openzeppelin/defender-sdk-deploy-client";
import { NetworkClient } from "@openzeppelin/defender-sdk-network-client";

export function getNetworkClient(): NetworkClient {
  return new NetworkClient(getDefenderApiKey());
}

export function getDeployClient(): DeployClient {
  return new DeployClient(getDefenderApiKey());
}

function getDefenderApiKey() {
  require('dotenv').config();
  const apiKey = process.env.DEFENDER_KEY as string;
  const apiSecret = process.env.DEFENDER_SECRET as string;

  if (apiKey === undefined || apiSecret === undefined) {
    throw new Error('DEFENDER_KEY and DEFENDER_SECRET must be set in environment variables.');
  }

  return { apiKey, apiSecret };
}