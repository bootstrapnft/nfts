import { Fragment, useEffect, useState } from "react";
import arrowLeft from "@/assets/icon/arrow-down.svg";
import close from "@/assets/icon/close.svg";
import SelectToken from "@/pages/pool/create/select-token";
import tokenList from "@/config/tokens.json";
import rinkeby from "@/config/rinkeby.json";
import { useWeb3React } from "@web3-react/core";
import { BigNumber, Contract, ethers } from "ethers";
import ERC20ABI from "@/contract/ERC20.json";
import DSProxyRegistryABI from "@/contract/pool/DSProxyRegistry.json";
import BActionABI from "@/contract/pool/BAction.json";
import DSProxyABI from "@/contract/pool/DSProxy.json";
import { Interface } from "ethers/lib/utils";

const PoolCreate = () => {
  const { account, library } = useWeb3React();
  const [proxyAddress, setProxyAddress] = useState("");
  const [tokensInfo, setTokensInfo] = useState<any[]>([]);
  const [selectTokens, setSelectTokens] = useState<any[]>([]);
  const [showSelectToken, setShowSelectToken] = useState(false);
  const [selectTokenIndex, setSelectTokenIndex] = useState(0);
  const [tokensBalance, setTokensBalance] = useState<{ [key: string]: any }>(
    {}
  );
  const [tokensAllowance, setTokensAllowance] = useState<{
    [key: string]: any;
  }>({});
  const [weights, setWeights] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    console.log("SelectToken1");
    const tokens = tokenList.tokens as unknown as { [key: string]: any };
    const tokenInfo: any[] = [];
    Object.keys(tokens).forEach((key) => {
      tokenInfo.push(tokens[key] as any);
    });
    getPrice(tokenInfo);
    getProxyAddress();

    const balances: { [key: string]: any } = {};
    Promise.all(
      tokenInfo.map(async (token: any) => {
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
    getTokensAllowance();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPrice = async (tokens: any[]) => {
    document.title = "Create Pool";
    const idString = "weth,dai,usd-coin,balancer";
    const ENDPOINT = "https://api.coingecko.com/api/v3";
    const url = `${ENDPOINT}/simple/price?ids=${idString}&vs_currencies=usd`;
    const response = await fetch(url);
    const data = await response.json();
    console.log("price", data);
    const temp = tokens.map((token: any) => {
      token.price = data[token.id].usd;
      return token;
    });
    setTokensInfo(temp);
    const selectTokens = temp.slice(0, 2);
    const weights: { [key: string]: any } = {};
    selectTokens.forEach((token: any, index) => {
      weights[token.id] = index === 0 ? 10 : 40;
    });
    setWeights(weights);
    setTimeout(() => {
      const ps = selectTokens.map((token: any) => {
        token.percentage = getPercentage(token);
        return token;
      });
      setSelectTokens(ps);
    }, 1000);
  };

  const getBalance = async (token: any) => {
    const contract = new Contract(token.address, ERC20ABI, library.getSigner());
    return await contract.balanceOf(account);
  };

  const showToken = (index: number) => {
    setSelectTokenIndex(index);
    setShowSelectToken(true);
  };

  const handleSelectToken = (token: any) => {
    const tokens = selectTokens;
    tokens[selectTokenIndex] = token;
    setSelectTokens(tokens);
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
    const contract = new Contract(
      rinkeby.addresses.dsProxyRegistry,
      DSProxyRegistryABI,
      library.getSigner()
    );
    await contract.proxies(account).then((res: any) => {
      console.log("proxy", res);
      setProxyAddress(res);
    });
  };

  const setupProxy = async () => {
    const contract = new Contract(
      rinkeby.addresses.dsProxyRegistry,
      DSProxyRegistryABI,
      library.getSigner()
    );
    const tx = await contract.build();
    await tx.wait().then((res: any) => {
      console.log("set up proxy:", res);
    });
  };

  const getTokensAllowance = async () => {
    const tokensAllowance: { [key: string]: any } = {};
    Promise.all(
      tokensInfo.map(async (token: any) => {
        const contract = new Contract(
          token.address,
          ERC20ABI,
          library.getSigner()
        );
        await contract
          .allowance(account, proxyAddress)
          .then((res: any) => {
            tokensAllowance[token.id] = ethers.utils.formatUnits(
              res,
              token.decimals
            );
          })
          .catch((err: any) => {
            console.log("tokensAllowance err", err);
          });
      })
    ).then(() => {
      console.log("tokensAllowance", tokensAllowance);
      setTokensAllowance(tokensAllowance);
    });
  };

  const approve = async (token: any) => {
    const contract = new Contract(token.address, ERC20ABI, library.getSigner());
    const tx = await contract.approve(
      proxyAddress,
      ethers.constants.MaxUint256
    );
    await tx
      .wait()
      .then((res: any) => {
        console.log("approve:", res);
      })
      .catch((err: any) => {
        console.log("approve error:", err);
      });
  };

  const createPool = async () => {
    const NUMERIC_PRECISION = BigNumber.from(1e12);
    console.log("createPool", NUMERIC_PRECISION.toString(), selectTokens);

    const weights = selectTokens.map((token: any) => {
      const weight =
        Math.round(Number(token.percentage) * NUMERIC_PRECISION.toNumber()) /
        NUMERIC_PRECISION.mul(2).toNumber();
      return ethers.utils.parseEther(weight.toString()).toString();
    });

    const poolTokenSymbol = "NWB";
    const poolTokenName = "nwba";
    const minimumWeightChangeBlockPeriod = "10";
    const addTokenTimeLockInBlocks = "10";
    const initialSupply = ethers.utils.parseEther("100").toString();
    const swapFee = ethers.utils.parseEther("0.15").div(100).toString();

    const amounts = {
      "0x09fAdc33B8cD696A61b904E85990dDdee1A6a48E": ethers.utils
        .parseEther("50")
        .toString(),
      "0x6C97D2dda691c7eeeffCF7FF561D9CC596c94739": ethers.utils
        .parseEther("1518")
        .toString(),
    };

    const tokenBal = [ethers.utils.parseEther("100").toString(), "399600798"];

    const tokens = [selectTokens[0].address, selectTokens[1].address];

    const rights = {
      canAddRemoveTokens: true,
      canChangeCap: true,
      canChangeSwapFee: true,
      canChangeWeights: true,
      canPauseSwapping: true,
      canWhitelistLPs: true,
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

    const crpFactory = rinkeby.addresses.crpFactory;
    const bFactory = rinkeby.addresses.bFactory;
    const ifac = new Interface(BActionABI);
    console.log("ifac", [crpFactory, bFactory, poolParams, crpParams, rights]);
    const data = ifac.encodeFunctionData("createSmartPool", [
      crpFactory,
      bFactory,
      poolParams,
      crpParams,
      rights,
    ]);

    console.log("proxy address", proxyAddress, rinkeby.addresses.bActions);
    const contract = new Contract(
      proxyAddress,
      DSProxyABI,
      library.getSigner()
    );
    const tx = await contract.execute(rinkeby.addresses.bActions, data);

    await tx
      .wait()
      .then((res: any) => {
        console.log("createPool:", res);
      })
      .catch((err: any) => {
        console.log("createPool error:", err);
      });
  };

  const getPercentage = (token: any) => {
    let totalWeight = 0;
    Object.keys(weights).forEach((key: string) => {
      totalWeight += weights[key];
    });
    const tWeight = totalWeight;
    return tWeight === 0 ? 0 : (weights[token.id] / tWeight) * 100;
  };

  return (
    <Fragment>
      <main className="flex-1 flex flex-col px-4 xl:px-8 2xl:p-12 pt-12 pb-28 text-purple-second">
        <section>
          <h1 className="text-purple-second font-bold text-lg">PoolCreate</h1>
          <div className="border border-gray-400 rounded mt-4">
            <div className="flex items-center px-4 py-3 text-right">
              <div className="flex-auto text-left">Asset</div>
              <div className="">My Balance</div>
              <div className="w-1/12">Weights</div>
              <div className="w-1/12">Percent</div>
              <div className="w-1/12">Amount</div>
              <div className="w-1/12">Price</div>
              <div className="w-1/12">Total</div>
              <div className="w-1/12">option</div>
            </div>
            {selectTokens.map((token: any, index) => {
              return (
                <div className="border-t border-gray-400" key={index}>
                  <div className="px-4 py-4 flex text-right">
                    <div className="flex flex-auto gap-x-2 items-center text-left">
                      <span>
                        <img src={token.logoUrl} className="w-5 h-5" alt="" />
                      </span>
                      <span>{token.symbol}</span>
                      <span
                        className="cursor-pointer"
                        onClick={() => showToken(index)}
                      >
                        <img src={arrowLeft} alt="" className="w-3 h-3" />
                      </span>
                    </div>
                    <div className="w-1/12">
                      {tokensBalance ? tokensBalance[token.id] : 0.0}
                    </div>
                    <div className="w-1/12">
                      <input
                        className="border text-lg font-mono transition-colors w-20 px-2
                                  border-lm-gray-300 rounded-sm  text-gray-700 bg-white focus:outline-none
                                  focus:border-purple-primary focus:ring-0"
                        defaultValue={weights[token.id]}
                      />
                    </div>
                    <div className="w-1/12">{token.percentage}%</div>
                    <div className="w-1/12">
                      <input
                        className="border text-lg font-mono transition-colors w-20 px-2
                                                border-lm-gray-300 rounded-sm  text-gray-700 bg-white focus:outline-none
                                                focus:border-purple-primary focus:ring-0"
                      />
                    </div>
                    <div className="w-1/12">${token.price}</div>
                    <div className="w-1/12">$0</div>
                    <div className="w-1/12 flex justify-end">
                      <img
                        src={close}
                        alt=""
                        className="w-5 h-5 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            className="inline-flex items-center justify-center outline-none font-medium rounded-md
                        break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-2 px-3
                        text-sm bg-gradient-to-b from-purple-primary to-purple-900 text-white mt-4
                        hover:from-purple-primary hover:to-purple-primary whitespace-nowrap"
            onClick={addToken}
          >
            Add Token
          </button>
        </section>
        <div className="mt-5">
          <h1>Swap fee (%)</h1>
          <input
            className="border text-lg font-mono transition-colors
                            border-lm-gray-300 p-2 rounded-sm  text-gray-700 bg-white focus:outline-none
                            focus:border-pink-500 focus:ring-0 mt-1"
            defaultValue="0.15"
          />
        </div>
        <div className="mt-2">
          <h1>Token symbol</h1>
          <input
            className="uppercase border text-lg font-mono transition-colors
                            border-lm-gray-300 p-2 rounded-sm  text-gray-700 bg-white focus:outline-none
                            focus:border-pink-500 focus:ring-0 mt-1"
            defaultValue="BPT"
          />
        </div>
        <div className="mt-2">
          <h1>Token name</h1>
          <input
            className="uppercase border text-lg font-mono transition-colors
                            border-lm-gray-300 p-2 rounded-sm  text-gray-700 bg-white focus:outline-none
                            focus:border-pink-500 focus:ring-0 mt-1"
            defaultValue="Balance S"
          />
        </div>
        <div className="mt-2">
          <h1>Initial supply</h1>
          <input
            className="uppercase border text-lg font-mono transition-colors
                            border-lm-gray-300 p-2 rounded-sm  text-gray-700 bg-white focus:outline-none
                            focus:border-pink-500 focus:ring-0 mt-1"
            defaultValue="100"
          />
        </div>
        <div className="mt-2">
          <h1 className="mb-2">Rights</h1>
          <button
            className="inline-flex items-center justify-center outline-none
                            font-medium rounded-md break-word hover:outline focus:outline-none
                            focus:ring-1 focus:ring-opacity-75 py-2 px-3 text-sm bg-transparent
                            border border-pink-500 dark:text-white text-lm-gray-800
                            hover:bg-pink-500 hover:bg-opacity-10 focus:ring-pink-700 mr-2"
          >
            <label className="cursor-pointer inline-flex items-center select-none text-sm w-full">
              <input
                type="checkbox"
                className="rounded-sm h-4 w-4 text-pink-500 bg-transparent border-pink-500 focus:ring-offset-0 focus:outline-none focus:ring-1 focus:ring-pink-700 focus:ring-opacity-30"
                onChange={() => {}}
              />
              <span className="ml-2 overflow-hidden">Can pause swapping</span>
            </label>
          </button>
          <button
            className="inline-flex items-center justify-center outline-none
                            font-medium rounded-md break-word hover:outline focus:outline-none
                            focus:ring-1 focus:ring-opacity-75 py-2 px-3 text-sm bg-transparent
                            border border-pink-500 dark:text-white text-lm-gray-800
                            hover:bg-pink-500 hover:bg-opacity-10 focus:ring-pink-700 mr-2"
          >
            <label className="cursor-pointer inline-flex items-center select-none text-sm w-full">
              <input
                type="checkbox"
                className="rounded-sm h-4 w-4 text-pink-500 bg-transparent border-pink-500 focus:ring-offset-0 focus:outline-none focus:ring-1 focus:ring-pink-700 focus:ring-opacity-30"
                onChange={() => {}}
              />
              <span className="ml-2 overflow-hidden">Can change swap fee</span>
            </label>
          </button>
          <button
            className="inline-flex items-center justify-center outline-none
                            font-medium rounded-md break-word hover:outline focus:outline-none
                            focus:ring-1 focus:ring-opacity-75 py-2 px-3 text-sm bg-transparent
                            border border-pink-500 dark:text-white text-lm-gray-800
                            hover:bg-pink-500 hover:bg-opacity-10 focus:ring-pink-700 mr-2"
          >
            <label className="cursor-pointer inline-flex items-center select-none text-sm w-full">
              <input
                type="checkbox"
                className="rounded-sm h-4 w-4 text-pink-500 bg-transparent border-pink-500 focus:ring-offset-0 focus:outline-none focus:ring-1 focus:ring-pink-700 focus:ring-opacity-30"
                onChange={() => {}}
              />
              <span className="ml-2 overflow-hidden">Can change weights</span>
            </label>
          </button>
          <button
            className="inline-flex items-center justify-center outline-none
                            font-medium rounded-md break-word hover:outline focus:outline-none
                            focus:ring-1 focus:ring-opacity-75 py-2 px-3 text-sm bg-transparent
                            border border-pink-500 dark:text-white text-lm-gray-800
                            hover:bg-pink-500 hover:bg-opacity-10 focus:ring-pink-700 mr-2"
          >
            <label className="cursor-pointer inline-flex items-center select-none text-sm w-full">
              <input
                type="checkbox"
                className="rounded-sm h-4 w-4 text-pink-500 bg-transparent border-pink-500 focus:ring-offset-0 focus:outline-none focus:ring-1 focus:ring-pink-700 focus:ring-opacity-30"
                onChange={() => {}}
              />
              <span className="ml-2 overflow-hidden">Can change tokens</span>
            </label>
          </button>
          <button
            className="inline-flex items-center justify-center outline-none
                            font-medium rounded-md break-word hover:outline focus:outline-none
                            focus:ring-1 focus:ring-opacity-75 py-2 px-3 text-sm bg-transparent
                            border border-pink-500 dark:text-white text-lm-gray-800
                            hover:bg-pink-500 hover:bg-opacity-10 focus:ring-pink-700 mr-2"
          >
            <label className="cursor-pointer inline-flex items-center select-none text-sm w-full">
              <input
                type="checkbox"
                className="rounded-sm h-4 w-4 text-pink-500 bg-transparent border-pink-500 focus:ring-offset-0 focus:outline-none focus:ring-1 focus:ring-pink-700 focus:ring-opacity-30"
                onChange={() => {}}
              />
              <span className="ml-2 overflow-hidden">
                Restrict LPs to a whitelist
              </span>
            </label>
          </button>
          <button
            className="inline-flex items-center justify-center outline-none
                            font-medium rounded-md break-word hover:outline focus:outline-none
                            focus:ring-1 focus:ring-opacity-75 py-2 px-3 text-sm bg-transparent
                            border border-pink-500 dark:text-white text-lm-gray-800
                            hover:bg-pink-500 hover:bg-opacity-10 focus:ring-pink-700 mr-2"
          >
            <label className="cursor-pointer inline-flex items-center select-none text-sm w-full">
              <input
                type="checkbox"
                className="rounded-sm h-4 w-4 text-pink-500 bg-transparent border-pink-500 focus:ring-offset-0 focus:outline-none focus:ring-1 focus:ring-pink-700 focus:ring-opacity-30"
                onChange={() => {}}
              />
              <span className="ml-2 overflow-hidden">
                Can limit total BPT supply
              </span>
            </label>
          </button>
        </div>

        <div className="pt-5 pb-28">
          <button
            className="inline-flex items-center justify-center outline-none font-medium
              rounded-md break-word hover:outline focus:outline-none focus:ring-1
              focus:ring-opacity-75 py-2 px-3 text-sm bg-gradient-to-b from-purple-primary
              to-purple-900 text-white hover:from-purple-primary hover:to-purple-primary
              focus:ring-purple-primary whitespace-nowrap mt-4"
            onClick={setupProxy}
          >
            Setup proxy
          </button>

          <button
            className="inline-flex items-center justify-center outline-none font-medium
              rounded-md break-word hover:outline focus:outline-none focus:ring-1
              focus:ring-opacity-75 py-2 px-3 text-sm bg-gradient-to-b from-purple-primary
              to-purple-900 text-white hover:from-purple-primary hover:to-purple-primary
              focus:ring-purple-primary whitespace-nowrap mt-4"
            onClick={() => approve(selectTokens[1])}
          >
            Unlock DAI
          </button>

          <button
            className="inline-flex items-center justify-center outline-none font-medium
              rounded-md break-word hover:outline focus:outline-none focus:ring-1
              focus:ring-opacity-75 py-2 px-3 text-sm bg-gradient-to-b from-purple-primary
              to-purple-900 text-white hover:from-purple-primary hover:to-purple-primary
              focus:ring-purple-primary whitespace-nowrap mt-4"
            onClick={createPool}
          >
            Create
          </button>
        </div>
      </main>

      {showSelectToken && (
        <SelectToken
          tokensInfo={tokensInfo}
          close={() => setShowSelectToken(false)}
          selectedToken={handleSelectToken}
        />
      )}
    </Fragment>
  );
};

export default PoolCreate;
