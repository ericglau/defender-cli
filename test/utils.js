const test = require('ava');
const { getNetwork } = require('../dist/internal/utils');

test('returns defender network definition', async t => {
  const fakeNetworkClient = {
    listForkedNetworks: () => {
      return []
    },
    listPrivateNetworks: () => {
      return [];
    },
  };
  const network = await getNetwork(0x05, fakeNetworkClient);
  t.is(network, 'goerli');
});

test('fails if chain id is not accepted', async t => {
  const fakeNetworkClient = {
    listForkedNetworks: () => {
      return [];
    },
    listPrivateNetworks: () => {
      return [];
    },
  };

  await t.throwsAsync(() => getNetwork(0x123456, fakeNetworkClient), { message: /Network \d+ is not supported/ });
});

test('forked network', async t => {
  const fakeNetworkClient = {
    listForkedNetworks: () => {
      return [
        {
          chainId: 0x222222,
          name: 'other-forked-network',
        },
        {
          chainId: 0x123456,
          name: 'my-forked-network',
        },
      ];
    },
    listPrivateNetworks: () => {
      return [];
    },
  };

  const network = await getNetwork(0x123456, fakeNetworkClient);
  t.is(network, 'my-forked-network');
});

test('private network', async t => {
  const fakeNetworkClient = {
    listForkedNetworks: () => {
      return [];
    },
    listPrivateNetworks: () => {
      return [
        {
          chainId: 0x123456,
          name: 'my-private-network',
        },
      ];
    },
  };

  const network = await getNetwork(0x123456, fakeNetworkClient);
  t.is(network, 'my-private-network');
});