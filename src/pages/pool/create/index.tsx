import { Fragment, useEffect, useState } from "react";
import arrowLeft from "@/assets/icon/arrow-down.svg";
import close from "@/assets/icon/close.svg";
import SelectToken from "@/pages/pool/create/select-token";
import tokenList from "@/config/tokens.json";

const PoolCreate = () => {
  const [tokensInfo, setTokensInfo] = useState<any[]>([]);
  const [selectTokens, setSelectTokens] = useState<any[]>([]);
  const [showSelectToken, setShowSelectToken] = useState(false);
  const [selectTokenIndex, setSelectTokenIndex] = useState(0);

  useEffect(() => {
    console.log("SelectToken1");
    const tokens = tokenList.tokens as unknown as { [key: string]: any };
    const tokenInfo: any[] = [];
    Object.keys(tokens).forEach((key) => {
      tokenInfo.push(tokens[key] as any);
    });
    getPrice(tokenInfo);
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
    setSelectTokens(temp.slice(0, 2));
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

  return (
    <Fragment>
      <main className="flex-1 flex flex-col px-4 xl:px-8 2xl:p-12 py-12 text-purple-second">
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
                    <div className="w-1/12">0.000</div>
                    <div className="w-1/12">
                      <input
                        className="border text-lg font-mono transition-colors w-20 px-2
                                                border-lm-gray-300 rounded-sm  text-gray-700 bg-white focus:outline-none
                                                focus:border-purple-primary focus:ring-0"
                      />
                    </div>
                    <div className="w-1/12">-</div>
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
