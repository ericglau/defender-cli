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

const ABI_FILE = 'test/samples/MyContract.json'

function setupFakeDefender(t) {
  const fakeDefenderClient = {
    upgradeContract: () => {
      return {
        proposalId: 'my-proposal-id',
      };
    },
  };
  t.context.spy = sinon.spy(fakeDefenderClient, 'upgradeContract');

  t.context.command = proxyquire('../dist/commands/propose-upgrade', {
    '../internal/client': {
      getDeployClient: () => fakeDefenderClient,
    }
  });

  process.env.DEFENDER_KEY = 'fake-key';
  process.env.DEFENDER_SECRET = 'fake-secret';
}

test('proposeUpgrade required args', async t => {
  setupFakeDefender(t);

  const args = ['proposeUpgrade', '--proxyAddress', PROXY_ADDRESS, '--newImplementationAddress', NEW_IMPLEMENTATION_ADDRESS, '--chainId', FAKE_CHAIN_ID];

  await t.context.command.proposeUpgrade(args);

  t.is(t.context.spy.callCount, 1);

  sinon.assert.calledWithExactly(t.context.spy, {
    proxyAddress: PROXY_ADDRESS,
    newImplementationAddress: NEW_IMPLEMENTATION_ADDRESS,
    network: 'mainnet',
    proxyAdminAddress: undefined,
    newImplementationABI: undefined,
    approvalProcessId: undefined,
  });
});

test('proposeUpgrade all args', async t => {
  setupFakeDefender(t);

  const args = ['proposeUpgrade', '--proxyAddress', PROXY_ADDRESS, '--newImplementationAddress', NEW_IMPLEMENTATION_ADDRESS, '--chainId', FAKE_CHAIN_ID, '--proxyAdminAddress', PROXY_ADMIN_ADDRESS, '--abiFile', ABI_FILE, '--approvalProcessId', APPROVAL_PROCESS_ID];

  await t.context.command.proposeUpgrade(args);

  t.is(t.context.spy.callCount, 1);

  sinon.assert.calledWithExactly(t.context.spy, {
    proxyAddress: PROXY_ADDRESS,
    newImplementationAddress: NEW_IMPLEMENTATION_ADDRESS,
    network: 'mainnet',
    proxyAdminAddress: PROXY_ADMIN_ADDRESS,
    newImplementationABI: '[{"type":"function","name":"hello"}]',
    approvalProcessId: APPROVAL_PROCESS_ID,
  });
});