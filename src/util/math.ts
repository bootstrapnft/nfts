import { BigNumber } from "ethers";

const BONE = BigNumber.from(10).pow(18);

export const calcSingleInGivenWeightIncrease = (
    tokenBalance: BigNumber,
    tokenWeight: BigNumber,
    tokenWeightNew: BigNumber
) => {
    const deltaWeight = tokenWeightNew.sub(tokenWeight);
    console.log("deltaWeight", deltaWeight.toString());
    console.log(
        "deltaWeight",
        tokenBalance.toString(),
        tokenWeight.toString(),
        tokenWeightNew.toString()
    );
    return bmul(tokenBalance, bdiv(deltaWeight, tokenWeight));
};

export const calcPoolInGivenTokenRemove = (
    totalWeight: BigNumber,
    tokenWeight: BigNumber,
    poolSupply: BigNumber
) => {
    return bdiv(bmul(poolSupply, tokenWeight), totalWeight);
};

export const bmul = (a: BigNumber, b: BigNumber): BigNumber => {
    const c0 = a.mul(b);
    const c1 = c0.add(BONE.div(BigNumber.from(2)));
    const c2 = c1.div(BONE).toBigInt();
    return BigNumber.from(c2);
};

export const bdiv = (a: BigNumber, b: BigNumber): BigNumber => {
    const c0 = a.mul(BONE);
    const c1 = c0.add(b.div(BigNumber.from(2)));
    const c2 = c1.div(b);
    return BigNumber.from(c2);
};

export const scale = (input: BigNumber, decimalPlaces: number): BigNumber => {
    const scalePow = BigNumber.from(decimalPlaces.toString());
    const scaleMul = BigNumber.from(10).pow(scalePow);
    return input.mul(scaleMul);
};

export const toWei = (val: string | BigNumber): BigNumber => {
    return scale(bnum(val.toString()), 18);
};

export const bnum = (val: string | number | BigNumber): BigNumber => {
    const number = typeof val === "string" ? val : val ? val.toString() : "0";
    return BigNumber.from(number);
};
