import minimist from 'minimist';
import { FunctionArgs, deployContract } from '../internal/deploy-contract';
import { getDeployClient } from '../internal/client';
import { USAGE_COMMAND_PREFIX, getAndValidateString, getNetwork } from '../internal/utils';
import { DeployClient, TxOverrides } from '@openzeppelin/defender-sdk-deploy-client';
import { NetworkClient } from '@openzeppelin/defender-sdk-network-client';

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
  --licenseType "<LICENSE>"         License type to display on block explorers for verified source code. See https://etherscan.io/contract-license-types for supported values and use the string found in brackets, e.g. "MIT"
  --verifySourceCode <true|false>  Whether to verify source code on block explorers. Defaults to true.
  --relayerId <RELAYER_ID>        Relayer ID to use for deployment. Defaults to the relayer configured for your deployment environment on Defender.
  --salt <SALT>                   Salt to use for CREATE2 deployment. Defaults to a random salt.
  --createFactoryAddress <CREATE_FACTORY_ADDRESS>  Address of the CREATE2 factory to use for deployment. Defaults to the factory provided by Defender.
  --gasLimit <GAS_LIMIT>           Maximum amount of gas to allow the deployment transaction to use.
  --gasPrice <GAS_PRICE>           Gas price for legacy transactions, in wei.
  --maxFeePerGas <MAX_FEE_PER_GAS>  Maximum total fee per gas, in wei.
  --maxPriorityFeePerGas <MAX_PRIORITY_FEE_PER_GAS>  Maximum priority fee per gas, in wei.
`;

export async function deploy(args: string[], deployClient?: DeployClient, networkClient?: NetworkClient): Promise<void> {
  const { parsedArgs, extraArgs } = parseArgs(args);

  if (!help(parsedArgs)) {
    const functionArgs = await getFunctionArgs(parsedArgs, extraArgs, networkClient);
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
    string: ['contractName', 'contractPath', 'chainId', 'buildInfoFile', 'licenseType', 'constructorBytecode', 'relayerId', 'salt', 'createFactoryAddress', 'gasLimit', 'gasPrice', 'maxFeePerGas', 'maxPriorityFeePerGas'],

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
async function getFunctionArgs(parsedArgs: minimist.ParsedArgs, extraArgs: string[], networkClient?: NetworkClient): Promise<FunctionArgs> {
  if (extraArgs.length !== 0) {
    throw new Error('The deploy command does not take any arguments, only options.');
  } else {
    // Required options
    const contractName = getAndValidateString(parsedArgs, 'contractName', true)!;
    const contractPath = getAndValidateString(parsedArgs, 'contractPath', true)!;

    const networkString = getAndValidateString(parsedArgs, 'chainId', true)!;
    const network = await getNetwork(parseInt(networkString), networkClient);

    const buildInfoFile = getAndValidateString(parsedArgs, 'buildInfoFile', true)!;

    // Additional options
    const licenseType = getAndValidateString(parsedArgs, 'licenseType');
    const constructorBytecode = parsedArgs['constructorBytecode'];
    const verifySourceCode = parsedArgs['verifySourceCode'];
    const relayerId = getAndValidateString(parsedArgs, 'relayerId');
    const salt = getAndValidateString(parsedArgs, 'salt');
    const createFactoryAddress = getAndValidateString(parsedArgs, 'createFactoryAddress');

    const txOverrides: TxOverrides = {
      gasLimit: parseNumberOrUndefined(getAndValidateString(parsedArgs, 'gasLimit')),
      gasPrice: parseHexOrUndefined(getAndValidateString(parsedArgs, 'gasPrice')),
      maxFeePerGas: parseHexOrUndefined(getAndValidateString(parsedArgs, 'maxFeePerGas')),
      maxPriorityFeePerGas: parseHexOrUndefined(getAndValidateString(parsedArgs, 'maxPriorityFeePerGas')),
    };

    checkInvalidArgs(parsedArgs);

    return { contractName, contractPath, network, buildInfoFile, licenseType, constructorBytecode, verifySourceCode, relayerId, salt, createFactoryAddress, txOverrides };
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
        'gasLimit',
        'gasPrice',
        'maxFeePerGas',
        'maxPriorityFeePerGas',
      ].includes(key),
  );
  if (invalidArgs.length > 0) {
    throw new Error(`Invalid options: ${invalidArgs.join(', ')}`);
  }
}

function parseHexOrUndefined(value?: string): string | undefined {
  if (value !== undefined) {
    // If not a hex string, convert from decimal to hex as a string
    if (!value.startsWith('0x')) {
      return '0x' + Number(value).toString(16);
    } else {
      return value;
    }
   } else {
    return undefined;
  }
}

function parseNumberOrUndefined(value?: string): number | undefined {
  if (value !== undefined) {
    return Number(value);
  } else {
    return undefined;
  }
}