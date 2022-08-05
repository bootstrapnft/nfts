import { MaxUint256 } from "@ethersproject/constants";
import BigNumber from "@/util/bignumber";
import { getTokensPrice } from "@/util/tokens";
import config from "@/config";

export const ITEMS_PER_PAGE = 20;
export const MAX_GAS = new BigNumber("0xffffffff");
export const MAX_UINT = MaxUint256;
export const POOL_TOKENS_DECIMALS = 18;
export const GAS_LIMIT_BUFFER = 0.1;
export const MAX =
    "115792089237316195423570985008687907853269984665640564039457.584007913129639935";
export const EDIT_POOL_GOOGLE_FORM =
    "https://docs.google.com/forms/d/e/1FAIpQLSe_sIVqZCL0rO--8u3PUUNGuxZ68LviAZBtrqV4gVTeTxzHCA/viewform";

export const amplAddress = "0xD46bA6D942050d489DBd938a2C909A5d5039A161";
export const validAmplPools = ["0xa751a143f8fe0a108800bfb915585e4255c2fe80"];

export const unknownColors = [
    "#7ada6a",
    "#8d4f8d",
    "#6ddbfd",
    "#9d8eff",
    "#faa788",
    "#5d6872",
    "#7e9e99",
    "#f5fd84",
];

export function shortenAddress(str = "") {
    return str ? `${str.slice(0, 6)}...${str.slice(str.length - 4)}` : str;
}

export function shorten(str = "", max = 14) {
    return str.length > max ? `${str.slice(0, max)}...` : str;
}

export function bnum(val: string | number | BigNumber): BigNumber {
    const number = typeof val === "string" ? val : val ? val.toString() : "0";
    return new BigNumber(number);
}

export function scale(input: BigNumber, decimalPlaces: number): BigNumber {
    const scalePow = new BigNumber(decimalPlaces.toString());
    const scaleMul = new BigNumber(10).pow(scalePow);
    return input.times(scaleMul);
}

export function toWei(val: string | BigNumber): BigNumber {
    return scale(bnum(val.toString()), 18).integerValue();
}

export function calcPoolTokensByRatio(
    ratio: BigNumber,
    totalShares: string | BigNumber
) {
    if (ratio.isNaN()) {
        return "0";
    }
    // @TODO - fix calcs so no buffer is needed
    const buffer = bnum(100);
    return bnum(ratio)
        .times(toWei(totalShares))
        .integerValue(BigNumber.ROUND_DOWN)
        .minus(buffer)
        .toString();
}

export function denormalizeBalance(
    amount: BigNumber,
    tokenDecimals: number
): BigNumber {
    return scale(bnum(amount), tokenDecimals);
}

export function normalizeBalance(
    amount: BigNumber,
    tokenDecimals: number
): BigNumber {
    return scale(bnum(amount), -tokenDecimals);
}

export function isLocked(
    allowances: { [key: string]: any },
    tokenAddress: string | number,
    spender: string | number,
    rawAmount: BigNumber,
    decimals: number
) {
    const tokenAllowance = allowances[tokenAddress];
    if (!tokenAllowance || !tokenAllowance[spender]) {
        return true;
    }
    if (!rawAmount) {
        return false;
    }
    const amount = denormalizeBalance(rawAmount, decimals);
    return amount.gt(tokenAllowance[spender]);
}

export const getPoolLiquidity = async (pool: any) => {
    let tokens = pool.tokens.map((token: any) => {
        let tokenId = "";
        Object.keys(config.tokens).forEach((key) => {
            const tk = config.tokens[key];
            if (tk.address.toLowerCase() === token.address) {
                tokenId = tk.id;
            }
        });
        if (tokenId === "") {
            tokenId = token.symbol.toLowerCase();
        }
        token.id = tokenId;
        return token;
    });
    tokens = await getTokensPrice(tokens);
    let sumWeight = new BigNumber(0);
    let sumValue = new BigNumber(0);

    for (const token of tokens) {
        const price = token.price;
        if (!price) {
            continue;
        }
        const balanceNumber = new BigNumber(token.balance);
        const value = balanceNumber.times(price);
        sumValue = sumValue.plus(value);
        sumWeight = sumWeight.plus(token.weightPercent / 100);
    }
    let liquidity: any = 0;
    if (sumWeight.gt(0)) {
        liquidity = sumValue.div(sumWeight).toString();
    } else {
        liquidity = pool.liquidity;
    }
    return Number(Number(liquidity).toFixed(2));
};
