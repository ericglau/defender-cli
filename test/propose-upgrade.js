const test = require('ava');
const sinon = require('sinon');
const { promisify } = require('util');
const { exec } = require('child_process');
const { proposeUpgrade } = require('../dist/commands/propose-upgrade');

const execAsync = promisify(exec);

const CLI = 'node dist/cli.js';

test('deploy help', async t => {
  const output = (await execAsync(`${CLI} proposeUpgrade --help`)).stdout;
  t.snapshot(output);
});

test('deploy no args', async t => {
  const error = await t.throwsAsync(execAsync(`${CLI} proposeUpgrade`));
  t.true(error.message.includes('Missing required option: --proxyAddress'));
});

const PROXY_ADDRESS = '0x123';
const NEW_IMPLEMENTATION_ADDRESS = '0x456';
const FAKE_CHAIN_ID = '1';

const PROXY_ADMIN_ADDRESS = '0x789';
const APPROVAL_PROCESS_ID = 'my-approval-process-id';

const ABI_FILE = 'test/input/MyContract.json'

test.beforeEach(t => {
  const upgradeContractStub = sinon.stub().returns({
    proposalId: 'my-proposal-id',
  });
  t.context.upgradeContractStub = upgradeContractStub;

  t.context.fakeDeployClient = {
    upgradeContract: upgradeContractStub,
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

test('proposeUpgrade required args', async t => {
  const args = ['--proxyAddress', PROXY_ADDRESS, '--newImplementationAddress', NEW_IMPLEMENTATION_ADDRESS, '--chainId', FAKE_CHAIN_ID];

  await proposeUpgrade(args, t.context.fakeDeployClient, t.context.fakeNetworkClient);

  t.is(t.context.upgradeContractStub.callCount, 1);

  sinon.assert.calledWithExactly(t.context.upgradeContractStub, {
    proxyAddress: PROXY_ADDRESS,
    newImplementationAddress: NEW_IMPLEMENTATION_ADDRESS,
    network: 'mainnet',
    proxyAdminAddress: undefined,
    newImplementationABI: undefined,
    approvalProcessId: undefined,
  });
});

test('proposeUpgrade all args', async t => {
  const args = ['--proxyAddress', PROXY_ADDRESS, '--newImplementationAddress', NEW_IMPLEMENTATION_ADDRESS, '--chainId', FAKE_CHAIN_ID, '--proxyAdminAddress', PROXY_ADMIN_ADDRESS, '--contractArtifactFile', ABI_FILE, '--approvalProcessId', APPROVAL_PROCESS_ID];

  await proposeUpgrade(args, t.context.fakeDeployClient, t.context.fakeNetworkClient);

  t.is(t.context.upgradeContractStub.callCount, 1);

  sinon.assert.calledWithExactly(t.context.upgradeContractStub, {
    proxyAddress: PROXY_ADDRESS,
    newImplementationAddress: NEW_IMPLEMENTATION_ADDRESS,
    network: 'mainnet',
    proxyAdminAddress: PROXY_ADMIN_ADDRESS,
    newImplementationABI: '[{"type":"function","name":"hello"}]',
    approvalProcessId: APPROVAL_PROCESS_ID,
  });
});