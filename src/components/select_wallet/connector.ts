import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { TorusConnector } from "@web3-react/torus-connector";

const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42],
});

const walletconnect = new WalletConnectConnector({
  rpc: {
    1: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
    3: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
    4: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
    5: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
    42: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
  },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
});

const walletLink = new WalletLinkConnector({
  url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
  appName: "web3-react-demo",
});

const torus = new TorusConnector({ chainId: 1 });

export const connectors = {
  injected: injected,
  walletConnect: walletconnect,
  coinbaseWallet: walletLink,
  torus: torus,
};
