import { Fragment } from "react";
import ethereumNft from "@/assets/images/ethereum-nft.svg";

const Vault = () => {
  return (
    <Fragment>
      <main className="flex-1 flex relative flex-wrap md:flex-nowrap">
        <section
          className="border-l relative sm:static pb-12 flex-1 flex flex-col border-r
                    dark:border-gray-600 dark:border-opacity-50 border-gray-300 dark:bg-gray-700 bg-gray-100"
        >
          <header
            className="lg:flex justify-between items-center py-2 px-4 sm:px-6 lg:h-16 dark:bg-gray-800
                        bg-gray-50 sticky top-14 sm:top-18 z-10"
          >
            <div className="flex items-center">
              <div className="inline-flex items-center">
                <img
                  className="w-10 h-10 bg-cover"
                  src="https://res.cloudinary.com/nftx/image/fetch/w_150,h_150,f_auto/https://raw.githubusercontent.com/NFTX-project/nftx-assets/main/vaults-v2/0/256x256.png"
                  alt="PUNK"
                />
                <div className="flex-1 ml-2 overflow-hidden">
                  <h4 className="text-lg font-bold leading-tight">PUNK</h4>
                  <p
                    className="text-sm dark:text-white text-lm-gray-900 text-opacity:20
                                        dark:text-opacity-80 truncate"
                  >
                    CryptoPunks
                  </p>
                </div>
              </div>
              <div className="ml-4">
                <div
                  data-for="vault.header.buy.price"
                  data-tip="All items share the same Buy Now price"
                  className="cursor-help flex justify-between lg:mt-0 rounded-md dark:text-white
                                        text-lm-gray-700 dark:bg-gray-900 bg-lm-gray-100 border dark:border-gray-800
                                        border-gray-100 p-2 mr-2"
                >
                  <div className="text-base flex items-center truncate">
                    <img
                      src={ethereumNft}
                      className="w-5 h-5 -ml-0.5 mr-0.5"
                      alt="ETH"
                    />
                    <span className="font-mono">46.640</span>
                  </div>
                  <div
                    className="__react_component_tooltip t338ba94f-0d1c-477c-bd22-c17e6d5c6a28 place-right type-custom flex-none text-sm"
                    id="vault.header.buy.price"
                    data-id="tooltip"
                    style={{ left: "552px", top: "111px" }}
                  >
                    All items share the same Buy Now price
                  </div>
                </div>
              </div>
              <div className="flex items-center md:hidden ml-auto">
                <button className="inline-flex items-center justify-center outline-none font-medium rounded-md break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-1.5 px-2 text-xs bg-white text-gray-900 hover:bg-gray-100 focus:ring-gray-300 dark:bg-gray-700 dark:text-white text-sm p-2 rounded">
                  Filters
                </button>
              </div>
            </div>
            <div className="xl:ml-2 mt-2 lg:mt-0 flex-none flex flex-nowrap space-x-2 justify-between">
              <a
                href="/vault/0x269616d549d7e8eaa82dfb17028d0b212d11232a/buy/"
                className="inline-flex items-center justify-center outline-none font-medium rounded-md break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-2 px-3 text-sm bg-transparent border border-pink-500 dark:text-white text-lm-gray-800 hover:bg-pink-500 hover:bg-opacity-10 focus:ring-pink-700 bg-pink-500 bg-opacity-10 flex-1"
              >
                Buy
              </a>
              <a
                href="/vault/0x269616d549d7e8eaa82dfb17028d0b212d11232a/sell/"
                className="inline-flex items-center justify-center outline-none font-medium rounded-md break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-2 px-3 text-sm bg-transparent dark:text-white text-lm-gray-900 border border-transparent hover:border-opacity-50 hover:border-pink-500 focus:ring-pink-700 flex-1"
              >
                Sell
              </a>
              <a
                href="/vault/0x269616d549d7e8eaa82dfb17028d0b212d11232a/swap/"
                className="inline-flex items-center justify-center outline-none font-medium rounded-md break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-2 px-3 text-sm bg-transparent dark:text-white text-lm-gray-900 border border-transparent hover:border-opacity-50 hover:border-pink-500 focus:ring-pink-700 flex-1"
              >
                Swap
              </a>
              <a
                href="/vault/0x269616d549d7e8eaa82dfb17028d0b212d11232a/stake/"
                className="inline-flex items-center justify-center outline-none font-medium rounded-md break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-2 px-3 text-sm bg-transparent dark:text-white text-lm-gray-900 border border-transparent hover:border-opacity-50 hover:border-pink-500 focus:ring-pink-700 flex-1"
              >
                Stake
              </a>
              <a
                href="/vault/0x269616d549d7e8eaa82dfb17028d0b212d11232a/info/"
                className="inline-flex items-center justify-center outline-none font-medium rounded-md break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-2 px-3 text-sm bg-transparent dark:text-white text-lm-gray-900 border border-transparent hover:border-opacity-50 hover:border-pink-500 focus:ring-pink-700 flex-1"
              >
                Info
              </a>
            </div>
          </header>
        </section>
      </main>
    </Fragment>
  );
};

export default Vault;
