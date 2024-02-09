import minimist from "minimist";
import { Network, fromChainId } from "@openzeppelin/defender-sdk-base-client";

export function getAndValidateString(parsedArgs: minimist.ParsedArgs, option: string, required = false): string | undefined {
  const value = parsedArgs[option];
  if (value !== undefined && value.trim().length === 0) {
    throw new Error(`Invalid option: --${option} cannot be empty`);
  } else if (required && value === undefined) {
    throw new Error(`Missing required option: --${option}`);
  }
  return value;
}

export function getNetwork(chainId: number): Network {
  const network = fromChainId(chainId);
  if (network === undefined) {
    throw new Error(`Network ${chainId} is not supported by OpenZeppelin Defender`);
  }
  return network;
}

export const USAGE_COMMAND_PREFIX = 'Usage: npx @openzeppelin/defender-deploy-client-cli';