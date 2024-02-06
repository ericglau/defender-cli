const test = require('ava');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const { promisify } = require('util');
const { exec } = require('child_process');

const execAsync = promisify(exec);

const CLI = 'node dist/cli.js';

test.afterEach(async () => {
  delete process.env.DEFENDER_KEY;
  delete process.env.DEFENDER_SECRET;
});

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

function setupFakeDefender(t) {
  const fakeDefenderClient = {
    deployContract: () => {
      return {
        txHash: TX_HASH,
        deploymentId: DEPLOYMENT_ID,
        address: ADDRESS,
        status: 'completed'
      };
    },
    getDeployedContract: () => {
      return {
        txHash: TX_HASH,
        deploymentId: DEPLOYMENT_ID,
        address: ADDRESS,
        status: 'completed'
      };
    }
  };
  t.context.spy = sinon.spy(fakeDefenderClient, 'deployContract');

  t.context.deploy = proxyquire('../dist/commands/deploy', {
    '../internal/client': {
      getDeployClient: () => fakeDefenderClient,
    }
  });

  process.env.DEFENDER_KEY = 'fake-key';
  process.env.DEFENDER_SECRET = 'fake-secret';
}

test('deploy required args', async t => {
  setupFakeDefender(t);

  const args = ['deploy', '--contractName', 'MyContract', '--contractPath', 'contracts/MyContract.sol', '--chainId', FAKE_CHAIN_ID, '--artifactFile', 'test/samples/build-info.json'];

  await t.context.deploy.deploy(args);

  t.is(t.context.spy.callCount, 1);

  sinon.assert.calledWithExactly(t.context.spy, {
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
  });
});

test('deploy all args', async t => {
  setupFakeDefender(t);

  const args = ['deploy', '--contractName', 'MyContract', '--contractPath', 'contracts/MyContract.sol', '--chainId', FAKE_CHAIN_ID, '--artifactFile', 'test/samples/build-info.json', '--constructorBytecode', '0x1234', '--licenseType', 'MIT', '--verifySourceCode', 'false', '--relayerId', 'my-relayer-id', '--salt', '0x4567', '--createFactoryAddress', '0x0000000000000000000000000000000000098765'];

  await t.context.deploy.deploy(args);

  t.is(t.context.spy.callCount, 1);

  sinon.assert.calledWithExactly(t.context.spy, {
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
  });
});