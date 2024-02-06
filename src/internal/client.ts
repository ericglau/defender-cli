import { DeployClient } from "@openzeppelin/defender-sdk-deploy-client";

export function getDeployClient(apiKey: string, apiSecret: string): DeployClient {
  return new DeployClient({ apiKey, apiSecret });
}