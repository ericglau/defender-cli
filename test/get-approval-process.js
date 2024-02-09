const test = require('ava');
const sinon = require('sinon');
const { promisify } = require('util');
const { exec } = require('child_process');
const { getApprovalProcess } = require('../dist/commands/get-approval-process');

const execAsync = promisify(exec);

const CLI = 'node dist/cli.js';

test('getDeployApprovalProcess help', async t => {
  const output = (await execAsync(`${CLI} getDeployApprovalProcess --help`)).stdout;
  t.snapshot(output);
});

test('getDeployApprovalProcess no args', async t => {
  const error = await t.throwsAsync(execAsync(`${CLI} getDeployApprovalProcess`));
  t.true(error.message.includes('Missing required option: --chainId'));
});

test('getUpgradeApprovalProcess help', async t => {
  const output = (await execAsync(`${CLI} getUpgradeApprovalProcess --help`)).stdout;
  t.snapshot(output);
});

test('getUpgradeApprovalProcess no args', async t => {
  const error = await t.throwsAsync(execAsync(`${CLI} getUpgradeApprovalProcess`));
  t.true(error.message.includes('Missing required option: --chainId'));
});

const FAKE_CHAIN_ID = '1';

test.beforeEach(t => {
  t.context.getDeployApprovalProcessStub = sinon.stub().returns({
    approvalProcessId: 'my-deploy-approval-process-id',
    via: '0x123',
    viaType: 'Relayer',
  });

  t.context.getUpgradeApprovalProcessStub = sinon.stub().returns({
    approvalProcessId: 'my-upgrade-approval-process-id',
    via: '0x456',
    viaType: 'Multisig',
  });

  t.context.fakeDefenderClient = {
    getDeployApprovalProcess: t.context.getDeployApprovalProcessStub,
    getUpgradeApprovalProcess: t.context.getUpgradeApprovalProcessStub,
  };
});

test.afterEach.always(t => {
  sinon.restore();
});

test('getDeployApprovalProcess args', async t => {
  const args = ['--chainId', FAKE_CHAIN_ID];

  await getApprovalProcess('getDeployApprovalProcess', args, t.context.fakeDefenderClient);

  t.is(t.context.getDeployApprovalProcessStub.callCount, 1);
  t.is(t.context.getUpgradeApprovalProcessStub.callCount, 0);

  sinon.assert.calledWithExactly(t.context.getDeployApprovalProcessStub, 'mainnet');
});

test('getUpgradeApprovalProcess args', async t => {
  const args = ['--chainId', FAKE_CHAIN_ID];

  await getApprovalProcess('getUpgradeApprovalProcess', args, t.context.fakeDefenderClient);

  t.is(t.context.getDeployApprovalProcessStub.callCount, 0);
  t.is(t.context.getUpgradeApprovalProcessStub.callCount, 1);

  sinon.assert.calledWithExactly(t.context.getUpgradeApprovalProcessStub, 'mainnet');
});
