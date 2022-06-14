import { Fragment, useEffect, useState } from "react";
import { gql, request } from "graphql-request";
import rinkby from "@/config/rinkeby.json";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { truncateAddress } from "@/util/address";
import Liquidity from "@/pages/pool/manage/liquidity";
import Tokens from "@/config/tokens.json";
import { ethers } from "ethers";

const enum InfoBtn {
  Swap = "swap",
  Balance = "balance",
  About = "about",
}

const PoolManage = () => {
  const [infoBtn, setInfoBtn] = useState<InfoBtn>(InfoBtn.Balance);
  const [pool, setPool] = useState<any>(undefined);
  const [swaps, setSwaps] = useState<any>(undefined);
  const [openLiquidity, setOpenLiquidity] = useState(false);
  useEffect(() => {
    getInfo();
    getSwap();
  }, []);

  const getInfo = () => {
    const query = gql`
      {
        pool(id: "0xcd76538024e49fc42b8afa3c078adf73d2ae2ea7") {
          id
          controller
          finalized
          crp
          swapFee
          totalWeight
          totalSwapVolume
          totalSwapFee
          createTime
          joinsCount
          exitsCount
          liquidity
          tokensList
          swapsCount
          holdersCount
          tx
          rights
          controller
          crpController
          cap
          createTime
          name
          symbol
          tokens(orderBy: "denormWeight", orderDirection: "desc") {
            id
            address
            balance
            decimals
            symbol
            denormWeight
          }
          swaps(
            first: 1
            orderBy: "timestamp"
            orderDirection: "desc"
            where: { timestamp_lt: 1655011996 }
          ) {
            poolTotalSwapVolume
          }
        }
      }
    `;
    request(rinkby.subgraphUrl, query).then((data) => {
      const tokenInfo = Tokens.tokens as unknown as { [key: string]: any };
      data.pool.tokens.map((token: any) => {
        const address = ethers.utils.getAddress(token.address);
        token.color = tokenInfo[address]
          ? tokenInfo[address]["color"]
          : "#7ada6a";
        return token;
      });
      console.log(data);
      setPool(data.pool);
    });
  };

  const getSwap = () => {
    const query = gql`
      {
        swaps(
          where: { poolAddress: "0xcd76538024e49fc42b8afa3c078adf73d2ae2ea7" }
          first: 20
          skip: 0
          orderBy: "timestamp"
          orderDirection: "desc"
        ) {
          id
          tokenIn
          tokenInSym
          tokenAmountIn
          tokenOut
          tokenOutSym
          tokenAmountOut
          poolTotalSwapVolume
          timestamp
          value
          feeValue
        }
      }
    `;

    request(rinkby.subgraphUrl, query).then((data) => {
      console.log(data);
      setSwaps(data.swaps);
    });
  };

  return (
    <Fragment>
      <main className="flex-1 flex flex-col px-4 xl:px-8 2xl:p-12 2xl:pb-28 py-12 text-purple-second">
        <section>
          <header>
            <h1 className="font-bold text-3xl mb-2">Explore Pool</h1>
            {/*<p className="mb-4">Browse the decentralized NFT marketplace.</p>*/}
          </header>
          <div className="bg-gradient-to-r from-transparent to-purple-primary h-px mb-4"></div>
        </section>
        <section>
          <header className="flex justify-between items-center">
            <div className="flex gap-x-2 items-center">
              <img
                src="https://s2.coinmarketcap.com/static/img/coins/64x64/825.png"
                alt=""
                className="h-8 w-8"
              />
              <div>
                <div className="flex gap-x-2">
                  {pool && (
                    <h3>
                      {pool.name} ({pool.symbol})
                    </h3>
                  )}
                  <span className="inline-block border border-emerald-primary rounded-full text-xs px-2">
                    smart pool
                  </span>
                </div>
                <p>$0.1277</p>
              </div>
            </div>
            <div className="flex gap-x-2">
              <button
                className="inline-flex items-center justify-center outline-none font-medium
                                rounded-md break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75
                                p-2 bg-gradient-to-b from-purple-primary to-purple-900 text-white hover:from-purple-primary
                                hover:to-purple-primary focus:ring-pink-500 text-sm"
                onClick={() => setOpenLiquidity(true)}
              >
                Add liquidity
              </button>
              <button
                className="inline-flex items-center justify-center outline-none font-medium
                                rounded-md break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75
                                p-2 bg-gradient-to-b hover:from-purple-primary border border-purple-primary text-purple-primary
                                hover:to-purple-primary focus:ring-pink-500 text-sm hover:text-purple-second"
              >
                Remove liquidity
              </button>
            </div>
          </header>
          <div className="flex flex-1 justify-between flex-nowrap mt-5">
            <div className="bg-blue-primary rounded-lg h-32 w-1/5 flex justify-center items-center flex-col">
              <h1 className="font-bold text-2xl">$134.2M</h1>
              <h3>Liquidity</h3>
            </div>

            <div className="bg-blue-primary rounded-lg h-32 w-1/5 flex justify-center items-center flex-col">
              <h1 className="font-bold text-2xl">$134.2M</h1>
              <h3>Volume (24h)</h3>
            </div>

            <div className="bg-blue-primary rounded-lg h-32 w-1/5 flex justify-center items-center flex-col">
              <h1 className="font-bold text-2xl">$134.2M</h1>
              <h3>Swap fee</h3>
            </div>

            <div className="bg-blue-primary rounded-lg h-32 w-1/5 flex justify-center items-center flex-col">
              <h1 className="font-bold text-2xl">$134.2M</h1>
              <h3>My pool share</h3>
            </div>
          </div>

          <div>
            <div className="flex gap-x-10 mt-5 px-2">
              <div
                className="py-2 hover:text-purple-primary cursor-pointer text-purple-primary
                                border-b border-purple-primary border-b-2"
              >
                Liquidity
              </div>
              <div className="py-2 hover:text-purple-primary cursor-pointer">
                Volume
              </div>
              <div className="py-2 hover:text-purple-primary cursor-pointer">
                Fee returns
              </div>
            </div>
            <div className="bg-blue-primary h-72 w-full rounded-lg"></div>
          </div>

          <div>
            <div className="flex gap-x-10 mt-5 px-2">
              <div
                className={`py-2 hover:text-purple-primary cursor-pointer flex items-center gap-x-1
                                ${
                                  infoBtn === InfoBtn.Balance
                                    ? "border-b-2 text-purple-primary border-b border-purple-primary"
                                    : ""
                                }`}
                onClick={() => setInfoBtn(InfoBtn.Balance)}
              >
                Balance{" "}
                <span
                  className="inline-block border border-purple-primary
                                    text-purple-primary rounded-full w-4 h-4 text-xs text-center leading-3"
                >
                  {pool && pool.tokens.length}
                </span>
              </div>
              <div
                className={`py-2 hover:text-purple-primary cursor-pointer flex items-center gap-x-1
                                ${
                                  infoBtn === InfoBtn.Swap
                                    ? "border-b-2 text-purple-primary border-b border-purple-primary"
                                    : ""
                                }`}
                onClick={() => setInfoBtn(InfoBtn.Swap)}
              >
                Swap{" "}
                <span
                  className="inline-block border border-purple-primary
                                    text-purple-primary rounded-full w-4 h-4 text-xs text-center leading-3"
                >
                  {swaps && swaps.length}
                </span>
              </div>
              <div
                className={`py-2 hover:text-purple-primary cursor-pointer
                                ${
                                  infoBtn === InfoBtn.About
                                    ? "border-b-2 text-purple-primary border-b border-purple-primary"
                                    : ""
                                }`}
                onClick={() => setInfoBtn(InfoBtn.About)}
              >
                about
              </div>
            </div>
            <div className="bg-blue-primary pt-8 py-16 px-8 w-full">
              {infoBtn === InfoBtn.Balance && (
                <table className="w-full">
                  <thead className="bg-purple-second bg-opacity-10">
                    <tr className="text-sm font-light">
                      <th className="text-left w-1/2 h-12 pl-4 rounded-l-lg">
                        Token
                      </th>
                      <th className="text-right">Weight</th>
                      <th className="text-right">Pool balance</th>
                      <th className="text-right">My balance</th>
                      <th className="text-right pr-4 rounded-r-lg">
                        My asset value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pool &&
                      pool.tokens.map((token: any, index: number) => {
                        return (
                          <tr
                            className="text-sm font-light border-b border-purple-second border-opacity-50"
                            key={index}
                          >
                            <td className="text-left w-1/2 h-12 pl-4 flex gap-x-3 items-center">
                              {/*<img src="https://s2.coinmarketcap.com/static/img/coins/64x64/825.png" alt=""*/}
                              {/*     className="h-6 w-6"/>*/}
                              <Jazzicon
                                diameter={22}
                                seed={jsNumberForAddress(token.address)}
                              />
                              <span>{token.symbol}</span>
                            </td>
                            <td className="text-right px-4">
                              {token.denormWeight} %
                            </td>
                            <td className="text-right px-4">
                              {parseFloat(token.balance).toFixed(4)}
                            </td>
                            <td className="text-right px-4">-</td>
                            <td className="text-right pr-4">0</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              )}
              {infoBtn === InfoBtn.Swap && (
                <table className="w-full">
                  <thead className="bg-purple-second bg-opacity-10">
                    <tr className="text-sm font-light">
                      <th className="text-left w-1/2 h-12 pl-4 rounded-l-lg">
                        Time
                      </th>
                      <th className="text-left">Trade in</th>
                      <th className="text-left">Trade out</th>
                      <th className="text-right pr-4 rounded-r-lg">Swap fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {swaps &&
                      swaps.map((swap: any, index: number) => {
                        return (
                          <tr
                            className="text-sm font-light border-b border-purple-second border-opacity-50"
                            key={index}
                          >
                            <td className="text-left w-2/3 h-12 pl-4">
                              {new Date(swap.timestamp * 1000).toUTCString()}
                            </td>
                            <td>
                              <div className="flex items-center justify-start gap-x-2 h-12">
                                <Jazzicon
                                  diameter={22}
                                  seed={jsNumberForAddress(swap.tokenIn)}
                                />
                                <div>
                                  {parseFloat(swap.tokenAmountIn).toFixed(3)}
                                </div>
                                <div>{swap.tokenInSym}</div>
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center justify-start gap-x-2 h-12">
                                <Jazzicon
                                  diameter={22}
                                  seed={jsNumberForAddress(swap.tokenOut)}
                                />
                                <div>
                                  {parseFloat(swap.tokenAmountOut).toFixed(3)}
                                </div>
                                <div>{swap.tokenOutSym}</div>
                              </div>
                            </td>
                            <td className="text-right pr-4">
                              $ {swap.feeValue}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              )}
              {infoBtn === InfoBtn.About && pool && (
                <div>
                  <div>
                    <dt className="text-gray-400 text-xs">Pool type</dt>
                    <dd className="text-xl font-medium">Smart pool</dd>
                  </div>
                  <div className="mt-2">
                    <dt className="text-gray-400 text-xs">Rights</dt>
                    {pool.rights.map((item: any, index: number) => {
                      return <dd className="text-lg font-medium">{item}</dd>;
                    })}
                  </div>
                  <div className="mt-2">
                    <dt className="text-gray-400 text-xs">cap</dt>
                    <dd className="text-xl font-medium">{pool.cap}</dd>
                  </div>

                  <div className="mt-2">
                    <dt className="text-gray-400 text-xs">Controller</dt>
                    <dd className="text-xl font-medium flex items-center gap-x-2">
                      <Jazzicon
                        diameter={22}
                        seed={jsNumberForAddress(pool.controller)}
                      />
                      {truncateAddress(pool.controller)}
                    </dd>
                  </div>

                  <div className="mt-2">
                    <dt className="text-gray-400 text-xs">Smart Controller</dt>
                    <dd className="text-xl font-medium flex items-center gap-x-2">
                      <Jazzicon
                        diameter={22}
                        seed={jsNumberForAddress(pool.crpController)}
                      />
                      {truncateAddress(pool.crpController)}
                    </dd>
                  </div>
                  <div className="mt-2">
                    <dt className="text-gray-400 text-xs">Creation date</dt>
                    <dd className="text-xl font-medium">{pool.createTime}</dd>
                  </div>
                  <div className="mt-2">
                    <dt className="text-gray-400 text-xs">Swap fee</dt>
                    <dd className="text-xl font-medium">{pool.swapFee}</dd>
                  </div>
                  <div className="mt-2">
                    <dt className="text-gray-400 text-xs">Total swap volume</dt>
                    <dd className="text-xl font-medium">
                      {pool.totalSwapVolume}
                    </dd>
                  </div>
                  <div className="mt-2">
                    <dt className="text-gray-400 text-xs">Total swap fee</dt>
                    <dd className="text-xl font-medium">{pool.totalSwapFee}</dd>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      {openLiquidity && (
        <Liquidity tokens={pool.tokens} close={() => setOpenLiquidity(false)} />
      )}
    </Fragment>
  );
};

export default PoolManage;
