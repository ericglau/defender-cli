const test = require('ava');
const { promisify } = require('util');
const { exec } = require('child_process');

const execAsync = promisify(exec);

const CLI = 'node dist/cli.js';

test('help', async t => {
  const output = (await execAsync(`${CLI} --help`)).stdout;
  t.snapshot(output);
});

test('no args', async t => {
  const output = (await execAsync(CLI)).stdout;
  t.snapshot(output);
});

test('unknown command', async t => {
  const error = await t.throwsAsync(execAsync(`${CLI} foo`));
  t.true(error.message.includes('Unknown command: foo'));
});