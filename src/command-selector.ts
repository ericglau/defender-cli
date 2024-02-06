import minimist from "minimist";

const USAGE = 'Usage: npx @openzeppelin/defender-deploy-client-cli <COMMAND> <OPTIONS>';
const DETAILS = `
Performs actions using OpenZeppelin Defender.

Available commands:
  deploy  Deploys a contract.
  proposeUpgrade  Proposes an upgrade.

Run 'npx @openzeppelin/defender-deploy-client-cli <COMMAND> --help' for more information on a command.
`;

export async function main(args: string[]): Promise<void> {
  const regularArgs = minimist(args)._;

  if (regularArgs.length === 0) {
    console.log(USAGE);
    console.log(DETAILS);
  } else {
    if (regularArgs[0] === 'deploy') {
      const { deploy } = await import('./commands/deploy');
      await deploy(args);
    } else if (regularArgs[0] === 'proposeUpgrade') {
      const { proposeUpgrade } = await import('./commands/propose-upgrade');
      await proposeUpgrade(args);
    } else {
      throw new Error(`\
Unknown command: ${regularArgs[0]}
Run 'npx @openzeppelin/defender-deploy-client-cli --help' for usage.\
`);
    }
  }
}
