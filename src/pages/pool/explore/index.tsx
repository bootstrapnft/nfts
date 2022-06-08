import { Fragment } from "react";

const PoolExplore = () => {
  const list = [
    {
      address: "0xc697...9a81",
      swap: "0.1%",
      market: "13.75M",
      liquidity: "-",
      volume: "3.9M",
      symbolA: "AAVE",
      symbolB: "WETH",
    },
    {
      address: "0xd0dd...acd1",
      swap: "0.15%",
      market: "167.27",
      liquidity: "-",
      volume: "-",
      symbolA: "ILV",
      symbolB: "WETH",
    },
    {
      address: "0x6158...dcc5",
      swap: "0.15%",
      market: "22.91",
      liquidity: "-",
      volume: "-",
      symbolA: "USDC",
      symbolB: "GDT",
    },
    {
      address: "0xe669...c6c9",
      swap: "0.5%",
      market: "200.17",
      liquidity: "-",
      volume: "-",
      symbolA: "DG",
      symbolB: "USDC",
    },
    {
      address: "0xf2b5...c1ad",
      swap: "0.9%",
      market: "35.93",
      liquidity: "-",
      volume: "-",
      symbolA: "USDC",
      symbolB: "TIDAL",
    },
  ];
  return (
    <Fragment>
      <main className="flex-1 flex flex-col px-4 xl:px-8 2xl:p-12 py-12 text-[#6D5F68]">
        <section>
          <h1 className="text-gray-900 font-bold text-lg">Pool Explore</h1>
          <div className="border border-gray-400 rounded mt-4">
            <div className="flex items-center px-4 py-3 text-right">
              <div className="text-left w-1/12">Pool address</div>
              <div className="flex-auto text-left">Asset</div>
              <div className="w-1/12">Swap fee</div>
              <div className="w-1/12">Market cap</div>
              <div className="w-1/12">My liquidity</div>
              <div className="w-1/12">Volume (24h)</div>
            </div>
            {list.map((item, index) => {
              return (
                <div className="border-t border-gray-400">
                  <div className="px-4 py-4 flex text-right">
                    <div className="text-left w-1/12">{item.address}</div>
                    <div className="flex flex-auto gap-x-2 items-center text-left">
                      <span>
                        <svg height="20" width="20" viewBox="0 0 20 20">
                          <circle
                            r="5"
                            cx="10"
                            cy="10"
                            fill="transparent"
                            stroke="#6f6776"
                            stroke-offset="0"
                            stroke-width="10"
                            transform="rotate(-90) translate(-20)"
                            className="h-5 w-5"
                            style={{
                              strokeDasharray: "25.1327, 31.4159",
                              strokeDashoffset: 0,
                            }}
                          ></circle>
                          <circle
                            r="5"
                            cx="10"
                            cy="10"
                            fill="transparent"
                            stroke="#433455"
                            stroke-offset="-25.132741228718345"
                            stroke-width="10"
                            transform="rotate(-90) translate(-20)"
                            className="w-5 h-5"
                            style={{
                              strokeDasharray: "6.28319, 31.4159",
                              strokeDashoffset: -25,
                            }}
                          ></circle>
                        </svg>
                      </span>
                      <span> 80% {item.symbolA} </span>
                      <span> 20% {item.symbolB} </span>
                    </div>
                    <div className="w-1/12">{item.swap}</div>
                    <div className="w-1/12">${item.market}</div>
                    <div className="w-1/12">${item.liquidity}</div>
                    <div className="w-1/12">${item.market}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </Fragment>
  );
};

export default PoolExplore;
