import minimist from 'minimist';
import { getDeployClient } from '../internal/client';
import { USAGE_COMMAND_PREFIX, getAndValidateString, getNetwork } from '../internal/utils';
import { ApprovalProcessResponse, DeployClient } from '@openzeppelin/defender-sdk-deploy-client';
import { Network } from '@openzeppelin/defender-sdk-base-client';
import { NetworkClient } from '@openzeppelin/defender-sdk-network-client';

const USAGE_DEPLOY = `${USAGE_COMMAND_PREFIX} getDeployApprovalProcess --chainId <CHAIN_ID>`;
const DETAILS_DEPLOY = `
Gets the default deploy approval process configured for your deployment environment on OpenZeppelin Defender.

Required options:
  --chainId <CHAIN_ID>            Chain ID of the network to use.
`;

const USAGE_UPGRADE = `${USAGE_COMMAND_PREFIX} getUpgradeApprovalProcess --chainId <CHAIN_ID>`;
const DETAILS_UPGRADE = `
Gets the default upgrade approval process configured for your deployment environment on OpenZeppelin Defender.
For example, this is useful for determining the default multisig wallet that you can use in your scripts to assign as the owner of your proxy.

Required options:
  --chainId <CHAIN_ID>            Chain ID of the network to use.
`;

export type Command = 'getDeployApprovalProcess' | 'getUpgradeApprovalProcess';

export async function getApprovalProcess(command: Command, args: string[], deployClient?: DeployClient, networkClient?: NetworkClient): Promise<void> {
  const { parsedArgs, extraArgs } = parseArgs(args);

  if (!help(command, parsedArgs)) {
    const network = await getFunctionArgs(command, parsedArgs, extraArgs, networkClient);
    const client = deployClient ?? getDeployClient();

    let response: ApprovalProcessResponse;
    switch (command) {
      case 'getDeployApprovalProcess':
        response = await client.getDeployApprovalProcess(network)
        break;
      case 'getUpgradeApprovalProcess':
        response = await client.getUpgradeApprovalProcess(network);
        break;
      default:
        throw new Error(`Unknown command: ${command}`);
    }

    console.log(`Approval process ID: ${response.approvalProcessId}`);
    if (response.via !== undefined) {
      console.log(`Via: ${response.via}`);
    }
    if (response.viaType !== undefined) {
      console.log(`Via type: ${response.viaType}`);
    }
  }
}

function parseArgs(args: string[]) {
  const parsedArgs = minimist(args, {
    boolean: [
      'help',
    ],
    string: ['chainId'],
    alias: { h: 'help' },
  });
  const extraArgs = parsedArgs._;
  return { parsedArgs, extraArgs };
}

function help(command: Command, parsedArgs: minimist.ParsedArgs): boolean {
  if (!parsedArgs['help']) {
    return false;
  } else {
    switch (command) {
      case 'getDeployApprovalProcess':
        console.log(USAGE_DEPLOY);
        console.log(DETAILS_DEPLOY);
        break;
      case 'getUpgradeApprovalProcess':
        console.log(USAGE_UPGRADE);
        console.log(DETAILS_UPGRADE);
        break;
      default:
        throw new Error(`Unknown command: ${command}`);
    }
    return true;
  }
}

/**
 * Gets and validates function arguments and options.
 * @returns Function arguments
 * @throws Error if any arguments or options are invalid.
 */
export async function getFunctionArgs(command: Command, parsedArgs: minimist.ParsedArgs, extraArgs: string[], networkClient?: NetworkClient): Promise<string> {
  if (extraArgs.length !== 0) {
    throw new Error(`The ${command} command does not take any arguments, only options.`);
  } else {
    const networkString = getAndValidateString(parsedArgs, 'chainId', true)!;
    const network = await getNetwork(parseInt(networkString), networkClient);

    checkInvalidArgs(parsedArgs);

    return network;
  }
}

function checkInvalidArgs(parsedArgs: minimist.ParsedArgs) {
  const invalidArgs = Object.keys(parsedArgs).filter(
    key =>
      ![
        'help',
        'h',
        '_',
        'chainId',
      ].includes(key),
  );
  if (invalidArgs.length > 0) {
    throw new Error(`Invalid options: ${invalidArgs.join(', ')}`);
  }
}
