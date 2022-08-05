import { Fragment, useEffect, useRef, useState } from "react";
import arrowLeft from "@/assets/icon/arrow-down.svg";
import close from "@/assets/icon/close.svg";
import caution from "@/assets/icon/caution.svg";
import SelectToken from "@/pages/pool/component/select-token";
import config from "@/config";
import { useWeb3React } from "@web3-react/core";
import { BigNumber, Contract, ethers } from "ethers";
import ERC20ABI from "@/contract/ERC20.json";
import DSProxyRegistryABI from "@/contract/pool/DSProxyRegistry.json";
import BActionABI from "@/contract/pool/BAction.json";
import DSProxyABI from "@/contract/pool/DSProxy.json";
import { Interface } from "ethers/lib/utils";
import { useLoading } from "@/context/loading";
import { useNavigate } from "react-router";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { toast } from "react-toastify";
import {
    getTokensPrice,
    tokenListAllowance,
    tokenListBalance,
    tokenListInfo,
} from "@/util/tokens";

const PoolCreate = () => {
    const [, setLoading] = useLoading();
    const navgator = useNavigate();
    const { account, library, active } = useWeb3React();
    const [proxyAddress, setProxyAddress] = useState("");
    const [tokensInfo, setTokensInfo] = useState<any[]>([]);
    const [selectTokens, setSelectTokens] = useState<any[]>([]);
    const [approveTokens, setApproveTokens] = useState<any[]>([]);
    const [selectTokenIndex, setSelectTokenIndex] = useState(0);
    const [showSelectToken, setShowSelectToken] = useState(false);
    const [weights, setWeights] = useState<{ [key: string]: any }>({});
    const [tokenPercent, setTokenPercent] = useState<{ [key: string]: any }>(
        {}
    );
    const [tokenAmount, setTokenAmount] = useState<{ [key: string]: any }>({});
    const [tokensBalance, setTokensBalance] = useState<{ [key: string]: any }>(
        {}
    );
    const [tokensAllowance, setTokensAllowance] = useState<{
        [key: string]: any;
    }>({});
    const [stepType, setStepType] = useState<"SetProxy" | "Approve" | "Create">(
        "SetProxy"
    );

    const [swapFees, setSwapFees] = useState(0.15);
    const [tokenName, setTokenName] = useState("");
    const [tokenSymbol, setTokenSymbol] = useState("");
    const [initSupply, setInitSupply] = useState(100);
    const [changeWightBlock, setChangeWightBlock] = useState(10);
    const [changeTokenBlock, setChangeTokenBlock] = useState(10);
    const [enableWhitelist, setEnableWhitelist] = useState(false);
    const [enablePauseSwap, setEnablePauseSwap] = useState(true);
    const [enableChangeFee, setEnableChangeFee] = useState(false);
    const [enableChangeSupply, setEnableChangeSupply] = useState(false);
    const [enableChangeToken, setEnableChangeToken] = useState(false);
    const [enableChangeWeights, setEnableChangeWeights] = useState(false);
    const priceInterval = useRef<any>(null);

    useEffect(() => {
        (async () => {
            console.log("SelectToken1");
            setLoading(true);
            await tokenListInfo().then((res) => {
                setTokensInfo(res);
                const selectTokens = res.slice(0, 2);
                setSelectTokens(selectTokens);
            });
            await getProxyAddress();
            setLoading(false);
        })();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, account]);

    useEffect(() => {
        priceInterval.current = setInterval(() => {
            if (tokensInfo.length > 0) {
                getTokensPrice(tokensInfo).then((res) => {
                    setTokensInfo(res);
                });
            }
        }, 5000 * 4);

        return () => {
            if (priceInterval.current) {
                clearInterval(priceInterval.current);
            }
        };
    }, []);

    useEffect(() => {
        clacPercent();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weights]);

    useEffect(() => {
        if (selectTokens.length > 0) {
            changeAmount(tokenAmount[selectTokens[0].id], selectTokens[0]);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenPercent]);

    useEffect(() => {
        console.log("set weight");
        tokenListBalance(tokensInfo, account!).then((res) => {
            console.log("token list balance", res);
            setTokensBalance(res);
        });
        selectTokens.forEach((token: any, index) => {
            if (!weights[token.id]) {
                weights[token.id] = index === 0 ? 10 : 40;
            }
            if (!tokenAmount[token.id]) {
                tokenAmount[token.id] = 0;
            }
        });
        setWeights(JSON.parse(JSON.stringify(weights)));
        setTokenAmount(JSON.parse(JSON.stringify(tokenAmount)));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectTokens]);

    useEffect(() => {
        (async () => {
            if (tokensInfo === [] || proxyAddress === "") {
                return;
            }
            if (tokensAllowance !== []) {
                setTokensAllowance({ ...tokensAllowance });
            }
            await tokenListAllowance(tokensInfo, account!, proxyAddress).then(
                (res) => {
                    setTokensAllowance(res);
                }
            );
        })();
    }, [tokensInfo, proxyAddress]);

    useEffect(() => {
        console.log("set step==========:", proxyAddress);
        if (proxyAddress === "") {
            setStepType("SetProxy");
            return;
        }

        checkApprove();
    }, [proxyAddress, selectTokens, tokensAllowance]);

    const clacPercent = () => {
        console.log("clacPercent");
        const percent: { [key: string]: any } = {};
        selectTokens.forEach((token: any) => {
            percent[token.id] = getPercentage(token);
        });
        setTokenPercent(percent);
    };

    const showToken = (index: number) => {
        setSelectTokenIndex(index);
        setShowSelectToken(true);
    };

    const handleSelectToken = (token: any) => {
        const tokens = selectTokens;
        tokens[selectTokenIndex] = token;
        setSelectTokens([...tokens]);
        setShowSelectToken(false);
    };

    const addToken = () => {
        const tokens = tokensInfo.filter((token: any) => {
            return !selectTokens.some((t: any) => {
                return t.id === token.id;
            });
        });
        if (tokens.length === 0) {
            return;
        }
        setSelectTokens([...selectTokens, tokens[0]]);
    };

    const getProxyAddress = async () => {
        if (!active) {
            return;
        }
        const contract = new Contract(
            config.addresses.dsProxyRegistry,
            DSProxyRegistryABI,
            library.getSigner()
        );
        await contract.proxies(account).then((res: any) => {
            console.log("proxy", res);
            if (res === "0x0000000000000000000000000000000000000000") {
                return;
            }
            setProxyAddress(res);
        });
    };

    const setupProxy = async () => {
        try {
            setLoading(true);
            const contract = new Contract(
                config.addresses.dsProxyRegistry,
                DSProxyRegistryABI,
                library.getSigner()
            );
            const tx = await contract.build();
            await tx.wait().then((res: any) => {
                // setProxyAddress(res);
                getProxyAddress();
                setLoading(false);
                console.log("set up proxy:", res);
                toast.success("Setup proxy success");
            });
        } catch (e) {
            console.log("setup proxy err:", e);
            setLoading(false);
            toast.error("Setup proxy failed");
        }
    };

    const checkApprove = () => {
        console.log("checkApprove----", proxyAddress, tokensAllowance);
        if (Object.keys(tokensAllowance).length === 0) {
            return;
        }
        const unApproveToken: any[] = [];
        selectTokens.forEach((token: any) => {
            if (!tokensAllowance[token.id]) {
                unApproveToken.push(token);
            }
            if (!(parseFloat(tokensAllowance[token.id]) > 0)) {
                unApproveToken.push(token);
            }
        });
        if (unApproveToken.length > 0) {
            setStepType("Approve");
        } else {
            setStepType("Create");
        }
        setApproveTokens(unApproveToken);
    };

    const approve = async (token: any) => {
        setLoading(true);
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
                    tokenListAllowance(tokensInfo, account!, proxyAddress).then(
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

    const calcAmount = (token: any) => {
        if (tokenAmount[token.id] === 0) {
            return;
        }
        const unit =
            (tokenAmount[token.id] * token.price) / tokenPercent[token.id];
        const amount = tokenAmount;
        Object.keys(amount).forEach((key: string) => {
            if (key !== token.id) {
                const token = tokensInfo.find((t: any) => t.id === key);
                amount[key] = (
                    (unit * tokenPercent[key]) /
                    token.price
                ).toFixed(5);
            }
        });
        setTokenAmount(JSON.parse(JSON.stringify(amount)));
    };

    const createPool = async () => {
        const NUMERIC_PRECISION = BigNumber.from(1e12);
        console.log("createPool", NUMERIC_PRECISION.toString(), selectTokens);

        const weights = selectTokens.map((token: any) => {
            const weight =
                Math.round(
                    Number(tokenPercent[token.id]) *
                        NUMERIC_PRECISION.toNumber()
                ) / NUMERIC_PRECISION.mul(2).toNumber();
            return ethers.utils.parseEther(weight.toString()).toString();
        });

        const poolTokenSymbol = tokenSymbol.toUpperCase();
        const poolTokenName = tokenName;
        const minimumWeightChangeBlockPeriod = changeWightBlock;
        const addTokenTimeLockInBlocks = changeTokenBlock;
        const initialSupply = ethers.utils
            .parseEther(initSupply + "")
            .toString();
        const swapFee = ethers.utils
            .parseEther(swapFees + "")
            .div(100)
            .toString();

        // const tokenBal = [ethers.utils.parseEther("100").toString(), "399600798"];
        const tokenBal = selectTokens.map((token) => {
            return tranAmount(token.id);
        });

        // const tokens = [selectTokens[0].address, selectTokens[1].address];
        const tokens = selectTokens.map((token) => token.address);

        const rights = {
            canAddRemoveTokens: enableChangeToken,
            canChangeCap: enableChangeSupply,
            canChangeSwapFee: enableChangeFee,
            canChangeWeights: enableChangeWeights,
            canPauseSwapping: enablePauseSwap,
            canWhitelistLPs: enableWhitelist,
        };

        const crpParams = {
            initialSupply,
            minimumWeightChangeBlockPeriod,
            addTokenTimeLockInBlocks,
        };

        const poolParams = {
            poolTokenSymbol,
            poolTokenName,
            constituentTokens: tokens,
            tokenBalances: tokenBal,
            tokenWeights: weights,
            swapFee: swapFee,
        };

        const crpFactory = config.addresses.crpFactory;
        const bFactory = config.addresses.bFactory;
        const ifac = new Interface(BActionABI);
        console.log("ifac", [
            crpFactory,
            bFactory,
            poolParams,
            crpParams,
            rights,
        ]);
        const data = ifac.encodeFunctionData("createSmartPool", [
            crpFactory,
            bFactory,
            poolParams,
            crpParams,
            rights,
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
                    toast.success(`Create smart pool success`);
                    navgator("/pool/explore");
                    console.log("createPool:", res);
                })
                .catch((err: any) => {
                    setLoading(false);
                    console.log("createPool error:", err);
                });
        } catch (e) {
            console.log("create pool err:", e);
            setLoading(false);
            toast.error(`Create smart pool failed`);
        }
    };

    const getPercentage = (token: any) => {
        let totalWeight = 0;
        Object.keys(weights).forEach((key: string) => {
            totalWeight += weights[key];
        });
        const tWeight = totalWeight;
        return tWeight === 0
            ? 0
            : ((weights[token.id] / tWeight) * 100).toFixed(2);
    };

    const changeAmount = (val: string, changeToken: any) => {
        let value = val === "" ? 0 : parseFloat(val);
        if (value < 0) {
            return;
        }
        console.log("tokenAmount", value);
        const amount = tokenAmount;
        amount[changeToken.id] = value;
        Object.keys(amount).forEach((key: string) => {
            if (key !== changeToken.id) {
                const token = tokensInfo.find((t: any) => t.id === key);
                amount[key] = (
                    (((amount[changeToken.id] * changeToken.price) /
                        tokenPercent[changeToken.id]) *
                        tokenPercent[key]) /
                    token.price
                ).toFixed(5);
            }
        });
        console.log("tokenAmount", amount, selectTokens);
        setTokenAmount(JSON.parse(JSON.stringify(amount)));
    };

    const removeToken = (token: any) => {
        const tokens = selectTokens.filter((t: any) => t.id !== token.id);
        setSelectTokens([...tokens]);
        const weight: { [key: string]: any } = {};
        Object.keys(weights).forEach((key: string) => {
            if (key !== token.id) {
                weight[key] = weights[key];
            }
        });
        setWeights(weight);

        const amounts: { [key: string]: any } = {};
        Object.keys(tokenAmount).forEach((key: string) => {
            if (key !== token.id) {
                amounts[key] = tokenAmount[key];
            }
        });
        setTokenAmount(amounts);
    };

    const tranAmount = (key: string) => {
        const amount = tokenAmount[key];
        const decimals = selectTokens.find((t: any) => t.id === key).decimals;
        const res = amount * Math.pow(10, decimals);
        console.log("tranAmount", key, amount, decimals, res, selectTokens);
        return BigNumber.from(res + "").toString();
    };

    const changePrice = (val: string, changeToken: any) => {
        changeToken.price = parseFloat(val);
        const amount = tokenAmount[changeToken.id];
        console.log("changePrice", amount, changeToken);
        if (amount) {
            changeAmount(amount, changeToken);
        }
    };

    const addNewToken = (token: any, balance: any) => {
        console.log("add new token:", token, balance);
        tokensInfo.push(token);
        setTokensInfo([...tokensInfo]);
        tokensBalance[token.address] = balance;
        setTokensBalance({ ...tokensBalance });
        tokenListAllowance(tokensInfo, account!, proxyAddress).then((res) => {
            setTokensAllowance(res);
        });
    };

    const validationError = () => {
        if (selectTokens.length < 2) {
            return "Pool should contain at least 2 tokens";
        }

        let weightError = "";
        selectTokens.forEach((token: any) => {
            if (!weights[token.id]) {
                weightError = "Token Weight can't be empty";
                return;
            }
        });
        if (weightError !== "") {
            return weightError;
        }

        let amountError = "";
        selectTokens.forEach((token: any) => {
            if (parseFloat(tokenAmount[token.id]) <= 0) {
                amountError = "Token Amount can't be empty";
                return;
            }
        });
        if (amountError !== "") {
            return amountError;
        }

        if (swapFees <= 0) {
            return "Swap Fees can't be empty and should be a positive number";
        }

        if (tokenSymbol === "") {
            return "Pool Token Symbol can't be empty";
        }

        if (tokenName === "") {
            return "Pool Token Name can't be empty";
        }

        return "";
    };

    return (
        <Fragment>
            <main className="flex-1 flex flex-col px-4 xl:px-8 2xl:p-12 pt-12 pb-28 text-purple-second">
                <section>
                    <header>
                        <h1 className="font-bold text-3xl mb-2">Create Pool</h1>
                        <p className="mb-4">create pool.</p>
                    </header>
                    <div className="bg-gradient-to-r from-transparent to-purple-primary h-px mb-4"></div>
                    <div className="rounded mt-6 mb-12 p-6 bg-blue-primary">
                        <table className="w-full">
                            <thead className="bg-purple-second bg-opacity-10">
                                <tr className="text-sm font-light">
                                    <th className="text-left w-1/3 h-12 pl-4 rounded-l-lg">
                                        Assets
                                    </th>
                                    <th className="text-right">My Balance</th>
                                    <th className="text-right">Weights</th>
                                    <th className="text-right px-3">Percent</th>
                                    <th className="text-right">Amount</th>
                                    <th className="text-right">Price</th>
                                    <th className="text-right">Total Value</th>
                                    <th className="text-right pr-4 rounded-r-lg"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectTokens.map((token: any, index) => (
                                    <tr
                                        className="text-sm font-light border-b border-purple-second border-opacity-50"
                                        key={index}
                                    >
                                        <td className="text-left w-1/2 h-12 pl-4 flex gap-x-3 items-center">
                                            <span>
                                                {token.logoUrl ? (
                                                    <img
                                                        src={token.logoUrl}
                                                        className="w-5 h-5"
                                                        alt=""
                                                    />
                                                ) : (
                                                    <Jazzicon
                                                        diameter={18}
                                                        seed={jsNumberForAddress(
                                                            token.address
                                                        )}
                                                    />
                                                )}
                                            </span>
                                            <span>{token.symbol}</span>
                                            <span
                                                className="cursor-pointer"
                                                onClick={() => showToken(index)}
                                            >
                                                <img
                                                    src={arrowLeft}
                                                    alt=""
                                                    className="w-3 h-3"
                                                />
                                            </span>
                                        </td>
                                        <td className="text-right px-4">
                                            {tokensBalance
                                                ? tokensBalance[token.address]
                                                : 0.0}
                                        </td>
                                        <td className="text-right">
                                            <input
                                                className="border text-lg font-mono transition-colors w-20 px-2
                                                  border-lm-gray-300 rounded-sm  text-gray-700 bg-white focus:outline-none
                                                  focus:border-purple-primary focus:ring-0 text-center"
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={weights[token.id] || 0}
                                                onChange={(e) => {
                                                    const w = weights;
                                                    const val = parseInt(
                                                        e.target.value
                                                    );
                                                    w[token.id] =
                                                        val < 1 ? 1 : val;
                                                    setWeights(
                                                        JSON.parse(
                                                            JSON.stringify(w)
                                                        )
                                                    );
                                                    calcAmount(token);
                                                }}
                                            />
                                        </td>
                                        <td className="text-right px-3">
                                            {tokenPercent[token.id]} %
                                        </td>
                                        <td className="text-right">
                                            <input
                                                className="border text-lg font-mono transition-colors w-20 px-2
                                                  border-lm-gray-300 rounded-sm  text-gray-700 bg-white focus:outline-none
                                                  focus:border-purple-primary focus:ring-0 text-center"
                                                type="number"
                                                min="0.000001"
                                                step="0.001"
                                                value={
                                                    tokenAmount[token.id] || 0
                                                }
                                                onChange={(e) =>
                                                    changeAmount(
                                                        e.target.value,
                                                        token
                                                    )
                                                }
                                            />
                                        </td>
                                        <td className="text-right pl-4">
                                            $ &nbsp;
                                            <input
                                                className="border text-lg font-mono transition-colors w-20 px-2
                                                        border-lm-gray-300 rounded-sm  text-gray-700 bg-white focus:outline-none
                                                        focus:border-purple-primary focus:ring-0 text-center w-[150px]"
                                                type="number"
                                                min="0.000000000000001"
                                                defaultValue={token.price}
                                                onChange={(e) => {
                                                    changePrice(
                                                        e.target.value,
                                                        token
                                                    );
                                                }}
                                            />
                                        </td>
                                        <td className="text-right px-4 w-1/5">
                                            ${" "}
                                            {(
                                                token.price *
                                                tokenAmount[token.id]
                                            ).toFixed(3)}
                                        </td>
                                        <td className="text-right px-3">
                                            {selectTokens.length > 1 && (
                                                <img
                                                    src={close}
                                                    alt=""
                                                    className="w-5 h-5 cursor-pointer"
                                                    onClick={() =>
                                                        removeToken(token)
                                                    }
                                                />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <button className="btn-primary mt-6" onClick={addToken}>
                            Add Token
                        </button>

                        <div className="flex items-center gap-x-8 mt-10">
                            <div>
                                <h1>Swap fee (%)</h1>
                                <input
                                    className="input-second"
                                    value={swapFees}
                                    type="number"
                                    step="0.0001"
                                    min="0.0001"
                                    max="10"
                                    onChange={(e) => {
                                        if (e.target.value === "") {
                                            return;
                                        }
                                        const val = parseFloat(e.target.value);
                                        setSwapFees(val > 10 ? 10 : val);
                                    }}
                                />
                            </div>
                            <div>
                                <h1>Token symbol</h1>
                                <input
                                    className="input-second"
                                    placeholder="BPT"
                                    onChange={(e) =>
                                        setTokenSymbol(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <h1>Token name</h1>
                                <input
                                    className="input-second"
                                    placeholder="Balance S"
                                    onChange={(e) =>
                                        setTokenName(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <h1>Initial supply</h1>
                                <input
                                    className="input-second"
                                    value={initSupply}
                                    type="number"
                                    min="100"
                                    max="1000000000"
                                    step="100"
                                    onChange={(e) => {
                                        let val = parseInt(e.target.value);
                                        if (val < 100) {
                                            val = 100;
                                        } else {
                                            const v = val % 100;
                                            if (v !== 0) {
                                                val = val - v;
                                            }
                                        }
                                        setInitSupply(val);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="mt-2">
                            <h1 className="mb-2">Rights</h1>
                            <button className="btn-check-box">
                                <label className="cursor-pointer inline-flex items-center select-none text-sm w-full">
                                    <input
                                        type="checkbox"
                                        className="check-box-primary"
                                        onChange={(e) =>
                                            setEnablePauseSwap(e.target.checked)
                                        }
                                    />
                                    <span className="ml-2 overflow-hidden">
                                        Can pause swapping
                                    </span>
                                </label>
                            </button>
                            <button className="btn-check-box">
                                <label className="cursor-pointer inline-flex items-center select-none text-sm w-full">
                                    <input
                                        type="checkbox"
                                        className="check-box-primary"
                                        onChange={(e) =>
                                            setEnableChangeFee(e.target.checked)
                                        }
                                    />
                                    <span className="ml-2 overflow-hidden">
                                        Can change swap fee
                                    </span>
                                </label>
                            </button>
                            <button className="btn-check-box">
                                <label className="cursor-pointer inline-flex items-center select-none text-sm w-full">
                                    <input
                                        type="checkbox"
                                        className="check-box-primary"
                                        onChange={(e) =>
                                            setEnableWhitelist(e.target.checked)
                                        }
                                    />
                                    <span className="ml-2 overflow-hidden">
                                        Restrict LPs to a whitelist
                                    </span>
                                </label>
                            </button>
                            <button className="btn-check-box">
                                <label className="cursor-pointer inline-flex items-center select-none text-sm w-full">
                                    <input
                                        type="checkbox"
                                        className="check-box-primary"
                                        onChange={(e) =>
                                            setEnableChangeSupply(
                                                e.target.checked
                                            )
                                        }
                                    />
                                    <span className="ml-2 overflow-hidden">
                                        Can limit total BPT supply
                                    </span>
                                </label>
                            </button>
                        </div>
                        <div className="mt-6">
                            <button className="btn-check-box">
                                <label className="cursor-pointer inline-flex items-center select-none text-sm w-full">
                                    <input
                                        type="checkbox"
                                        className="check-box-primary"
                                        onChange={(e) =>
                                            setEnableChangeWeights(
                                                e.target.checked
                                            )
                                        }
                                    />
                                    <span className="ml-2 overflow-hidden">
                                        Can change weights
                                    </span>
                                </label>
                            </button>
                            {enableChangeWeights && (
                                <div className="mt-1">
                                    <span className="text-sm block">
                                        Minimum gradual update duration (in
                                        blocks)
                                    </span>
                                    <input
                                        className="input-second py-1"
                                        type="number"
                                        min="0"
                                        step="10"
                                        defaultValue="10"
                                        onChange={(e) =>
                                            setChangeWightBlock(
                                                parseInt(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                            )}
                        </div>
                        <div className="mt-6">
                            <button className="btn-check-box">
                                <label className="cursor-pointer inline-flex items-center select-none text-sm w-full">
                                    <input
                                        type="checkbox"
                                        className="check-box-primary"
                                        onChange={(e) =>
                                            setEnableChangeToken(
                                                e.target.checked
                                            )
                                        }
                                    />
                                    <span className="ml-2 overflow-hidden">
                                        Can change tokens
                                    </span>
                                </label>
                            </button>
                            {enableChangeToken && (
                                <div className="mt-1">
                                    <span className="text-sm block">
                                        Add token time lock (in blocks)
                                    </span>
                                    <input
                                        className="input-second py-1"
                                        type="number"
                                        min="0"
                                        step="10"
                                        defaultValue="10"
                                        onChange={(e) =>
                                            setChangeTokenBlock(
                                                parseInt(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                            )}
                        </div>

                        {validationError() && (
                            <div
                                className="flex items-center gap-x-4 p-2 mt-6 border border-[#EC4E6E] max-w-max
                                rounded-md text-[#EC4E6E]"
                            >
                                <img src={caution} alt="" width={16} />
                                <span>{validationError()}</span>
                            </div>
                        )}

                        <div className="pt-5 pb-28">
                            {stepType === "SetProxy" && (
                                <button
                                    className="btn-primary px-4 py-3"
                                    onClick={setupProxy}
                                    disabled={validationError() !== ""}
                                >
                                    Setup Proxy
                                </button>
                            )}
                            {stepType === "Approve" &&
                                approveTokens.length > 0 && (
                                    <button
                                        className="btn-primary px-4 py-3"
                                        onClick={() =>
                                            approve(approveTokens[0])
                                        }
                                        disabled={validationError() !== ""}
                                    >
                                        Approve {approveTokens[0].name}
                                    </button>
                                )}
                            {stepType === "Create" && (
                                <button
                                    className="btn-primary px-4 py-3"
                                    onClick={createPool}
                                    disabled={validationError() !== ""}
                                >
                                    Create
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {showSelectToken && (
                <SelectToken
                    tokensInfo={tokensInfo}
                    addNewToken={addNewToken}
                    close={() => setShowSelectToken(false)}
                    selectedToken={handleSelectToken}
                    excludeTokens={selectTokens.map((token) => token.address)}
                />
            )}
        </Fragment>
    );
};

export default PoolCreate;
