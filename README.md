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

## Usage

```
npx @openzeppelin/defender-deploy-client-cli deploy --contractName <CONTRACT_NAME> --contractPath <CONTRACT_PATH> --chainId <CHAIN_ID> --artifactFile <BUILD_INFO_FILE_PATH> [--constructorBytecode <CONSTRUCTOR_BYTECODE>] [--licenseType <LICENSE>] [--verifySourceCode <true|false>] [--relayerId <RELAYER_ID>] [--salt <SALT>] [--createFactoryAddress <CREATE_FACTORY_ADDRESS>]

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
```