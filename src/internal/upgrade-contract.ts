import { promises as fs } from 'fs';

import { Network } from '@openzeppelin/defender-sdk-base-client';
import { DeployClient, UpgradeContractRequest, UpgradeContractResponse } from '@openzeppelin/defender-sdk-deploy-client';

export interface FunctionArgs {
  proxyAddress: string;
  newImplementationAddress: string;
  network: Network;
  proxyAdminAddress?: string;
  contractArtifactFile?: string;
  approvalProcessId?: string;
}

export async function upgradeContract(args: FunctionArgs, client: DeployClient): Promise<UpgradeContractResponse> {
  let newImplementationABI: string | undefined;
  if (args.contractArtifactFile !== undefined) {
    const artifactObject = JSON.parse(await fs.readFile(args.contractArtifactFile, 'utf8'));
    newImplementationABI = JSON.stringify(artifactObject.abi);
  }

  const deploymentRequest: UpgradeContractRequest = {
    proxyAddress: args.proxyAddress,
    newImplementationAddress: args.newImplementationAddress,
    network: args.network,
    proxyAdminAddress: args.proxyAdminAddress,
    newImplementationABI: newImplementationABI,
    approvalProcessId: args.approvalProcessId,
  };

  return client.upgradeContract(deploymentRequest);
}