import config from "@/config";
import { getPublicVaults } from "@/util/vault";
import { Contract, ethers } from "ethers";
import ERC20ABI from "@/contract/ERC20.json";
import BigNumber from "bignumber.js";
import { gql, request } from "graphql-request";

const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

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
                return "";
            });
        })
        .catch((err) => {});

    const tokenList = await getTokensPrice(tokenInfo);
    return tokenList;
};

export const tokenListBalance = async (tokens: any[], account: string) => {
    console.log("tokenListBalance: ", tokens, account);
    if (tokens.length < 1 || account === "") {
        return [];
    }
    const balances: { [key: string]: any } = {};
    await Promise.all(
        tokens.map(async (token: any) => {
            await getBalance(token, account)
                .then((balance: any) => {
                    balances[token.address] = new BigNumber(
                        ethers.utils.formatUnits(balance, token.decimals)
                    )
                        .toFixed(3)
                        .toString();
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
    let data: any = {};
    try {
        const response = await fetch(url);
        data = await response.json();
    } catch (e) {
        console.log("getTokensPrice err:", e);
    }
    console.log("tokens utils get price:", data);
    const temp = tokens.map((token: any) => {
        token.price = data[token.id] ? data[token.id].usd : 0.1;
        return token;
    });
    return temp;
};

export const getTokensPriceFormGraph = async () => {
    const query = gql`
        query {
            tokenPrices {
                id
                name
                symbol
                price
            }
        }
    `;

    let data: any = {};
    try {
        const result = await request(config.subgraphUrl, query);
        console.log("getTokensPriceFormGraph:", result);
        result.tokenPrices.forEach((item: any) => {
            data[item.id] = item.price;
        });
    } catch (e) {
        console.log("getTokensPriceFormGraph err:", e);
    }
    return data;
};

const getBalance = async (token: any, account: string) => {
    const contract = new Contract(token.address, ERC20ABI, provider);
    return await contract.balanceOf(account);
};
