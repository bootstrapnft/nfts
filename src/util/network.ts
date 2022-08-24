type Network = {
    id: number;
    name: string;
};

export const currentNetwork = (): Network => {
    const sessionNetwork = JSON.parse(
        sessionStorage.getItem("chain") ?? "null"
    );
    return sessionNetwork || { id: 80001, name: "Mumbai Testnet" };
};

const networks: any = {
    4: {
        chainId: "0x4",
        chainName: "Rinkeby Test Network",
        rpcUrls: ["https://rinkeby.infura.io/v3/"],
        nativeCurrency: {
            name: "ETH",
            symbol: "RinkebyETH",
            decimals: 18,
        },
        blockExplorerUrls: ["https://rinkeby.etherscan.io"],
    },
    1313161555: {
        chainId: "0x4e454153",
        chainName: "Aurora Testnet",
        rpcUrls: ["https://testnet.aurora.dev"],
        nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
        },
        blockExplorerUrls: ["https://testnet.aurorascan.dev/"],
    },
    1287: {
        chainId: "0x507",
        chainName: "moonbase-alphanet",
        rpcUrls: ["https://rpc.api.moonbase.moonbeam.network"],
        nativeCurrency: {
            name: "DEV",
            symbol: "DEV",
            decimals: 18,
        },
        blockExplorerUrls: ["https://moonbase.moonscan.io/"],
    },
    81: {
        chainId: "0x51",
        chainName: "sbibuya-alphanet",
        rpcUrls: ["https://evm.shibuya.astar.network"],
        nativeCurrency: {
            name: "SBY",
            symbol: "SBY",
            decimals: 18,
        },
        blockExplorerUrls: ["https://blockscout.com/shibuya"],
    },
    80001: {
        chainId: "0x13881",
        chainName: "Mumbai Testnet",
        rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
        nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
        },
        blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
    },
};

export const changeNetwork = async (network: Network, provider: any) => {
    sessionStorage.setItem("chain", JSON.stringify(network));
    if (provider.isMetaMask) {
        if (
            provider.chainId !== network.id ||
            provider.chainId !== network.id.toString(16)
        ) {
            try {
                await provider.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: "0x" + network.id.toString(16) }],
                });
            } catch (switchError: any) {
                console.log("aaa", switchError);
                if (switchError.code === 4902 || switchError.code === -32603) {
                    try {
                        await provider.request({
                            method: "wallet_addEthereumChain",
                            params: [networks[network.id]],
                        });
                    } catch (addError: any) {
                        console.error("add chain", addError.message);
                    }
                }
            }
        }
    }
    // window.location.href = "/";
};
