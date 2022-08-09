import { calcSpotPrice } from "@balancer-labs/sor/dist/bmath";
import { bnum } from "@/util/utils";
import { ethers } from "ethers";
import config from "@/config";

export function swapPrice(pool: any, swap: any) {
    const reserveCurrencies = Object.keys(config.tokens);
    const reserves = new Set(reserveCurrencies);
    const poolTokens: any = new Set(pool.tokensList);

    const intersection = new Set(
        [...poolTokens].filter((x) => reserves.has(ethers.utils.getAddress(x)))
    );

    const reserveToken = intersection.values().next().value.toLowerCase();

    return swap.tokenIn === reserveToken
        ? swap.tokenAmountIn / swap.tokenAmountOut
        : swap.tokenAmountOut / swap.tokenAmountIn;
}

export const getLbpData = (pool: any) => {
    console.log("getLbpData", pool);
    const reserveCurrencies = Object.keys(config.tokens);
    const reserves = new Set(reserveCurrencies);
    const poolTokens: any = new Set(pool.tokensList);

    let projectToken;
    let projectIdx;
    let reserveIdx;

    // Reserve token is the pool token that IS in reserves
    // @ts-ignore
    const intersection = new Set(
        [...poolTokens].filter((x) => reserves.has(ethers.utils.getAddress(x)))
    );

    // Project token is the pool token that is NOT in reserves
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
