import { calcSpotPrice } from "@balancer-labs/sor/dist/bmath";
import { bnum } from "@/util/utils";
import { ethers } from "ethers";

const reserveCurrencies: any = {
    1: [
        "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
        "0x261b45D85cCFeAbb11F022eBa346ee8D1cd488c0", // rDAI
    ],
    4: [
        "0xa3FcE8597Ae238f1050c382f1f94Db8c646529A9",
        "0x6C97D2dda691c7eeeffCF7FF561D9CC596c94739",
    ],
    42: [
        "0x1528F3FCc26d13F7079325Fb78D9442607781c8C", // DAI
        "0x2F375e94FC336Cdec2Dc0cCB5277FE59CBf1cAe5", // USDC
        "0x3183683ceeab01699722053a2cb6a945ce0d7cec", // rDAI
    ],
};

export function swapPrice(pool: any, chainId: number, swap: any) {
    const reserves = new Set(reserveCurrencies[chainId]);
    const poolTokens = new Set(pool.tokensList);

    // @ts-ignore
    const intersection = new Set(
        [...poolTokens].filter((x) => reserves.has(ethers.utils.getAddress(x)))
    );

    const reserveToken = intersection.values().next().value.toLowerCase();

    return swap.tokenIn === reserveToken
        ? swap.tokenAmountIn / swap.tokenAmountOut
        : swap.tokenAmountOut / swap.tokenAmountIn;
}

export const getLbpData = (pool: any, chainId: number) => {
    console.log("getLbpData", pool, chainId);
    const reserves = new Set(reserveCurrencies[chainId]);
    const poolTokens = new Set(pool.tokensList);

    let projectToken;
    let projectIdx;
    let reserveIdx;

    // Reserve token is the pool token that IS in reserves
    // @ts-ignore
    const intersection = new Set(
        [...poolTokens].filter((x) => reserves.has(ethers.utils.getAddress(x)))
    );

    // Project token is the pool token that is NOT in reserves
    // @ts-ignore
    const difference = new Set(
        [...poolTokens].filter((x) => !reserves.has(ethers.utils.getAddress(x)))
    );

    console.log("lbpData intersection", intersection);
    console.log("lbpData difference", difference);

    // An LB Pool has to have two tokens, only one of which is a reserve token
    const lbpPoolFlag = pool.tokensList.length === 2 && intersection.size === 1;
    if (lbpPoolFlag) {
        projectToken = difference.values().next().value;

        if (pool.tokens[0].checksum === projectToken) {
            projectIdx = 0;
            reserveIdx = 1;
        } else {
            projectIdx = 1;
            reserveIdx = 0;
        }
    }

    if (reserveIdx === undefined || projectIdx === undefined) return {};

    return {
        // There are two tokens and (only) one of them is a reserve currency
        // We want the price of the pool token in terms of the reserve
        // tokenIn is reserve; token out is project
        isLbpPool: lbpPoolFlag,
        lbpPrice: calcSpotPrice(
            bnum(pool.tokens[reserveIdx].balance),
            bnum(pool.tokens[reserveIdx].denormWeight),
            bnum(pool.tokens[projectIdx].balance),
            bnum(pool.tokens[projectIdx].denormWeight),
            bnum(pool.swapFee * 1e18)
        ).div(1e18),
        projectToken: pool.tokens[projectIdx].symbol,
    };
};
