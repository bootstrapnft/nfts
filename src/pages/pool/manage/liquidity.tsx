import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import Pie from "@/components/pie";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { useWeb3React } from "@web3-react/core";
import { Contract, ethers } from "ethers";
import ERC20ABI from "@/contract/ERC20.json";
import {
    bnum,
    calcPoolTokensByRatio,
    denormalizeBalance,
    scale,
} from "@/util/utils";
import { truncateAddress } from "@/util/address";
import BigNumber from "@/util/bignumber";
import { Interface } from "ethers/lib/utils";
import BActionABI from "@/contract/pool/BAction.json";
import config from "@/config";
import DSProxyABI from "@/contract/pool/DSProxy.json";
import { useLoading } from "@/context/loading";
import { calcPoolOutGivenSingleIn } from "@/util/math";
import { toast } from "react-toastify";
import caution from "@/assets/icon/caution.svg";
import ConfigurableRightsPoolABI from "@/contract/pool/ConfigurableRightsPool.json";
import { tokenListAllowance } from "@/util/tokens";

const Liquidity = ({
    proxyAddress,
    totalShares,
    poolInfo,
    tokens,
    close,
    cap,
}: any) => {
    console.log("Liquidity", tokens, poolInfo, totalShares, cap);
    const BALANCE_BUFFER = 0.01;
    const [, setLoading] = useLoading();
    const { account, active, library } = useWeb3React();
    const [poolTokens, setPoolTokens] = useState<any>();
    const [userLiquidity, setUserLiquidity] = useState<any>();
    const [tokenBalance, setTokenBalance] = useState("0");
    const [isMultiAsset, setIsMultiAsset] = useState(true);
    const [canAddLiquidity, setCanAddLiquidity] = useState(false);
    const [changeTokenAddress, setChangeTokenAddress] = useState("");
    const [amounts, setAmounts] = useState<{ [key: string]: any }>({});
    const [tokensBalance, setTokensBalance] = useState<{ [key: string]: any }>(
        {}
    );
    const [tokensAllowance, setTokensAllowance] = useState<{
        [key: string]: any;
    }>({});
    const [approveTokens, setApproveTokens] = useState<any[]>([]);

    useEffect(() => {
        if (poolInfo) {
            poolTokenBalance();
            canAddLiquidityCheck();
        }
        getTokensBalances();
    }, [account]);

    useEffect(() => {
        (async () => {
            // @ts-ignore
            if (tokens === [] || proxyAddress === "") {
                return;
            }
            // @ts-ignore
            if (tokensAllowance !== []) {
                setTokensAllowance({ ...tokensAllowance });
            }
            await tokenListAllowance(tokens, account!, proxyAddress).then(
                (res) => {
                    setTokensAllowance(res);
                }
            );
        })();
    }, [tokens, proxyAddress]);

    useEffect(() => {
        const poolSharesFrom = parseFloat(tokenBalance);
        const current = poolSharesFrom / parseFloat(totalShares);
        const pt = poolTokens ? bnum(poolTokens).div("1e18").toNumber() : 0;

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
    }, [amounts, tokenBalance]);

    useEffect(() => {
        checkApprove();
    }, [proxyAddress, tokens, tokensAllowance, changeTokenAddress]);

    const canAddLiquidityCheck = async () => {
        console.log(
            "canAddLiquidityCheck",
            poolInfo.rights.includes("canWhitelistLPs")
        );
        if (poolInfo.crp && poolInfo.rights.includes("canWhitelistLPs")) {
            // Need to check if this address is on the LP whitelist
            if (!proxyAddress) {
                setCanAddLiquidity(false);
            }

            const crpContract = new Contract(
                poolInfo.controller,
                ConfigurableRightsPoolABI,
                library.getSigner()
            );
            const isCan = await crpContract.canProvideLiquidity(proxyAddress);
            console.log(
                "canAddLiquidityCheck",
                isCan,
                poolInfo.controller,
                proxyAddress
            );
            setCanAddLiquidity(isCan);
        } else {
            setCanAddLiquidity(true);
        }
    };

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

    const getTokensBalances = async () => {
        const balances: { [key: string]: any } = {};
        await Promise.all(
            tokens.map(async (token: any) => {
                await getBalance(token)
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
        )
            .then(() => {
                setTokensBalance(balances);
                console.log("token balance:", balances);
            })
            .catch((err) => {
                console.log("get balance err:", err);
            });
    };

    const getBalance = async (token: any) => {
        const contract = new Contract(
            token.address,
            ERC20ABI,
            library.getSigner()
        );
        return await contract.balanceOf(account);
    };

    const handleChange = (changedAmount: string, changedToken: any) => {
        const ratio = bnum(changedAmount).div(changedToken.balance);

        if (isMultiAsset) {
            const poolTokens = calcPoolTokensByRatio(ratio, totalShares);
            console.log("poolTokens:", poolTokens, ratio, totalShares);
            setPoolTokens(poolTokens);
        } else {
            const tokenIn = poolInfo.tokens.find(
                (token: any) => token.address === changeTokenAddress
            );
            const amount = new BigNumber(changedAmount);
            const maxInRatio = 1 / 2;
            if (amount.div(tokenIn.balance).gt(maxInRatio)) {
                return;
            }

            const tokenBalanceIn = denormalizeBalance(
                tokenIn.balance,
                tokenIn.decimals
            );
            const tokenWeightIn = bnum(tokenIn.denormWeight).times("1e18");
            const poolSupply = denormalizeBalance(totalShares, 18);
            const totalWeight = bnum(poolInfo.totalWeight).times("1e18");
            const tokenAmountIn = denormalizeBalance(
                amount,
                tokenIn.decimals
            ).integerValue(BigNumber.ROUND_UP);
            const swapFee = bnum(poolInfo.swapFee).times("1e18");

            const poolTokens = calcPoolOutGivenSingleIn(
                tokenBalanceIn,
                tokenWeightIn,
                poolSupply,
                totalWeight,
                tokenAmountIn,
                swapFee
            ).toString();
            setPoolTokens(poolTokens);
            amounts[changedToken.address] = changedAmount;
        }

        tokens.forEach((token: any) => {
            if (!isMultiAsset) {
                return;
            }
            if (token.address === changedToken.address) {
                amounts[token.address] = changedAmount;
            } else {
                amounts[token.address] = ratio.isNaN()
                    ? ""
                    : ratio.times(token.balance).toString();
            }
        });
        setAmounts({ ...amounts });
    };

    const changeAmount = async () => {
        if (isMultiAsset) {
            const params = {
                poolAddress: poolInfo.controller,
                poolAmountOut: poolTokens,
                maxAmountsIn: poolInfo.tokensList.map((tokenAddress: any) => {
                    const token = poolInfo.tokens.find(
                        (token: any) => token.address === tokenAddress
                    );
                    const amount = bnum(amounts[token.address]);
                    const inputAmountIn = denormalizeBalance(
                        amount,
                        token.decimals
                    )
                        .div(1 - BALANCE_BUFFER)
                        .integerValue(BigNumber.ROUND_UP);
                    const balanceAmountIn = bnum(
                        scale(
                            bnum(tokensBalance[token.address]),
                            token.decimals
                        )
                    );
                    const tokenAmountIn = BigNumber.min(
                        inputAmountIn,
                        balanceAmountIn
                    );
                    return tokenAmountIn.toString();
                }),
                isCrp: poolInfo.crp,
            };
            handleMultiAsset(params);
        } else {
            const tokenIn = poolInfo.tokens.find(
                (token: any) => token.address === changeTokenAddress
            );
            const tokenAmountIn = denormalizeBalance(
                amounts[tokenIn.address],
                tokenIn.decimals
            )
                .integerValue(BigNumber.ROUND_UP)
                .toString();
            const minPoolAmountOut = bnum(poolTokens)
                .times(1 - BALANCE_BUFFER)
                .integerValue(BigNumber.ROUND_UP)
                .toString();

            console.log("token in minPoolAmountOut:", minPoolAmountOut);
            console.log("token in poolTokens:", poolTokens);

            const params = {
                poolAddress: poolInfo.controller,
                tokenInAddress: changeTokenAddress,
                tokenAmountIn: tokenAmountIn.toString(),
                minPoolAmountOut: minPoolAmountOut.toString(),
            };
            handeSingleAsset(params);
        }
    };

    const handleMultiAsset = async (params: any) => {
        console.log("handleMultiAsset:", params);
        const ifac = new Interface(BActionABI);
        const data = ifac.encodeFunctionData("joinSmartPool", [
            params.poolAddress,
            params.poolAmountOut,
            params.maxAmountsIn,
        ]);

        setLoading(true);
        console.log("proxy address", proxyAddress, config.addresses.bActions);
        try {
            const contract = new Contract(
                proxyAddress,
                DSProxyABI,
                library.getSigner()
            );
            const tx = await contract.execute(config.addresses.bActions, data);
            console.log("tx:", tx);
            await tx
                .wait()
                .then((res: any) => {
                    setLoading(false);
                    console.log("add liquidity:", res);
                    toast.success("Successfully added liquidity");
                    close();
                })
                .catch((err: any) => {
                    setLoading(false);
                    console.log("add liquidity error:", err);
                });
        } catch (e) {
            console.log("add liquidity err:", e);
            setLoading(false);
            toast.error("Error adding liquidity");
        }
    };

    const handeSingleAsset = async (params: any) => {
        console.log(
            "handeSingleAsset params:",
            params,
            params.tokenAmountIn,
            params.minPoolAmountOut
        );
        const ifac = new Interface(BActionABI);
        const data = ifac.encodeFunctionData("joinswapExternAmountIn", [
            params.poolAddress,
            params.tokenInAddress,
            params.tokenAmountIn,
            params.minPoolAmountOut,
        ]);

        setLoading(true);
        console.log("proxy address", proxyAddress, config.addresses.bActions);
        try {
            const contract = new Contract(
                proxyAddress,
                DSProxyABI,
                library.getSigner()
            );
            const tx = await contract.execute(config.addresses.bActions, data);
            console.log("tx:", tx);
            await tx
                .wait()
                .then((res: any) => {
                    setLoading(false);
                    console.log("add liquidity:", res);
                    toast.success("Successfully added liquidity");
                    close();
                })
                .catch((err: any) => {
                    setLoading(false);
                    console.log("add liquidity error:", err);
                });
        } catch (e) {
            console.log("add liquidity err:", e);
            setLoading(false);
            toast.error("Error adding liquidity");
        }
    };

    const validationError = () => {
        let amountError = "";
        if (Object.keys(amounts).length === 0) {
            amountError = "Amount can't be empty";
            return amountError;
        }

        Object.keys(amounts).forEach((key: any) => {
            if (parseFloat(tokensBalance[key]) < parseFloat(amounts[key])) {
                amountError = "Amount can't be greater than balance";
                return;
            }
        });

        Object.keys(amounts).forEach((key: any) => {
            if (amounts[key] < 0) {
                amountError = "Amount should be a positive number";
                return;
            }
        });

        if (userLiquidity.absolute.future > cap) {
            amountError =
                "You can't add liquidity more than your liquidity cap";
        }

        if (proxyAddress === "0x0000000000000000000000000000000000000000") {
            amountError = "Please create first proxy";
        }

        return amountError;
    };

    const checkApprove = () => {
        console.log("checkApprove----", proxyAddress, tokensAllowance);
        if (Object.keys(tokensAllowance).length === 0) {
            return;
        }
        const unApproveToken: any[] = [];
        if (isMultiAsset) {
            tokens.forEach((token: any) => {
                if (!tokensAllowance[token.id]) {
                    unApproveToken.push(token);
                }
                if (!(parseFloat(tokensAllowance[token.id]) > 0)) {
                    unApproveToken.push(token);
                }
            });
        } else {
            if (!tokensAllowance[changeTokenAddress]) {
                unApproveToken.push(
                    tokens.filter(
                        (token: any) => token.address === changeTokenAddress
                    )[0]
                );
            }
            if (!(parseFloat(tokensAllowance[changeTokenAddress]) > 0)) {
                unApproveToken.push(
                    tokens.filter(
                        (token: any) => token.address === changeTokenAddress
                    )[0]
                );
            }
        }
        console.log("unApproveToken:", unApproveToken);

        setApproveTokens(unApproveToken);
    };

    const approve = async (token: any) => {
        setLoading(true);
        console.log("approve token:", token, proxyAddress);
        try {
            const contract = new Contract(
                token.address,
                ERC20ABI,
                library.getSigner()
            );
            const tx = await contract.approve(
                proxyAddress,
                ethers.constants.MaxUint256
            );
            await tx
                .wait()
                .then((res: any) => {
                    console.log("approve:", res);
                    tokenListAllowance(tokens, account!, proxyAddress).then(
                        (res) => {
                            setTokensAllowance(res);
                        }
                    );
                    setLoading(false);
                    toast.success(`Approve ${token.symbol} success`);
                })
                .catch((err: any) => {
                    setLoading(false);
                    console.log("approve error:", err);
                });
        } catch (e) {
            console.log("approve err:", e);
            setLoading(false);
            toast.error(`Approve ${token.symbol} failed`);
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
                                        Add Liquidity
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
                                                    setAmounts({});
                                                    setChangeTokenAddress("");
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
                                                    setAmounts({});
                                                    setApproveTokens([]);
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
                                                        <dd
                                                            className="text-center mt-2"
                                                            key={token.symbol}
                                                        >
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
                                                                    Wallet
                                                                    balance
                                                                </th>
                                                                <th className="text-right pr-4 rounded-r-lg">
                                                                    Deposit
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
                                                                            className="text-sm font-light border-b border-purple-second border-opacity-50"
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            <td>
                                                                                <div className="flex items-center justify-start gap-x-2 h-12">
                                                                                    {!isMultiAsset && (
                                                                                        <input
                                                                                            type="radio"
                                                                                            checked={
                                                                                                changeTokenAddress ===
                                                                                                token.address
                                                                                            }
                                                                                            onChange={() => {
                                                                                                setChangeTokenAddress(
                                                                                                    token.address
                                                                                                );
                                                                                                setAmounts(
                                                                                                    {}
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
                                                                                {parseFloat(
                                                                                    tokensBalance[
                                                                                        token
                                                                                            .address
                                                                                    ]
                                                                                ).toFixed(
                                                                                    3
                                                                                )}
                                                                            </td>
                                                                            <td className="text-right px-4">
                                                                                {isMultiAsset ||
                                                                                (!isMultiAsset &&
                                                                                    changeTokenAddress ===
                                                                                        token.address) ? (
                                                                                    <input
                                                                                        className="border text-lg font-mono transition-colors w-20 px-2
                                                  border-lm-gray-300 rounded-sm  text-gray-700 bg-white focus:outline-none
                                                  focus:border-purple-primary focus:ring-0 text-center"
                                                                                        type="number"
                                                                                        placeholder="0.0"
                                                                                        value={
                                                                                            amounts[
                                                                                                token
                                                                                                    .address
                                                                                            ]
                                                                                        }
                                                                                        onChange={(
                                                                                            e
                                                                                        ) =>
                                                                                            handleChange(
                                                                                                e
                                                                                                    .target
                                                                                                    .value,
                                                                                                token
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                ) : (
                                                                                    ""
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                }
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                {userLiquidity && (
                                                    <div className="bg-[#181141] p-4 mt-4 flex justify-between">
                                                        <span>
                                                            {poolInfo.symbol}{" "}
                                                            Amount
                                                        </span>
                                                        <span>
                                                            {parseFloat(
                                                                userLiquidity.absolute.current.toString()
                                                            ).toFixed(3)}
                                                            {" -> "}
                                                            {parseFloat(
                                                                userLiquidity.absolute.future.toString()
                                                            ).toFixed(3)}
                                                            &nbsp;
                                                            {poolInfo.symbol}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {proxyAddress === "" && (
                                            <div
                                                className="flex items-center mx-auto gap-x-4 p-2 mt-6 border
                                                border-[#EC4E6E] max-w-max rounded-md text-[#EC4E6E]"
                                            >
                                                <img
                                                    src={caution}
                                                    alt=""
                                                    width={16}
                                                />
                                                <span>
                                                    Add liquidity require proxy
                                                    address
                                                </span>
                                            </div>
                                        )}
                                        {proxyAddress !== "" &&
                                            !canAddLiquidity && (
                                                <div
                                                    className="flex items-center mx-auto gap-x-4 p-2 mt-6 border
                                                border-[#EC4E6E] max-w-max rounded-md text-[#EC4E6E]"
                                                >
                                                    <img
                                                        src={caution}
                                                        alt=""
                                                        width={16}
                                                    />
                                                    <span>
                                                        The pool controller has
                                                        not enabled adding
                                                        liquidity to this pool
                                                    </span>
                                                </div>
                                            )}
                                        {validationError() && (
                                            <div
                                                className="flex items-center mx-auto gap-x-4 p-2 mt-6 border
                                                border-[#EC4E6E] max-w-max rounded-md text-[#EC4E6E]"
                                            >
                                                <img
                                                    src={caution}
                                                    alt=""
                                                    width={16}
                                                />
                                                <span>{validationError()}</span>
                                            </div>
                                        )}
                                        {approveTokens.length > 0 ? (
                                            <div className="mx-auto w-max mt-4">
                                                <button
                                                    className={`btn-primary  ${
                                                        validationError() !==
                                                            "" ||
                                                        !canAddLiquidity
                                                            ? "cursor-not-allowed"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        approve(
                                                            approveTokens[0]
                                                        )
                                                    }
                                                    disabled={
                                                        validationError() !==
                                                            "" ||
                                                        !canAddLiquidity
                                                    }
                                                >
                                                    Approve{" "}
                                                    {approveTokens[0].symbol}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="mx-auto w-max mt-4">
                                                <button
                                                    className={`btn-primary  ${
                                                        validationError() !==
                                                            "" ||
                                                        !canAddLiquidity
                                                            ? "cursor-not-allowed"
                                                            : ""
                                                    }`}
                                                    onClick={changeAmount}
                                                    disabled={
                                                        validationError() !==
                                                            "" ||
                                                        !canAddLiquidity
                                                    }
                                                >
                                                    Add Liquidity
                                                </button>
                                            </div>
                                        )}
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

export default Liquidity;
