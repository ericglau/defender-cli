import minimist from "minimist";
import { fromChainId } from "@openzeppelin/defender-sdk-base-client";
import { getNetworkClient } from "./client";
import { NetworkClient } from "@openzeppelin/defender-sdk-network-client";
import { ErrorWithDetails } from "./error";

export function getAndValidateString(parsedArgs: minimist.ParsedArgs, option: string, required = false): string | undefined {
  const value = parsedArgs[option];
  if (value !== undefined && value.trim().length === 0) {
    throw new Error(`Invalid option: --${option} cannot be empty`);
  } else if (required && value === undefined) {
    throw new Error(`Missing required option: --${option}`);
  }
  return value;
}

/**
 * Gets the network name for the given chainId.
 *
 * @param chainId Chain ID
 * @param networkClient Overrides the default network client. For testing only.
 * @param requireNetwork Overrides the DEFENDER_NETWORK environment variable. For testing only.
 * @returns Network name
 */
export async function getNetwork(chainId: number, networkClient?: NetworkClient, requireNetwork?: string): Promise<string> {
  const networkNames = await getNetworkNames(chainId, networkClient);

  require('dotenv').config();
  const userConfigNetwork = requireNetwork ?? process.env.DEFENDER_NETWORK as string;

  if (networkNames.length === 0) {
    throw new ErrorWithDetails(
      `The current network with chainId ${chainId} is not supported by OpenZeppelin Defender`,
      () => `If this is a private or forked network, add it in Defender from the Manage tab.`,
    );
  } else if (networkNames.length === 1) {
    const network = networkNames[0];
    if (userConfigNetwork !== undefined && network !== userConfigNetwork) {
      throw new ErrorWithDetails(
        `Detected network ${network} does not match specified network: ${userConfigNetwork}`,
        () =>
          `The current chainId ${chainId} is detected as ${network} on OpenZeppelin Defender, but the DEFENDER_NETWORK environment variable specifies network: ${userConfigNetwork}.\nEnsure you are connected to the correct network.`,
      );
    }
    return network;
  } else {
    if (userConfigNetwork === undefined) {
      throw new ErrorWithDetails(
        `Detected multiple networks with the same chainId ${chainId} on OpenZeppelin Defender: ${Array.from(networkNames).join(', ')}`,
        () =>
          `Specify the network that you want to use in the DEFENDER_NETWORK environment variable.`,
      );
    } else if (!networkNames.includes(userConfigNetwork)) {
      throw new ErrorWithDetails(
        `Specified network ${userConfigNetwork} does not match any of the detected networks for chainId ${chainId}: ${Array.from(networkNames).join(', ')}`,
        () =>
          `Ensure you are connected to the correct network, or specify one of the detected networks in the DEFENDER_NETWORK environment variable.`,
      );
    }
    return userConfigNetwork;
  }
}

async function getNetworkNames(chainId: number, networkClient?: NetworkClient) {
  const matchingNetworks = [];

  const knownNetwork = fromChainId(chainId);
  if (knownNetwork !== undefined) {
    matchingNetworks.push(knownNetwork);
  }

  const client = networkClient ?? getNetworkClient();

  const forkedNetworks = await client.listForkedNetworks();
  for (const network of forkedNetworks) {
    if (network.chainId === chainId) {
      matchingNetworks.push(network.name);
    }
  }

  const privateNetworks = await client.listPrivateNetworks();
  for (const network of privateNetworks) {
    if (network.chainId === chainId) {
      matchingNetworks.push(network.name);
    }
  }

  return matchingNetworks;
}

export const USAGE_COMMAND_PREFIX = 'Usage: npx @openzeppelin/defender-deploy-client-cli';