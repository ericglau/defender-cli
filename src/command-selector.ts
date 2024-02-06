import minimist from "minimist";

const USAGE = 'Usage: npx @openzeppelin/defender-deploy-client-cli <COMMAND> <OPTIONS>';
const DETAILS = `
Available commands:
  deploy  Deploys a contract using OpenZeppelin Defender.

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
    }
  }
}
