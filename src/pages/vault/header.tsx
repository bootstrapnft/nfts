import ethereumNft from "@/assets/icon/ethereum-nft.svg";
import { useNavigate } from "react-router";
import { Contract } from "ethers";
import Vault from "@/contract/Vault.json";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";

const VaultHeader = ({ address, isManager }: any) => {
  const navigator = useNavigate();
  const { library } = useWeb3React();
  const [vaultName, setVaultName] = useState("");
  const [vaultSymbol, setVaultSymbol] = useState("");

  useEffect(() => {
    getInfo();
  }, []);

  const getInfo = async () => {
    const contract = new Contract(address, Vault, library.getSigner());
    const vaultName = await contract.name();
    const vaultSymbol = await contract.symbol();
    setVaultName(vaultName);
    setVaultSymbol(vaultSymbol);
  };

  return (
    <header
      className="lg:flex justify-between items-center py-2 px-4 sm:px-6 lg:h-16 dark:bg-gray-800
           sticky top-14 sm:top-18 z-10"
    >
      <div className="flex items-center">
        <div className="inline-flex items-center">
          <img
            className="w-10 h-10 bg-cover"
            src="https://res.cloudinary.com/nftx/image/fetch/w_150,h_150,f_auto/https://raw.githubusercontent.com/NFTX-project/nftx-assets/main/vaults-v2/0/256x256.png"
            alt="PUNK"
          />
          <div className="flex-1 ml-2 overflow-hidden">
            <h4 className="text-lg font-bold leading-tight">{vaultName}</h4>
            <p
              className="text-sm dark:text-white text-lm-gray-900 text-opacity:20
                                        dark:text-opacity-80 truncate"
            >
              {vaultSymbol}
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
              className="hidden place-right type-custom flex-none text-sm"
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
        <button
          className="inline-flex items-center justify-center outline-none font-medium rounded-md break-word
                    hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-2 px-3 text-sm bg-transparent
                    border border-pink-500 dark:text-white text-lm-gray-800 hover:bg-pink-500 hover:bg-opacity-10
                    focus:ring-pink-700 bg-pink-500 bg-opacity-10 flex-1"
          onClick={() => navigator(`/vault/${address}/mint`)}
        >
          Mint
        </button>
        <button
          className="inline-flex items-center justify-center outline-none font-medium rounded-md break-word
                        hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-2 px-3 text-sm bg-transparent
                        dark:text-white text-lm-gray-900 border border-transparent hover:border-opacity-50
                        hover:border-pink-500 focus:ring-pink-700 flex-1"
          onClick={() => navigator(`/vault/${address}/redeem`)}
        >
          Redeem
        </button>
        <button
          className="inline-flex items-center justify-center outline-none font-medium rounded-md break-word
                        hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-2 px-3 text-sm bg-transparent
                        dark:text-white text-lm-gray-900 border border-transparent hover:border-opacity-50 hover:border-pink-500
                        focus:ring-pink-700 flex-1"
          onClick={() => navigator(`/vault/${address}/swap`)}
        >
          Swap
        </button>
        <button
          className="inline-flex items-center justify-center outline-none font-medium rounded-md break-word
                        hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-2 px-3 text-sm bg-transparent
                        dark:text-white text-lm-gray-900 border border-transparent hover:border-opacity-50 hover:border-pink-500
                        focus:ring-pink-700 flex-1"
          onClick={() => navigator(`/vault/${address}/manage`)}
        >
          Manage
        </button>
        <button
          className="inline-flex items-center justify-center outline-none font-medium rounded-md break-word
                        hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-2 px-3 text-sm bg-transparent
                        dark:text-white text-lm-gray-900 border border-transparent hover:border-opacity-50 hover:border-pink-500
                        focus:ring-pink-700 flex-1"
          onClick={() => navigator(`/vault/${address}/info`)}
        >
          Info
        </button>
      </div>
    </header>
  );
};

export default VaultHeader;
