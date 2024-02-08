import minimist from 'minimist';
import { FunctionArgs, upgradeContract } from '../internal/upgrade-contract';
import { getDeployClient } from '../internal/client';
import { getAndValidateString, getNetwork } from '../internal/utils';
import { DeployClient } from '@openzeppelin/defender-sdk-deploy-client';

const USAGE = 'Usage: npx @openzeppelin/defender-deploy-client-cli proposeUpgrade --proxyAddress <PROXY_ADDRESS> --newImplementationAddress <NEW_IMPLEMENTATION_ADDRESS> --chainId <CHAIN_ID> [--proxyAdminAddress <PROXY_ADMIN_ADDRESS>] [--abiFile <CONTRACT_ARTIFACT_FILE_PATH>] [--approvalProcessId <UPGRADE_APPROVAL_PROCESS_ID>]';
const DETAILS = `
Proposes an upgrade using OpenZeppelin Defender.

Required options:
  --proxyAddress <PROXY_ADDRESS>  Address of the proxy to upgrade.
  --newImplementationAddress <NEW_IMPLEMENTATION_ADDRESS>  Address of the new implementation contract.
  --chainId <CHAIN_ID>            Chain ID of the network to use.

Additional options:
  --proxyAdminAddress <PROXY_ADMIN_ADDRESS>  Address of the proxy's admin. Required if the proxy is a transparent proxy.
  --abiFile <CONTRACT_ARTIFACT_FILE_PATH>  Path to a JSON file that contains an "abi" entry, where its value will be used as the new implementation ABI.
  --approvalProcessId <UPGRADE_APPROVAL_PROCESS_ID>  The ID of the upgrade approval process. Defaults to the upgrade approval process configured for your deployment environment on Defender.
`;

export async function proposeUpgrade(args: string[], deployClient?: DeployClient): Promise<void> {
  const { parsedArgs, extraArgs } = parseArgs(args);

  if (!help(parsedArgs, extraArgs)) {
    const functionArgs = getFunctionArgs(parsedArgs, extraArgs);
    const client = deployClient ?? getDeployClient();
    const upgradeResponse = await upgradeContract(functionArgs, client);

    console.log(`Upgrade proposal created.`);
    console.log(`Proposal ID: ${upgradeResponse.proposalId}`);
    if (upgradeResponse.externalUrl !== undefined) {
      console.log(`Proposal URL: ${upgradeResponse.externalUrl}`);
    }
  }
}

function parseArgs(args: string[]) {
  const parsedArgs = minimist(args, {
    boolean: [
      'help',
    ],
    string: ['proxyAddress', 'newImplementationAddress', 'chainId', 'proxyAdminAddress', 'abiFile', 'approvalProcessId'],
    alias: { h: 'help' },
  });
  const extraArgs = parsedArgs._;
  return { parsedArgs, extraArgs };
}

function help(parsedArgs: minimist.ParsedArgs, extraArgs: string[]): boolean {
  if (parsedArgs['help']) {
    console.log(USAGE);
    console.log(DETAILS);
    return true;
  } else {
    return false;
  }
}

/**
 * Gets and validates function arguments and options.
 * @returns Function arguments
 * @throws Error if any arguments or options are invalid.
 */
export function getFunctionArgs(parsedArgs: minimist.ParsedArgs, extraArgs: string[]): FunctionArgs {
  if (extraArgs.length !== 0) {
    throw new Error('The proposeUpgrade command does not take any arguments, only options.');
  } else {
    // Required options
    const proxyAddress = getAndValidateString(parsedArgs, 'proxyAddress', true)!;
    const newImplementationAddress = getAndValidateString(parsedArgs, 'newImplementationAddress', true)!;

    const networkString = getAndValidateString(parsedArgs, 'chainId', true)!;
    const network = getNetwork(parseInt(networkString));

    // Additional options
    const proxyAdminAddress = getAndValidateString(parsedArgs, 'proxyAdminAddress');
    const abiFile = getAndValidateString(parsedArgs, 'abiFile');
    const approvalProcessId = getAndValidateString(parsedArgs, 'approvalProcessId');

    checkInvalidArgs(parsedArgs);

    return { proxyAddress, newImplementationAddress, network, proxyAdminAddress, abiFile, approvalProcessId };
  }
}



function checkInvalidArgs(parsedArgs: minimist.ParsedArgs) {
  const invalidArgs = Object.keys(parsedArgs).filter(
    key =>
      ![
        'help',
        'h',
        '_',
        'proxyAddress',
        'newImplementationAddress',
        'chainId',
        'proxyAdminAddress',
        'abiFile',
        'approvalProcessId',
      ].includes(key),
  );
  if (invalidArgs.length > 0) {
    throw new Error(`Invalid options: ${invalidArgs.join(', ')}`);
  }
}
