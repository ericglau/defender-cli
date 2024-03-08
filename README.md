# @openzeppelin/defender-deploy-client-cli

[![NPM Package](https://img.shields.io/npm/v/@openzeppelin/defender-deploy-client-cli?color=%234e5de4&label=npm)](https://www.npmjs.com/package/@openzeppelin/defender-deploy-client-cli)

CLI for deployments using OpenZeppelin Defender SDK.

> **Warning**
> This repository contains experimental code. It is available as a technology preview and its functionality is incomplete and subject to change. Breaking changes may be introduced at any point while it is in preview.

## Prerequisites

1. Install [Node.js](https://nodejs.org/)
2. Set the following environment variables using your Team API key and secret from OpenZeppelin Defender:
```
DEFENDER_KEY=<Your API key>
DEFENDER_SECRET<Your API secret>
```

## Network Selection

The network that is used with OpenZeppelin Defender is determined by the `chainId` parameter in the below commands.
If you want to ensure that a specific network is used with Defender, set the `DEFENDER_NETWORK` environment variable, for example:
```
DEFENDER_NETWORK=my-mainnet-fork
```
If set, this must be the name of a public, private or forked network in Defender. If the `chainId` parameter corresponds to a different network while this is set, the deployment will not occur and will throw an error instead.

> **Note**
> This is required if you have multiple forked networks in Defender with the same chainId, in which case the one with name matching the `DEFENDER_NETWORK` environment variable will be used.


## Usage

```
npx @openzeppelin/defender-deploy-client-cli <COMMAND> <OPTIONS>

Performs actions using OpenZeppelin Defender.

Available commands:
  deploy  Deploys a contract.
  proposeUpgrade  Proposes an upgrade.
  getDeployApprovalProcess  Gets the deploy approval process configured for a network.
  getUpgradeApprovalProcess  Gets the upgrade approval process configured for a network.

Run 'npx @openzeppelin/defender-deploy-client-cli <COMMAND> --help' for more information on a command.
```

### Deploying a contract
```
npx @openzeppelin/defender-deploy-client-cli deploy --contractName <CONTRACT_NAME> --contractPath <CONTRACT_PATH> --chainId <CHAIN_ID> --buildInfoFile <BUILD_INFO_FILE_PATH> [--constructorBytecode <CONSTRUCTOR_ARGS>] [--licenseType <LICENSE>] [--verifySourceCode <true|false>] [--relayerId <RELAYER_ID>] [--salt <SALT>] [--createFactoryAddress <CREATE_FACTORY_ADDRESS>]

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
```

### Proposing an upgrade
```
npx @openzeppelin/defender-deploy-client-cli proposeUpgrade --proxyAddress <PROXY_ADDRESS> --newImplementationAddress <NEW_IMPLEMENTATION_ADDRESS> --chainId <CHAIN_ID> [--proxyAdminAddress <PROXY_ADMIN_ADDRESS>] [--contractArtifactFile <CONTRACT_ARTIFACT_FILE_PATH>] [--approvalProcessId <UPGRADE_APPROVAL_PROCESS_ID>]

Proposes an upgrade using OpenZeppelin Defender.

Required options:
  --proxyAddress <PROXY_ADDRESS>  Address of the proxy to upgrade.
  --newImplementationAddress <NEW_IMPLEMENTATION_ADDRESS>  Address of the new implementation contract.
  --chainId <CHAIN_ID>            Chain ID of the network to use.

Additional options:
  --proxyAdminAddress <PROXY_ADMIN_ADDRESS>  Address of the proxy's admin. Required if the proxy is a transparent proxy.
  --contractArtifactFile <CONTRACT_ARTIFACT_FILE_PATH>  Path to a JSON file that contains an "abi" entry, where its value will be used as the new implementation ABI.
  --approvalProcessId <UPGRADE_APPROVAL_PROCESS_ID>  The ID of the upgrade approval process. Defaults to the upgrade approval process configured for your deployment environment on Defender.
```