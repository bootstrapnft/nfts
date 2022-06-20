import arrowDown from "@/assets/icon/arrow-down.svg";
import { useEffect, useState } from "react";
import tokenList from "@/config/tokens.json";
import SwapSelectToken from "@/pages/pool/swap/select-token";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { Contract, ethers } from "ethers";
import ERC20ABI from "@/contract/ERC20.json";
import { useWeb3React } from "@web3-react/core";

const PoolSwap = () => {
    const { active, account, library } = useWeb3React();
    const [swapToAmount, setSwapToAmount] = useState("0");
    const [swapFromAmount, setSwapFromAmount] = useState("0");
    const [changeTokenIndex, setChangeTokenIndex] = useState(0);
    const [showSelectToken, setShowSelectToken] = useState(false);
    const [tokenInfoList, setTokenInfoList] = useState<any[]>([]);
    const [swapToToken, setSwapToToken] = useState<{ [key: string]: any }>({});
    const [swapFromToken, setSwapFromToken] = useState<{ [key: string]: any }>(
        {}
    );
    const [tokensBalance, setTokensBalance] = useState<{ [key: string]: any }>(
        {}
    );

    useEffect(() => {
        const tokens = tokenList.tokens as unknown as { [key: string]: any };
        const tokenInfo: any[] = [];
        Object.keys(tokens).forEach((key) => {
            tokenInfo.push(tokens[key] as any);
        });
        getPrice(tokenInfo);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!active || tokenInfoList.length === 0) {
            return;
        }

        (async () => {
            const balances: { [key: string]: any } = {};
            await Promise.all(
                tokenInfoList.map(async (token: any) => {
                    await getBalance(token)
                        .then((balance: any) => {
                            balances[token.id] = ethers.utils.formatUnits(
                                balance,
                                token.decimals
                            );
                        })
                        .catch((err: any) => {
                            console.log("getBalance err", err);
                        });
                })
            ).then(() => {
                setTokensBalance(balances);
            });
        })();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, account, tokenInfoList]);

    const changeToken = (index: number) => {
        setChangeTokenIndex(index);
        setShowSelectToken(true);
    };

    const getPrice = async (tokens: any[]) => {
        // document.title = "Create Pool";
        const idString = "weth,dai,usd-coin,balancer";
        const ENDPOINT = "https://api.coingecko.com/api/v3";
        const url = `${ENDPOINT}/simple/price?ids=${idString}&vs_currencies=usd`;
        const response = await fetch(url);
        const data = await response.json();
        const temp = tokens.map((token: any) => {
            token.price = data[token.id] ? data[token.id].usd : 0;
            return token;
        });
        setTokenInfoList(temp);
        setSwapFromToken(temp[0]);
        setSwapToToken(temp[1]);
    };

    const handleSelectToken = (token: any) => {
        if (changeTokenIndex === 1) {
            setSwapFromToken(token);
        } else if (changeTokenIndex === 2) {
            setSwapToToken(token);
        }
        setChangeTokenIndex(0);
    };

    const getBalance = async (token: any) => {
        const contract = new Contract(
            token.address,
            ERC20ABI,
            library.getSigner()
        );
        return await contract.balanceOf(account);
    };

    return (
        <main className="flex-1 flex flex-col px-4 xl:px-8 2xl:p-12 pt-12 pb-28 text-purple-second">
            <section className="relative filter z-10 mx-auto bg-blue-primary top-8 rounded-2xl ">
                <div className="flex flex-col gap-3 p-2 md:p-4 pt-4 bg-dark-800 shadow-md shadow-dark-1000">
                    <div className="px-2">
                        <div className="flex items-center justify-between gap-1">
                            <div className="flex gap-4">
                                <div
                                    className="text-base leading-5 font-bold cursor-pointer select-none
                                    text-secondary hover:text-white"
                                >
                                    Swap
                                </div>
                            </div>
                            <div className="flex gap-4"></div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div
                            className="border-purple-primary border-opacity-50 hover:border-opacity-100 rounded-lg
                            border bg-[#181141] p-3 flex flex-col gap-4"
                        >
                            <div
                                className="flex items-center justify-between gap-2 w-max"
                                onClick={() => changeToken(1)}
                            >
                                {swapFromToken ? (
                                    <div
                                        className="flex items-center bg-purple-second bg-opacity-30 hover:bg-dark-700 cursor-pointer
                                            gap-2 px-2 py-2 rounded-full shadow-md"
                                    >
                                        <div className="rounded-full">
                                            <div className="overflow-hidden rounded w-5 h-5">
                                                {swapFromToken.logoUrl ? (
                                                    <img
                                                        alt={
                                                            swapFromToken.symbol
                                                        }
                                                        src={
                                                            swapFromToken.logoUrl
                                                        }
                                                        decoding="async"
                                                        data-nimg="fixed"
                                                        className="rounded-full !rounded-full overflow-hidden"
                                                    />
                                                ) : swapFromToken.address ? (
                                                    <Jazzicon
                                                        diameter={20}
                                                        seed={jsNumberForAddress(
                                                            swapToToken.address
                                                        )}
                                                    />
                                                ) : (
                                                    ""
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-sm leading-5 font-bold text-xl text-white">
                                            {swapFromToken.name}
                                        </div>
                                        <img
                                            src={arrowDown}
                                            alt="arrow down"
                                            className="w-5 h-5 transform rotate-90"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <button
                                            className="btn-primary"
                                            onClick={() =>
                                                setShowSelectToken(true)
                                            }
                                        >
                                            Select a Token
                                            <img
                                                src={arrowDown}
                                                alt="arrow down"
                                                className="w-5 h-5"
                                            />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-1 justify-between items-baseline px-1.5">
                                <div
                                    className="text-2xl leading-7 tracking-[-0.01em] font-bold relative flex items-baseline
                                flex-grow gap-3 overflow-hidden"
                                >
                                    <input
                                        title="Token Amount"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        type="text"
                                        pattern="^[0-9]*[.,]?[0-9]*$"
                                        placeholder="0.00"
                                        min="0"
                                        minLength={1}
                                        maxLength={79}
                                        spellCheck="false"
                                        className="relative font-bold outline-none border-none flex-auto overflow-hidden
                                            overflow-ellipsis focus:placeholder-primary leading-[36px] flex-grow w-full
                                            text-left bg-transparent text-inherit disabled:cursor-not-allowed"
                                        value={swapFromAmount || "0.00"}
                                        onChange={(e) =>
                                            setSwapFromAmount(e.target.value)
                                        }
                                    />
                                    <span
                                        className="text-xs leading-4 font-medium text-secondary absolute bottom-1.5
                                    pointer-events-none left-32"
                                    >
                                        ~$ {swapFromToken.price}
                                    </span>
                                </div>
                                <div
                                    className="text-sm leading-5 font-medium cursor-pointer select-none flex whitespace-nowrap"
                                    role="button"
                                >
                                    Balance:{" "}
                                    {tokensBalance[swapFromToken.id]
                                        ? tokensBalance[swapFromToken.id]
                                        : "0.00"}
                                </div>
                            </div>
                        </div>
                        <div className="z-0 flex justify-center -mt-6 -mb-6">
                            <div
                                role="button"
                                className="p-1.5 rounded-full bg-dark-800 border shadow-md
                                border-purple-primary border-opacity-50 hover:border-opacity-100 hover:bg-purple-primary"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                    width="14"
                                    className="text-high-emphesis hover:text-white"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd"
                                    ></path>
                                </svg>
                            </div>
                        </div>
                        <div
                            className="border-purple-primary border-opacity-50 hover:border-opacity-100 rounded-lg
                            border bg-[#181141] p-3 flex flex-col gap-4"
                        >
                            <div
                                className="flex items-center justify-between gap-x-2 leading-7 w-max"
                                onClick={() => changeToken(2)}
                            >
                                {swapToToken ? (
                                    <div
                                        className="flex items-center bg-purple-second bg-opacity-30 hover:bg-dark-700 cursor-pointer
                                                gap-2 px-2 py-2 rounded-full shadow-md"
                                    >
                                        <div className="rounded-full">
                                            <div className="overflow-hidden rounded w-5 h-5">
                                                {swapToToken.logoUrl ? (
                                                    <img
                                                        alt={swapToToken.symbol}
                                                        src={
                                                            swapToToken.logoUrl
                                                        }
                                                        decoding="async"
                                                        data-nimg="fixed"
                                                        className="rounded-full !rounded-full overflow-hidden"
                                                    />
                                                ) : swapToToken.address ? (
                                                    <Jazzicon
                                                        diameter={20}
                                                        seed={jsNumberForAddress(
                                                            swapToToken.address
                                                        )}
                                                    />
                                                ) : (
                                                    ""
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-sm leading-5 font-bold text-xl text-white">
                                            {swapToToken.name}
                                        </div>
                                        <img
                                            src={arrowDown}
                                            alt="arrow down"
                                            className="w-5 h-5 transform rotate-90"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <button className="btn-primary">
                                            Select a Token
                                            <img
                                                src={arrowDown}
                                                alt="arrow down"
                                                className="w-5 h-5"
                                            />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-1 justify-between items-baseline px-1.5">
                                <div
                                    className="text-2xl leading-7 tracking-[-0.01em] font-bold relative flex items-baseline
                                flex-grow gap-3 overflow-hidden"
                                >
                                    <input
                                        title="Token Amount"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        type="text"
                                        pattern="^[0-9]*[.,]?[0-9]*$"
                                        placeholder="0.00"
                                        min="0"
                                        minLength={1}
                                        maxLength={79}
                                        spellCheck="false"
                                        className="relative font-bold outline-none border-none flex-auto overflow-hidden
                                            overflow-ellipsis focus:placeholder-primary leading-[36px] flex-grow w-full
                                            text-left bg-transparent text-inherit disabled:cursor-not-allowed"
                                        value={swapToAmount || "0.00"}
                                        onChange={(e) =>
                                            setSwapToAmount(e.target.value)
                                        }
                                    />
                                    <span
                                        className="text-xs leading-4 font-medium text-secondary absolute bottom-1.5
                                    pointer-events-none left-32"
                                    >
                                        ~$ {swapToToken.price}
                                    </span>
                                </div>
                                <div
                                    className="text-sm leading-5 font-medium cursor-pointer select-none flex whitespace-nowrap"
                                    role="button"
                                >
                                    Balance:{" "}
                                    {tokensBalance[swapToToken.id]
                                        ? tokensBalance[swapToToken.id]
                                        : "0.00"}
                                </div>
                            </div>
                        </div>
                    </div>
                    {swapFromToken && swapToToken && (
                        <div
                            className="flex items-center justify-between mt-2 border border-purple-primary
                                border-opacity-70 rounded-lg py-2 px-4 text-sm bg-[#181141]"
                        >
                            <div className="">
                                1 {swapFromToken.name} ={" "}
                                {swapFromToken.price / swapToToken.price}{" "}
                                {swapToToken.name}
                                &nbsp; ($ {swapFromToken.price})
                            </div>
                            <div>
                                <img
                                    src={arrowDown}
                                    alt="arrow down"
                                    className="w-5 h-5 transform rotate-90 cursor-pointer"
                                />
                            </div>
                        </div>
                    )}
                    <div className="mx-auto mt-6 mb-6 w-11/12">
                        <button
                            className="w-full py-3 bg-gradient-to-r from-purple-primary to-pink-600 rounded-xl
                        text-white hover:from-purple-900 hover:to-pink-700"
                        >
                            Swap
                        </button>
                    </div>
                </div>
            </section>

            {showSelectToken && (
                <SwapSelectToken
                    tokensInfo={tokenInfoList}
                    close={() => setShowSelectToken(false)}
                    selectedToken={handleSelectToken}
                />
            )}
        </main>
    );
};

export default PoolSwap;
