import { DeployClient } from "@openzeppelin/defender-sdk-deploy-client";

export function getDeployClient(): DeployClient {
  require('dotenv').config();
  const apiKey = process.env.DEFENDER_KEY as string;
  const apiSecret = process.env.DEFENDER_SECRET as string;

  if (apiKey === undefined || apiSecret === undefined) {
    throw new Error('DEFENDER_KEY and DEFENDER_SECRET must be set in environment variables.');
  }

  return new DeployClient({ apiKey, apiSecret });
}