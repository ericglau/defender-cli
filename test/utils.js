const test = require('ava');
const { getNetwork } = require('../dist/internal/utils');

test('getNetwork finds network', async t => {
  const fakeNetworkClient = {
    listForkedNetworks: () => {
      return []
    },
    listPrivateNetworks: () => {
      return [];
    },
  };
  const network = await getNetwork(0x01, fakeNetworkClient);
  t.is(network, 'mainnet');
});

test('getNetwork cannot find network', async t => {
  const fakeNetworkClient = {
    listForkedNetworks: () => {
      return [];
    },
    listPrivateNetworks: () => {
      return [];
    },
  };

  await t.throwsAsync(() => getNetwork(0x123456, fakeNetworkClient), { message: /The current network with chainId \d+ is not supported/, });
});

test('getNetworks finds forked network', async t => {
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

test('getNetwork finds private network', async t => {
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

test('getNetwork finds multiple networks', async t => {
  const fakeNetworkClient = {
    listForkedNetworks: () => {
      return [];
    },
    listPrivateNetworks: () => {
      return [
        {
          chainId: 0x123456,
          name: 'first-forked-network',
        },
        {
          chainId: 0x123456,
          name: 'second-forked-network',
        },
      ];
    },
  };

  await t.throwsAsync(() => getNetwork(0x123456, fakeNetworkClient), {
    message:
      /Detected multiple networks with the same chainId \d+ on OpenZeppelin Defender: first-forked-network, second-forked-network/,
  });
});

test('getNetworks finds one network, does not match specified network', async t => {
  const fakeNetworkClient = {
    listForkedNetworks: () => {
      return [
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

  await t.throwsAsync(() => getNetwork(0x123456, fakeNetworkClient, 'specified-network'), {
    message: /Detected network my-forked-network does not match specified network: specified-network/,
  });
});

test('getNetworks finds multiple networks, does not match specified network', async t => {
  const fakeNetworkClient = {
    listForkedNetworks: () => {
      return [
        {
          chainId: 0x123456,
          name: 'my-forked-network',
        },
        {
          chainId: 0x123456,
          name: 'my-forked-network-2',
        },
      ];
    },
    listPrivateNetworks: () => {
      return [];
    },
  };

  await t.throwsAsync(() => getNetwork(0x123456, fakeNetworkClient, 'specified-network'), {
    message:
      /Specified network specified-network does not match any of the detected networks for chainId 1193046: my-forked-network, my-forked-network-2/,
  });
});

test('getNetworks finds multiple networks, includes specified network', async t => {
  const fakeNetworkClient = {
    listForkedNetworks: () => {
      return [
        {
          chainId: 0x123456,
          name: 'my-forked-network',
        },
        {
          chainId: 0x123456,
          name: 'specified-network',
        },
      ];
    },
    listPrivateNetworks: () => {
      return [];
    },
  };

  const network = await getNetwork(0x123456, fakeNetworkClient, 'specified-network');
  t.is(network, 'specified-network');
});
