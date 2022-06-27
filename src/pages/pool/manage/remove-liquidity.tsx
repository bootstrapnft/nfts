import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { truncateAddress } from "@/util/address";
import Pie from "@/components/pie";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { Contract, ethers } from "ethers";
import ERC20ABI from "@/contract/ERC20.json";
import BPoolABI from "@/contract/pool/BPool.json";
import { useLoading } from "@/context/loading";
import { useWeb3React } from "@web3-react/core";
import {
    bnum,
    denormalizeBalance,
    normalizeBalance,
    toWei,
} from "@/util/utils";
import { calcSingleOutGivenPoolIn } from "@/util/math";
import { BigNumber } from "bignumber.js";

const RemoveLiquidity = ({
    proxyAddress,
    totalShares,
    poolInfo,
    tokens,
    close,
}: any) => {
    const BALANCE_BUFFER = 0.01;
    const SINGLE_TOKEN_THRESHOLD = 0.99;
    const [, setLoading] = useLoading();
    const { account, active, library } = useWeb3React();
    const [userLiquidity, setUserLiquidity] = useState<any>();
    const [tokenBalance, setTokenBalance] = useState("0");
    const [isMultiAsset, setIsMultiAsset] = useState(true);
    const [changeTokenAddress, setChangeTokenAddress] = useState("");
    const [removeAmount, setRemoveAmounts] = useState("0");
    const [tokenAmount, setTokenAmount] = useState<{ [key: string]: any }>({});

    useEffect(() => {
        if (poolInfo) {
            poolTokenBalance();
        }
    }, [account]);

    useEffect(() => {
        const result: any = {};
        tokens.map((token: any) => {
            result[token.address] = getTokenAmountOut(token);
        });
        setTokenAmount(result);
    }, [removeAmount, changeTokenAddress]);

    useEffect(() => {
        const poolSharesFrom = parseFloat(tokenBalance);
        const current = poolSharesFrom / parseFloat(totalShares);
        const pt = 0;

        const future = (poolSharesFrom + pt) / (totalShares + pt);
        const res = {
            absolute: {
                current: poolSharesFrom,
                future: poolSharesFrom + pt,
            },
            relative: {
                current,
                future,
            },
        };
        setUserLiquidity(res);
    }, [tokenBalance]);

    const poolTokenBalance = async () => {
        const contract = new Contract(
            poolInfo.controller,
            ERC20ABI,
            library.getSigner()
        );
        contract.balanceOf(account).then((res: any) => {
            console.log("balance of:", ethers.utils.formatEther(res));
            setTokenBalance(ethers.utils.formatEther(res));
        });
    };

    const getTokenAmountOut = (token: any) => {
        if (!removeAmount || !parseFloat(removeAmount)) return 0;
        if (isMultiAsset) {
            return (token.balance / totalShares) * parseFloat(removeAmount);
        } else {
            if (changeTokenAddress !== token.address) {
                return 0;
            }
            const tokenOut = poolInfo.tokens.find(
                (token: any) => token.address === changeTokenAddress
            );
            const amount = denormalizeBalance(bnum(removeAmount), 18);

            const tokenBalanceOut = denormalizeBalance(
                tokenOut.balance,
                tokenOut.decimals
            );
            const tokenWeightOut = bnum(tokenOut.denormWeight).times("1e18");
            const poolSupply = denormalizeBalance(totalShares, 18);
            const totalWeight = bnum(poolInfo.totalWeight).times("1e18");
            const swapFee = bnum(poolInfo.swapFee).times("1e18");

            // Need this check here as well (same as in validationError)
            // Otherwise, if amount > poolSupply, ratio is negative, and bpowApprox will not converge
            if (amount.div(poolSupply).gt(SINGLE_TOKEN_THRESHOLD)) {
                return 0;
            }

            const tokenAmountOut = calcSingleOutGivenPoolIn(
                tokenBalanceOut,
                tokenWeightOut,
                poolSupply,
                totalWeight,
                amount,
                swapFee
            );
            const tokenAmountNormalized = normalizeBalance(
                tokenAmountOut,
                tokenOut.decimals
            );
            return tokenAmountNormalized.toNumber().toFixed(3);
        }
    };

    const getMyPoolBalance = (token: any) => {
        if (!tokenBalance && parseFloat(tokenBalance) !== 0) return 0;
        return (parseFloat(tokenBalance) / totalShares) * token.balance;
    };

    const changeAmount = () => {
        const contract = new Contract(
            poolInfo.controller,
            BPoolABI,
            library.getSigner()
        );

        if (isMultiAsset) {
            handleMultiAsset(contract);
        } else {
            handeSingleAsset(contract);
        }
    };

    const handleMultiAsset = async (contract: any) => {
        const minAmountsOut = poolInfo.tokensList.map(() => "0");

        try {
            setLoading(true);
            const tx = await contract.exitPool(
                toWei(removeAmount).toString(),
                minAmountsOut
            );
            await tx
                .wait()
                .then((res: any) => {
                    setLoading(false);
                    close();
                    console.log("remove liquidity:", res);
                })
                .catch((err: any) => {
                    setLoading(false);
                    console.log("remove liquidity error:", err);
                });
        } catch (e) {
            console.log("remove liquidity err:", e);
            setLoading(false);
        }
    };

    const handeSingleAsset = async (contract: any) => {
        const tokenOut = poolInfo.tokens.find(
            (token: any) => token.address === changeTokenAddress
        );
        const minTokenAmountOut = denormalizeBalance(
            tokenAmount[tokenOut.address],
            tokenOut.decimals
        )
            .times(1 - BALANCE_BUFFER)
            .integerValue(BigNumber.ROUND_UP)
            .toString();

        try {
            setLoading(true);
            const tx = await contract.exitswapPoolAmountIn(
                tokenOut.address,
                toWei(removeAmount).toString(),
                minTokenAmountOut
            );
            await tx
                .wait()
                .then((res: any) => {
                    setLoading(false);
                    close();
                    console.log("remove liquidity:", res);
                })
                .catch((err: any) => {
                    setLoading(false);
                    console.log("remove liquidity error:", err);
                });
        } catch (e) {
            console.log("remove liquidity err:", e);
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <Transition appear show={true}>
                <Dialog as="div" className="relative z-10" onClose={close}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-[#181141] bg-opacity-95" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel
                                    className="w-full max-w-3xl transform overflow-hidden rounded-2xl
                                    bg-blue-primary p-6 text-left align-middle shadow-xl transition-all text-purple-second"
                                >
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium font-bold leading-6 text-center"
                                    >
                                        Remove Liquidity
                                    </Dialog.Title>
                                    <section>
                                        <div className="mx-auto border border-purple-primary w-max rounded mt-4">
                                            <button
                                                className={`px-2 py-1 ${
                                                    isMultiAsset
                                                        ? "bg-purple-primary"
                                                        : ""
                                                }`}
                                                onClick={() => {
                                                    setIsMultiAsset(true);
                                                    setRemoveAmounts("0");
                                                }}
                                            >
                                                Multi asset
                                            </button>
                                            <button
                                                className={`px-2 py-1 ${
                                                    isMultiAsset
                                                        ? ""
                                                        : "bg-purple-primary"
                                                }`}
                                                onClick={() => {
                                                    setIsMultiAsset(false);
                                                    setRemoveAmounts("0");
                                                }}
                                            >
                                                Single asset
                                            </button>
                                        </div>
                                        <div className="mt-4 flex gap-x-4">
                                            <dl className="bg-[#181141] p-4 w-max">
                                                <dt className="text-white font-medium">
                                                    POOL OVERVIEW
                                                </dt>
                                                <dd className="mt-4">
                                                    {truncateAddress(
                                                        poolInfo.id
                                                    )}
                                                </dd>
                                                <dd>My share: -</dd>
                                                <dd className="mb-6">
                                                    Swap fee: 0.1%
                                                </dd>
                                                <Pie
                                                    size={114}
                                                    values={tokens}
                                                />
                                                {tokens.map((token: any) => {
                                                    return (
                                                        <dd className="text-center mt-2">
                                                            {parseFloat(
                                                                token.denormWeight
                                                            ).toFixed(3)}
                                                            % {token.symbol}
                                                        </dd>
                                                    );
                                                })}
                                            </dl>
                                            <div className="flex-1">
                                                <div className="bg-[#181141] p-4">
                                                    <table className="w-full">
                                                        <thead className="">
                                                            <tr className="text-sm font-light">
                                                                <th className="text-left w-1/2 h-12 pl-4 rounded-l-lg">
                                                                    Assets
                                                                </th>
                                                                <th className="text-left">
                                                                    My pool
                                                                    balance
                                                                </th>
                                                                <th className="text-right pr-4 rounded-r-lg">
                                                                    Withdrawal
                                                                    amount
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {tokens.map(
                                                                (
                                                                    token: any,
                                                                    index: number
                                                                ) => {
                                                                    return (
                                                                        <tr
                                                                            className={`text-sm font-light border-b 
                                                                            border-purple-second border-opacity-50 
                                                                            ${
                                                                                !isMultiAsset &&
                                                                                token.address ===
                                                                                    changeTokenAddress
                                                                                    ? ""
                                                                                    : "opacity-60"
                                                                            }`}
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            <td>
                                                                                <div className="flex items-center justify-start gap-x-2 h-12">
                                                                                    {!isMultiAsset && (
                                                                                        <input
                                                                                            className="cursor-pointer"
                                                                                            type="radio"
                                                                                            checked={
                                                                                                changeTokenAddress ===
                                                                                                token.address
                                                                                            }
                                                                                            onChange={() => {
                                                                                                setChangeTokenAddress(
                                                                                                    token.address
                                                                                                );
                                                                                            }}
                                                                                        />
                                                                                    )}
                                                                                    <Jazzicon
                                                                                        diameter={
                                                                                            22
                                                                                        }
                                                                                        seed={jsNumberForAddress(
                                                                                            token.address
                                                                                        )}
                                                                                    />
                                                                                    <span>
                                                                                        {
                                                                                            token.symbol
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                            </td>
                                                                            <td>
                                                                                {getMyPoolBalance(
                                                                                    token
                                                                                )}
                                                                            </td>
                                                                            <td className="text-right px-4">
                                                                                {tokenAmount &&
                                                                                tokenAmount[
                                                                                    token
                                                                                        .address
                                                                                ] >
                                                                                    0
                                                                                    ? tokenAmount[
                                                                                          token
                                                                                              .address
                                                                                      ]
                                                                                    : "-"}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                }
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                {userLiquidity && (
                                                    <div className="bg-[#181141] p-4 mt-4 flex justify-between items-center">
                                                        <span>
                                                            {poolInfo.symbol}{" "}
                                                            Amount
                                                        </span>
                                                        <span>
                                                            {parseFloat(
                                                                userLiquidity.absolute.current.toString()
                                                            ).toFixed(3)}
                                                            {poolInfo.symbol}
                                                        </span>
                                                        <input
                                                            type="number"
                                                            className="input-second py-0 px-1"
                                                            value={
                                                                removeAmount ||
                                                                0
                                                            }
                                                            onChange={(e) => {
                                                                setRemoveAmounts(
                                                                    e.target
                                                                        .value
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mx-auto w-max mt-4">
                                            <button
                                                className="btn-primary"
                                                onClick={changeAmount}
                                            >
                                                Remove Liquidity
                                            </button>
                                        </div>
                                    </section>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </Fragment>
    );
};

export default RemoveLiquidity;
