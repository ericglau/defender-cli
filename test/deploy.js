const test = require('ava');
const sinon = require('sinon');
const { promisify } = require('util');
const { exec } = require('child_process');
const { deploy } = require('../dist/commands/deploy');

const execAsync = promisify(exec);

const CLI = 'node dist/cli.js';

test('deploy help', async t => {
  const output = (await execAsync(`${CLI} deploy --help`)).stdout;
  t.snapshot(output);
});

test('deploy no args', async t => {
  const error = await t.throwsAsync(execAsync(`${CLI} deploy`));
  t.true(error.message.includes('Missing required option: --contractName'));
});

const TX_HASH = '0x1';
const DEPLOYMENT_ID = 'abc';
const ADDRESS = '0x2';
const FAKE_CHAIN_ID = '1';

test.beforeEach(t => {
  const deployContractStub = sinon.stub().returns({
    txHash: TX_HASH,
    deploymentId: DEPLOYMENT_ID,
    address: ADDRESS,
    status: 'completed'
  });
  const getDeployedContractStub = sinon.stub().returns({
    txHash: TX_HASH,
    deploymentId: DEPLOYMENT_ID,
    address: ADDRESS,
    status: 'completed'
  });
  t.context.deployContractStub = deployContractStub;

  t.context.fakeDeployClient = {
    deployContract: deployContractStub,
    getDeployedContract: getDeployedContractStub,
  };

  t.context.fakeNetworkClient = {
    listForkedNetworks: () => {
      return [];
    },
    listPrivateNetworks: () => {
      return [];
    },
  };
});

test.afterEach.always(t => {
  sinon.restore();
});

test('deploy required args', async t => {
  const args = ['--contractName', 'MyContract', '--contractPath', 'contracts/MyContract.sol', '--chainId', FAKE_CHAIN_ID, '--buildInfoFile', 'test/input/build-info.json'];

  await deploy(args, t.context.fakeDeployClient, t.context.fakeNetworkClient);

  t.is(t.context.deployContractStub.callCount, 1);

  sinon.assert.calledWithExactly(t.context.deployContractStub, {
    contractName: 'MyContract',
    contractPath: 'contracts/MyContract.sol',
    network: 'mainnet',
    artifactPayload: '{"foo":"bar"}',
    licenseType: undefined,
    constructorBytecode: undefined,
    verifySourceCode: true,
    relayerId: undefined,
    salt: undefined,
    createFactoryAddress: undefined,
    txOverrides: {
      gasLimit: undefined,
      gasPrice: undefined,
      maxFeePerGas: undefined,
      maxPriorityFeePerGas: undefined
    },
    metadata: undefined,
  });
});

test('deploy all args', async t => {
  const args = [
      '--contractName', 'MyContract',
      '--contractPath', 'contracts/MyContract.sol',
      '--chainId', FAKE_CHAIN_ID,
      '--buildInfoFile', 'test/input/build-info.json',
      '--constructorBytecode', '0x1234',
      '--licenseType', 'MIT',
      '--verifySourceCode', 'false',
      '--relayerId', 'my-relayer-id',
      '--salt', '0x4567',
      '--createFactoryAddress', '0x0000000000000000000000000000000000098765',
      '--gasLimit', '1000000',
      '--gasPrice', '1000000000', // 1 gwei
      '--maxFeePerGas', '2000000000', // 2 gwei
      '--maxPriorityFeePerGas', '500000000', // 0.5 gwei
      '--metadata', '{ "commitHash": "4ae3e0d", "tag": "v1.0.0", "anyOtherField": "anyValue" }',
    ];

  await deploy(args, t.context.fakeDeployClient, t.context.fakeNetworkClient);

  t.is(t.context.deployContractStub.callCount, 1);

  sinon.assert.calledWithExactly(t.context.deployContractStub, {
    contractName: 'MyContract',
    contractPath: 'contracts/MyContract.sol',
    network: 'mainnet',
    artifactPayload: '{"foo":"bar"}',
    licenseType: 'MIT',
    constructorBytecode: '0x1234',
    verifySourceCode: false,
    relayerId: 'my-relayer-id',
    salt: '0x4567',
    createFactoryAddress: '0x0000000000000000000000000000000000098765',
    txOverrides: {
      gasLimit: 1000000,
      gasPrice: '0x3b9aca00',
      maxFeePerGas: '0x77359400',
      maxPriorityFeePerGas: '0x1dcd6500',
    },
    metadata: {
      commitHash: '4ae3e0d',
      tag: 'v1.0.0',
      anyOtherField: 'anyValue',
    }
  });
});

test('deploy with invalid metadata JSON', async t => {
  const args = [
      '--contractName', 'MyContract',
      '--contractPath', 'contracts/MyContract.sol',
      '--chainId', FAKE_CHAIN_ID,
      '--buildInfoFile', 'test/input/build-info.json',
      '--metadata', 'v1.0.0', // not valid JSON
    ];

  const error = await t.throwsAsync(deploy(args, t.context.fakeDeployClient, t.context.fakeNetworkClient));
  t.true(error.message.includes('Failed to parse metadata option as JSON'), error.message);
});