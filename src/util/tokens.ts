import config from "@/config";
import { getPublicVaults } from "@/util/vault";
import { Contract, ethers } from "ethers";
import ERC20ABI from "@/contract/ERC20.json";

const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc-mumbai.maticvigil.com/v1/c1947560c824b65dcc8774279fe1225b3c835d35"
);

export const tokenListInfo = async () => {
    const tokens = config.tokens as unknown as {
        [key: string]: any;
    };
    const tokenInfo: any[] = [];
    Object.keys(tokens).forEach((key) => {
        tokenInfo.push(tokens[key] as any);
    });

    await getPublicVaults()
        .then((vaults) => {
            vaults.map((vault) => {
                console.log("vault: ", vault);
                const token = vault.token;
                const temp = {
                    address: token.id,
                    color: "#422940",
                    decimals: 18,
                    hasIcon: false,
                    id: token.symbol.toLowerCase(),
                    logoUrl: "",
                    name: token.name,
                    precision: 3,
                    price: 0,
                    symbol: token.symbol,
                };
                tokenInfo.push(temp);
            });
        })
        .catch((err) => {});

    const tokenList = await getTokensPrice(tokenInfo);
    return tokenList;
};

export const tokenListBalance = async (tokens: any[], account: string) => {
    if (tokens.length < 1 || account === "") {
        return [];
    }
    const balances: { [key: string]: any } = {};
    await Promise.all(
        tokens.map(async (token: any) => {
            await getBalance(token, account)
                .then((balance: any) => {
                    balances[token.address] = ethers.utils.formatUnits(
                        balance,
                        token.decimals
                    );
                })
                .catch((err: any) => {
                    console.log("getBalance err", err);
                });
        })
    ).catch((err) => {
        console.log("get balance err:", err);
    });
    return balances;
};

export const tokenListAllowance = async (
    tokens: any[],
    account: string,
    proxyAddress: string
) => {
    console.log("get token list allowance:", tokens, proxyAddress);
    if (!proxyAddress || tokens.length < 1 || account === "") {
        return [];
    }
    const tokensAllowance: { [key: string]: any } = {};
    await Promise.all(
        tokens.map(async (token: any, index: number) => {
            console.log("allow ==== address", token.address);
            const contract = new Contract(token.address, ERC20ABI, provider);
            await contract
                .allowance(account, proxyAddress)
                .then((res: any) => {
                    console.log("get token allow result:", res);
                    tokensAllowance[token.id] = ethers.utils.formatUnits(
                        res,
                        token.decimals
                    );
                })
                .catch((err: any) => {
                    console.log(`tokensAllowance err: ${index}:`, err);
                });
        })
    ).catch((err) => {
        console.log("get tokens all allowance err", err);
    });
    return tokensAllowance;
};

export const getTokensPrice = async (tokens: any[]) => {
    const tokenIds = tokens.map((token) => token.id).join(",");
    const ENDPOINT = "https://api.coingecko.com/api/v3";
    const url = `${ENDPOINT}/simple/price?ids=${tokenIds}&vs_currencies=usd`;
    const response = await fetch(url);
    const data = await response.json();
    console.log("tokens utils get price:", data);
    const temp = tokens.map((token: any) => {
        token.price = data[token.id] ? data[token.id].usd : 0;
        return token;
    });
    return temp;
};

const getBalance = async (token: any, account: string) => {
    const contract = new Contract(token.address, ERC20ABI, provider);
    return await contract.balanceOf(account);
};
