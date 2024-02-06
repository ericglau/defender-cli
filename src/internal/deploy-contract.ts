import { promises as fs } from 'fs';

import { Network } from '@openzeppelin/defender-sdk-base-client';
import { DeployClient, DeployContractRequest, DeploymentResponse, SourceCodeLicense } from '@openzeppelin/defender-sdk-deploy-client';

export interface FunctionArgs {
  contractName: string;
  contractPath: string;
  network: Network;
  artifactFile: string;
  licenseType?: string;
  constructorBytecode?: string;
  verifySourceCode: boolean;
  relayerId?: string;
  salt?: string;
  createFactoryAddress?: string;
}

export async function deployContract(args: FunctionArgs, client: DeployClient) {
  const buildInfoFileContents = await fs.readFile(args.artifactFile, 'utf8');

  const deploymentRequest: DeployContractRequest = {
    contractName: args.contractName,
    contractPath: args.contractPath,
    network: args.network,
    artifactPayload: buildInfoFileContents,
    licenseType: args.licenseType as SourceCodeLicense | undefined, // cast without validation but catch error from API below
    constructorBytecode: args.constructorBytecode,
    verifySourceCode: args.verifySourceCode,
    relayerId: args.relayerId,
    salt: args.salt,
    createFactoryAddress: args.createFactoryAddress,
  };

  let deployment: DeploymentResponse;
  try {
    deployment = await client.deployContract(deploymentRequest);
  } catch (e: any) {
    if (e.response?.data?.message?.includes('licenseType should be equal to one of the allowed values')) {
      throw new Error(
        `License type ${args.licenseType} is not a valid SPDX license identifier for block explorer verification. Specify a valid license type.`,
      );
    } else {
      throw e;
    }
  }

  while (deployment.status !== 'completed' && deployment.status !== 'failed') {
    console.log(`Waiting for deployment id ${deployment.deploymentId} to complete...`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    const deploymentId = deployment.deploymentId;
    deployment = await client.getDeployedContract(deploymentId);
  }

  switch (deployment.status) {
    case 'completed':
      console.log(`Deployment ${deployment.deploymentId} completed.`);
      break;
    case 'failed':
      throw new Error(`Deployment ${deployment.deploymentId} failed.`);
    default:
      throw new Error(`Deployment ${deployment.deploymentId} has unknown status ${deployment.status}.`);
  }

  if (deployment.address === undefined) {
    throw new Error(`Deployment ${deployment.deploymentId} completed but has no address.`);
  }

  return deployment.address;
}