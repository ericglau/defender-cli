import minimist from 'minimist';
import { FunctionArgs, deployContract } from '../internal/deploy-contract';
import { getDeployClient } from '../internal/client';
import { USAGE_COMMAND_PREFIX, getAndValidateString, getNetwork } from '../internal/utils';
import { DeployClient } from '@openzeppelin/defender-sdk-deploy-client';

const USAGE = `${USAGE_COMMAND_PREFIX} deploy --contractName <CONTRACT_NAME> --contractPath <CONTRACT_PATH> --chainId <CHAIN_ID> --buildInfoFile <BUILD_INFO_FILE_PATH> [--constructorBytecode <CONSTRUCTOR_ARGS>] [--licenseType <LICENSE>] [--verifySourceCode <true|false>] [--relayerId <RELAYER_ID>] [--salt <SALT>] [--createFactoryAddress <CREATE_FACTORY_ADDRESS>]`;
const DETAILS = `
Deploys a contract using OpenZeppelin Defender.

Required options:
  --contractName <CONTRACT_NAME>  Name of the contract to deploy.
  --contractPath <CONTRACT_PATH>  Path to the contract file.
  --chainId <CHAIN_ID>            Chain ID of the network to deploy to.
  --buildInfoFile <BUILD_INFO_FILE_PATH>  Path to the build info file containing Solidity compiler input and output for the contract.

Additional options:
  --constructorBytecode <CONSTRUCTOR_BYTECODE>  0x-prefixed ABI encoded byte string representing the constructor arguments. Required if the constructor has arguments.
  --licenseType <LICENSE>         License type for the contract. Recommended if verifying source code. Defaults to "None".
  --verifySourceCode <true|false>  Whether to verify source code on block explorers. Defaults to true.
  --relayerId <RELAYER_ID>        Relayer ID to use for deployment. Defaults to the relayer configured for your deployment environment on Defender.
  --salt <SALT>                   Salt to use for CREATE2 deployment. Defaults to a random salt.
  --createFactoryAddress <CREATE_FACTORY_ADDRESS>  Address of the CREATE2 factory to use for deployment. Defaults to the factory provided by Defender.
`;

export async function deploy(args: string[], deployClient?: DeployClient): Promise<void> {
  const { parsedArgs, extraArgs } = parseArgs(args);

  if (!help(parsedArgs)) {
    const functionArgs = getFunctionArgs(parsedArgs, extraArgs);
    const client = deployClient ?? getDeployClient();
    const address = await deployContract(functionArgs, client);

    console.log(`Deployed to address: ${address}`);
  }
}

function parseArgs(args: string[]) {
  const parsedArgs = minimist(args, {
    boolean: [
      'help',
      'verifySourceCode',
    ],
    string: ['contractName', 'contractPath', 'chainId', 'buildInfoFile', 'licenseType', 'constructorBytecode', 'relayerId', 'salt', 'createFactoryAddress'],
    alias: { h: 'help' },
    default: { verifySourceCode: true },
  });
  const extraArgs = parsedArgs._;
  return { parsedArgs, extraArgs };
}

function help(parsedArgs: minimist.ParsedArgs): boolean {
  if (!parsedArgs['help']) {
    return false;
  } else {
    console.log(USAGE);
    console.log(DETAILS);
    return true;
  }
}

/**
 * Gets and validates function arguments and options.
 * @returns Function arguments
 * @throws Error if any arguments or options are invalid.
 */
function getFunctionArgs(parsedArgs: minimist.ParsedArgs, extraArgs: string[]): FunctionArgs {
  if (extraArgs.length !== 0) {
    throw new Error('The deploy command does not take any arguments, only options.');
  } else {
    // Required options
    const contractName = getAndValidateString(parsedArgs, 'contractName', true)!;
    const contractPath = getAndValidateString(parsedArgs, 'contractPath', true)!;

    const networkString = getAndValidateString(parsedArgs, 'chainId', true)!;
    const network = getNetwork(parseInt(networkString));

    const buildInfoFile = getAndValidateString(parsedArgs, 'buildInfoFile', true)!;

    // Additional options
    const licenseType = getAndValidateString(parsedArgs, 'licenseType');
    const constructorBytecode = parsedArgs['constructorBytecode'];
    const verifySourceCode = parsedArgs['verifySourceCode'];
    const relayerId = getAndValidateString(parsedArgs, 'relayerId');
    const salt = getAndValidateString(parsedArgs, 'salt');
    const createFactoryAddress = getAndValidateString(parsedArgs, 'createFactoryAddress');

    checkInvalidArgs(parsedArgs);

    return { contractName, contractPath, network, buildInfoFile, licenseType, constructorBytecode, verifySourceCode, relayerId, salt, createFactoryAddress };
  }
}

function checkInvalidArgs(parsedArgs: minimist.ParsedArgs) {
  const invalidArgs = Object.keys(parsedArgs).filter(
    key =>
      ![
        'help',
        'h',
        '_',
        'contractName',
        'contractPath',
        'chainId',
        'buildInfoFile',
        'licenseType',
        'constructorBytecode',
        'verifySourceCode',
        'relayerId',
        'salt',
        'createFactoryAddress',
      ].includes(key),
  );
  if (invalidArgs.length > 0) {
    throw new Error(`Invalid options: ${invalidArgs.join(', ')}`);
  }
}
