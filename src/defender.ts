import minimist from 'minimist';
import { FunctionArgs, deployContract } from './deployContract';
import { Network, fromChainId } from '@openzeppelin/defender-sdk-base-client';

const USAGE = 'Usage: npx @openzeppelin/defender-deploy-client-cli deploy --contractName <CONTRACT_NAME> --contractPath <CONTRACT_PATH> --chainId <CHAIN_ID> --artifactFile <BUILD_INFO_FILE_PATH> [--constructorBytecode <CONSTRUCTOR_ARGS>] [--licenseType <LICENSE>] [--verifySourceCode <true|false>] [--relayerId <RELAYER_ID>] [--salt <SALT>] [--createFactoryAddress <CREATE_FACTORY_ADDRESS>]';
const DETAILS = `
Deploys a contract using OpenZeppelin Defender.

Required options:
  --contractName <CONTRACT_NAME>  Name of the contract to deploy.
  --contractPath <CONTRACT_PATH>  Path to the contract file.
  --chainId <CHAIN_ID>            Chain ID of the network to deploy to.
  --artifactFile <BUILD_INFO_FILE_PATH>  Path to the build info file containing Solidity compiler input and output for the contract.

Additional options:
  --constructorBytecode <CONSTRUCTOR_BYTECODE>  0x-prefixed ABI encoded byte string representing the constructor arguments. Required if the constructor has arguments.
  --licenseType <LICENSE>         License type for the contract. Recommended if verifying source code. Defaults to "None".
  --verifySourceCode <true|false>  Whether to verify source code on block explorers. Defaults to true.
  --relayerId <RELAYER_ID>        Relayer ID to use for deployment. Defaults to the relayer configured for your deployment environment on Defender.
  --salt <SALT>                   Salt to use for CREATE2 deployment. Defaults to a random salt.
  --createFactoryAddress <CREATE_FACTORY_ADDRESS>  Address of the CREATE2 factory to use for deployment. Defaults to the factory provided by Defender.
`;

export async function main(args: string[]): Promise<void> {
  const { parsedArgs, extraArgs } = parseArgs(args);

  if (!help(parsedArgs, extraArgs)) {
    const functionArgs = getFunctionArgs(parsedArgs, extraArgs);

    const address = await deployContract(functionArgs);
    console.log(`Deployed to address: ${address}`);
  }
}

function parseArgs(args: string[]) {
  const parsedArgs = minimist(args, {
    boolean: [
      'help',
      'verifySourceCode',
    ],
    string: ['contractName', 'contractPath', 'chainId', 'artifactFile', 'licenseType', 'constructorBytecode', 'relayerId', 'salt', 'createFactoryAddress'],
    alias: { h: 'help' },
    default: { verifySourceCode: true },
  });
  const extraArgs = parsedArgs._;
  return { parsedArgs, extraArgs };
}

function help(parsedArgs: minimist.ParsedArgs, extraArgs: string[]): boolean {
  if (extraArgs.length === 0 || parsedArgs['help']) {
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
  if (extraArgs.length === 0) {
    throw new Error('Missing command. Supported commands are: validate');
  } else if (extraArgs[0] !== 'deploy') {
    throw new Error(`Invalid command: ${extraArgs[0]}. Supported commands are: deploy`);
  } else if (extraArgs.length > 1) {
    throw new Error('The deploy command does not take any arguments, only options.');
  } else {
    // Required options
    const contractName = getAndValidateString(parsedArgs, 'contractName', true)!;
    const contractPath = getAndValidateString(parsedArgs, 'contractPath', true)!;

    const networkString = getAndValidateString(parsedArgs, 'chainId', true)!;
    const network = getNetwork(parseInt(networkString));

    const artifactFile = getAndValidateString(parsedArgs, 'artifactFile', true)!;

    // Additional options
    const licenseType = getAndValidateString(parsedArgs, 'licenseType');
    const constructorBytecode = parsedArgs['constructorBytecode'];
    const verifySourceCode = parsedArgs['verifySourceCode'];
    const relayerId = getAndValidateString(parsedArgs, 'relayerId');
    const salt = getAndValidateString(parsedArgs, 'salt');
    const createFactoryAddress = getAndValidateString(parsedArgs, 'createFactoryAddress');

    checkInvalidArgs(parsedArgs);

    return { contractName, contractPath, network, artifactFile, licenseType, constructorBytecode, verifySourceCode, relayerId, salt, createFactoryAddress };
  }
}

function getAndValidateString(parsedArgs: minimist.ParsedArgs, option: string, required = false): string | undefined {
  const value = parsedArgs[option];
  if (value !== undefined && value.trim().length === 0) {
    throw new Error(`Invalid option: --${option} cannot be empty`);
  } else if (required && value === undefined) {
    throw new Error(`Missing required option: --${option}`);
  }
  return value;
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
        'artifactFile',
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

function getNetwork(chainId: number): Network {
  const network = fromChainId(chainId);
  if (network === undefined) {
    throw new Error(`Network ${chainId} is not supported by OpenZeppelin Defender`);
  }
  return network;
}