import BigNumber from "@/util/bignumber";

const BONE = new BigNumber(10).pow(18);
const EXIT_FEE = new BigNumber(0);
const BPOW_PRECISION = BONE.idiv(new BigNumber(10).pow(10));

function btoi(a: BigNumber): BigNumber {
    return a.idiv(BONE);
}

function bfloor(a: BigNumber): BigNumber {
    return btoi(a).times(BONE);
}

export const calcSingleInGivenWeightIncrease = (
    tokenBalance: BigNumber,
    tokenWeight: BigNumber,
    tokenWeightNew: BigNumber
) => {
    console.log(
        "WeightIncrease",
        tokenBalance.toString(),
        tokenWeight.toString(),
        tokenWeightNew.toString()
    );
    const deltaWeight = tokenWeightNew.minus(tokenWeight);
    const tokenBalanceIn = bmul(tokenBalance, bdiv(deltaWeight, tokenWeight));
    return tokenBalanceIn;
};

export function calcPoolInGivenWeightDecrease(
    totalWeight: BigNumber,
    tokenWeight: BigNumber,
    tokenWeightNew: BigNumber,
    poolSupply: BigNumber
): BigNumber {
    const deltaWeight = tokenWeight.minus(tokenWeightNew);
    const poolAmountIn = bmul(poolSupply, bdiv(deltaWeight, totalWeight));
    return poolAmountIn;
}

export const calcPoolInGivenTokenRemove = (
    totalWeight: BigNumber,
    tokenWeight: BigNumber,
    poolSupply: BigNumber
) => {
    return bdiv(bmul(poolSupply, tokenWeight), totalWeight);
};

export function calcPoolOutGivenSingleIn(
    tokenBalanceIn: BigNumber,
    tokenWeightIn: BigNumber,
    poolSupply: BigNumber,
    totalWeight: BigNumber,
    tokenAmountIn: BigNumber,
    swapFee: BigNumber
): BigNumber {
    const normalizedWeight = bdiv(tokenWeightIn, totalWeight);
    const zaz = bmul(BONE.minus(normalizedWeight), swapFee);
    const tokenAmountInAfterFee = bmul(tokenAmountIn, BONE.minus(zaz));

    const newTokenBalanceIn = tokenBalanceIn.plus(tokenAmountInAfterFee);
    const tokenInRatio = bdiv(newTokenBalanceIn, tokenBalanceIn);

    const poolRatio = bpow(tokenInRatio, normalizedWeight);
    const newPoolSupply = bmul(poolRatio, poolSupply);
    const poolAmountOut = newPoolSupply.minus(poolSupply);
    return poolAmountOut;
}

export function calcSingleOutGivenPoolIn(
    tokenBalanceOut: BigNumber,
    tokenWeightOut: BigNumber,
    poolSupply: BigNumber,
    totalWeight: BigNumber,
    poolAmountIn: BigNumber,
    swapFee: BigNumber
): BigNumber {
    const normalizedWeight = bdiv(tokenWeightOut, totalWeight);
    const poolAmountInAfterExitFee = bmul(poolAmountIn, BONE.minus(EXIT_FEE));
    const newPoolSupply = poolSupply.minus(poolAmountInAfterExitFee);
    const poolRatio = bdiv(newPoolSupply, poolSupply);

    const tokenOutRatio = bpow(poolRatio, bdiv(BONE, normalizedWeight));
    const newTokenBalanceOut = bmul(tokenOutRatio, tokenBalanceOut);

    const tokenAmountOutBeforeSwapFee =
        tokenBalanceOut.minus(newTokenBalanceOut);

    const zaz = bmul(BONE.minus(normalizedWeight), swapFee);
    const tokenAmountOut = bmul(tokenAmountOutBeforeSwapFee, BONE.minus(zaz));
    return tokenAmountOut;
}

function bpow(base: BigNumber, exp: BigNumber): BigNumber {
    const whole = bfloor(exp);
    const remain = exp.minus(whole);
    const wholePow = bpowi(base, btoi(whole));
    if (remain.eq(new BigNumber(0))) {
        return wholePow;
    }

    const partialResult = bpowApprox(base, remain, BPOW_PRECISION);
    return bmul(wholePow, partialResult);
}

function bpowi(a: BigNumber, n: BigNumber): BigNumber {
    let z = !n.modulo(new BigNumber(2)).eq(new BigNumber(0)) ? a : BONE;

    for (
        n = n.idiv(new BigNumber(2));
        !n.eq(new BigNumber(0));
        n = n.idiv(new BigNumber(2))
    ) {
        a = bmul(a, a);
        if (!n.modulo(new BigNumber(2)).eq(new BigNumber(0))) {
            z = bmul(z, a);
        }
    }
    return z;
}

function bpowApprox(
    base: BigNumber,
    exp: BigNumber,
    precision: BigNumber
): BigNumber {
    const a = exp;
    const { res: x, bool: xneg } = bsubSign(base, BONE);
    let term = BONE;
    let sum = term;
    let negative = false;
    const LOOP_LIMIT = 1000;

    let idx = 0;
    for (let i = 1; term.gte(precision); i++) {
        idx += 1;
        // Some values cause it to lock up the browser
        // Test case: Remove Liquidity, single asset, poolAmountIn >> max
        // Should be halted before calling this, but...
        // Retain this halt after a max iteration limit as a backstop/failsafe
        if (LOOP_LIMIT === idx) {
            break;
        }

        const bigK = new BigNumber(i).times(BONE);
        const { res: c, bool: cneg } = bsubSign(a, bigK.minus(BONE));
        term = bmul(term, bmul(c, x));
        term = bdiv(term, bigK);
        if (term.eq(new BigNumber(0))) break;

        if (xneg) negative = !negative;
        if (cneg) negative = !negative;
        if (negative) {
            sum = sum.minus(term);
        } else {
            sum = sum.plus(term);
        }
    }

    return sum;
}

function bsubSign(
    a: BigNumber,
    b: BigNumber
): { res: BigNumber; bool: boolean } {
    if (a.gte(b)) {
        const res = a.minus(b);
        const bool = false;
        return { res, bool };
    } else {
        const res = b.minus(a);
        const bool = true;
        return { res, bool };
    }
}

export function bmul(a: BigNumber, b: BigNumber): BigNumber {
    const c0 = a.times(b);
    const c1 = c0.plus(BONE.div(new BigNumber(2)));
    const c2 = c1.idiv(BONE);
    return c2;
}

export function bdiv(a: BigNumber, b: BigNumber): BigNumber {
    const c0 = a.times(BONE);
    const c1 = c0.plus(b.div(new BigNumber(2)));
    const c2 = c1.idiv(b);
    console.log(
        "c2",
        a.toString(),
        b.toString(),
        c0.toString(),
        c1.toString(),
        c2.toString()
    );
    return c2;
}
