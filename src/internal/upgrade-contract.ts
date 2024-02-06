import { Network } from '@openzeppelin/defender-sdk-base-client';
import { DeployClient, UpgradeContractRequest } from '@openzeppelin/defender-sdk-deploy-client';

export interface FunctionArgs {
  proxyAddress: string;
  newImplementationAddress: string;
  network: Network;
  proxyAdminAddress?: string;
  newImplementationABI?: string;
  approvalProcessId?: string;
}

export async function upgradeContract(args: FunctionArgs, client: DeployClient) {
  const deploymentRequest: UpgradeContractRequest = {
    proxyAddress: args.proxyAddress,
    newImplementationAddress: args.newImplementationAddress,
    network: args.network,
    proxyAdminAddress: args.proxyAdminAddress,
    newImplementationABI: args.newImplementationABI,
    approvalProcessId: args.approvalProcessId,
  };

  return await client.upgradeContract(deploymentRequest);
}