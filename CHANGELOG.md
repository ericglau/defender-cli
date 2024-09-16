# Changelog

## 0.0.1-alpha.9 (2024-09-16)

- Fix packaging. ([#15](https://github.com/OpenZeppelin/defender-deploy-client-cli/pull/15))

## 0.0.1-alpha.8 (2024-09-16)

- Add `--metadata` option. ([#13](https://github.com/OpenZeppelin/defender-deploy-client-cli/pull/13))

## 0.0.1-alpha.7 (2024-05-02)

- Add options to enable overriding deployment transaction parameters. ([#10](https://github.com/OpenZeppelin/defender-deploy-client-cli/pull/10))

## 0.0.1-alpha.6 (2024-04-16)

- Update documentation and error message about supported values for `--licenseType` option. ([#9](https://github.com/OpenZeppelin/defender-deploy-client-cli/pull/9))

## 0.0.1-alpha.5 (2024-03-11)

- Support private networks and forked networks. ([#7](https://github.com/OpenZeppelin/defender-deploy-client-cli/pull/7))

## 0.0.1-alpha.4 (2024-02-14)

- Add commands to get approval process information. ([#4](https://github.com/OpenZeppelin/defender-deploy-client-cli/pull/4))
- Renamed options, see breaking changes below.

### Breaking changes:
- `deploy` command: Renamed the `--artifactFile` option to `--buildInfoFile`
- `proposeUpgrade` command: Renamed the `--abiFile` option to `--contractArtifactFile`

## 0.0.1-alpha.3 (2024-02-09)

- Support proposing upgrades. ([#2](https://github.com/OpenZeppelin/defender-deploy-client-cli/pull/2))

## 0.0.1-alpha.2 (2024-02-01)

- Enable constructorBytecode argument. ([#1](https://github.com/OpenZeppelin/defender-deploy-client-cli/pull/1))
