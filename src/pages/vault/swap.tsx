import VaultHeader from "@/pages/vault/header";
import { useParams } from "react-router";
import { useWeb3React } from "@web3-react/core";
import { useLoading } from "@/context/loading";
import { Fragment, useEffect, useState } from "react";
import viewGrid from "@/assets/icon/view-grid.svg";
import miniViewGrid from "@/assets/icon/mini-view-grid.svg";
import VaultCard from "@/pages/vault/card";
import { Contract } from "ethers";
import VaultABI from "@/contract/Vault.json";
import ERC721ABI from "@/contract/ERC721.json";
import close from "@/assets/icon/close.svg";

const VaultSwap = () => {
  const params = useParams();
  const { library, account, active } = useWeb3React();
  const [_, setLoading] = useLoading();
  const [selectFromIds, setSelectFromIds] = useState<{ [key: string]: any }[]>(
    []
  );
  const [selectReciveIds, setSelectReciveIds] = useState<
    { [key: string]: any }[]
  >([]);
  const [assetAddress, setAssetAddress] = useState("");
  const [ownerNFTs, setOwnerNFTs] = useState<{ [key: string]: any }[]>([]);
  const [ownerNFTIds, setOwnerNFTIds] = useState<number[]>([]);

  useEffect(() => {
    getNFTAssetAddress();
  }, []);

  useEffect(() => {
    getNFTIds();
  }, [assetAddress]);

  useEffect(() => {
    getNFTInfo();
  }, [ownerNFTIds]);

  const selectTokenId = (item: any) => {
    console.log(item);
    let isSelect = false;
    selectFromIds.forEach((nft) => {
      if (nft.number === item.number) {
        isSelect = true;
        return;
      }
    });

    if (!isSelect) {
      setSelectFromIds([...selectFromIds, item]);
    }
  };

  const getNFTAssetAddress = async () => {
    const contract = new Contract(
      params.address!,
      VaultABI,
      library.getSigner()
    );
    await contract.assetAddress().then((res: any) => {
      setAssetAddress(res);
      console.log("ass:", res);
    });
  };

  const getNFTIds = async () => {
    setLoading(true);
    const contract = new Contract(assetAddress, ERC721ABI, library.getSigner());

    const tokenIds: number[] = [];
    await Promise.all(
      new Array(58).fill(1).map(async (item, index) => {
        const result = await contract.ownerOf(index);
        if (result === account) {
          tokenIds.push(index);
        }
      })
    ).catch((err) => {
      setLoading(false);
    });

    setOwnerNFTIds(
      tokenIds.sort((a, b) => {
        return a - b;
      })
    );
    setLoading(false);
  };

  const getNFTInfo = async () => {
    setLoading(true);
    const contract = new Contract(assetAddress, ERC721ABI, library.getSigner());

    const ownerNFTs: any[] = [];
    await Promise.all(
      ownerNFTIds.map(async (item, index) => {
        const url = await contract.tokenURI(item);
        const res = await fetch(url);
        await res.json().then((res: any) => {
          console.log("res:", res);
          res.number = item;
          ownerNFTs.push(res);
        });
      })
    );
    setOwnerNFTs(ownerNFTs);
    setLoading(false);
  };

  const swap = async () => {};

  return (
    <Fragment>
      <main className="flex-1 flex relative flex-wrap md:flex-nowrap text-purple-second">
        <section
          className="nft-list border-l relative sm:static pb-12 flex-1 flex flex-col border-r
                    border-blue-primary"
        >
          <VaultHeader address={params?.address} isManager type="swap" />
          <div className="dark:bg-gray-700">
            <div className="px-3 py-6 sm:px-6">
              <div className="mb-2 text-sm flex items-center justify-between">
                {ownerNFTs.length} items
                <div className="flex space-x-1">
                  <button className="inline-flex items-center justify-center outline-none font-medium rounded-md break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-1.5 px-2 text-xs bg-transparent border border-pink-500 dark:text-white text-lm-gray-800 hover:bg-pink-500 hover:bg-opacity-10 focus:ring-pink-700">
                    <span className="text-center">
                      <img src={viewGrid} alt="" className="h-5 w-5" />
                    </span>
                  </button>
                  <button className="inline-flex items-center justify-center outline-none font-medium rounded-md break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-1.5 px-2 text-xs bg-transparent dark:text-white text-lm-gray-900 border border-transparent hover:border-opacity-50 hover:border-pink-500 focus:ring-pink-700">
                    <span className="text-center">
                      <img src={miniViewGrid} alt="" className="h-5 w-5" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6
                            3xl:grid-cols-7 sm:gap-4 gap-2"
          >
            {ownerNFTs.map((item, index) => (
              <VaultCard
                key={index}
                {...item}
                callback={(item: any) => selectTokenId(item)}
              />
            ))}
          </div>
        </section>
        <aside className="flex-none w-full md:w-1/3 md:max-w-xs 2xl:max-w-sm z-20 text-purple-second">
          <div className="md:block md:sticky md:top-18 hidden">
            <div className="block p-6 sm:p-10 md:p-6 md:mb-8">
              <header className="flex justify-between items-center mb-6 relative">
                <h3 className="font-bold text-lg">Swap assets</h3>
              </header>
              <div
                className="w-full text-left rounded-t-lg pb-4 pt-2 border border-b-0 bg-purple-primary
                                    border-purple-primary"
              >
                <div className="w-full text-left p-3 cursor-default text-purple-second">
                  <h4 className="text-lg dark:text-white">Swap from</h4>
                  <p className="opacity-70 text-sm">
                    Choose your assets to swap from
                  </p>
                  <button
                    className="inline-flex items-center justify-center outline-none font-medium rounded-md
                                        break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75
                                        py-2 px-3 text-sm bg-white text-gray-900 hover:bg-gray-100 focus:ring-gray-300 mt-4"
                  >
                    Select assets
                  </button>
                </div>
              </div>
              <div className="flex justify-center relative bg-purple-second h-px">
                <div className="absolute -top-4 bg-gray-600 rounded-full w-8 h-8 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-900 transform rotate-90"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    ></path>
                  </svg>
                </div>
              </div>
              <div className="w-full text-left rounded-b-lg pt-4 pb-2 border border-t-0 border-gray-600 bg-gray-700">
                {selectFromIds.length === 0 && (
                  <div className="w-full text-left p-3 cursor-default text-purple-second">
                    <h4 className="text-lg dark:text-white">Swap to</h4>
                    <p className="opacity-70 text-sm">
                      Choose your assets to receive
                    </p>
                    <button
                      className="inline-flex items-center justify-center outline-none font-medium rounded-md
                                        break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75
                                        py-2 px-3 text-sm bg-white text-gray-900 hover:bg-gray-100 focus:ring-gray-300 mt-4"
                    >
                      Select assets
                    </button>
                  </div>
                )}
                <div className="p-3">
                  {selectFromIds.length > 0 && (
                    <header className="flex justify-between">
                      <h4 className="text-lg dark:text-white mr-2">Swap to</h4>
                      <button
                        className="inline-flex items-center justify-center outline-none font-medium
                                            rounded-md break-word hover:outline focus:outline-none focus:ring-1
                                            focus:ring-opacity-75 py-1.5 px-2 text-xs bg-transparent border
                                            border-purple-primary text-lm-gray-800 hover:bg-purple-primary
                                            hover:bg-opacity-80 focus:ring-pink-700 opacity-100"
                      >
                        Change
                      </button>
                    </header>
                  )}
                  <div className="space-y-4 mt-4">
                    {selectFromIds.map((item) => {
                      return (
                        <div className="mt-4" key={item.number}>
                          <div
                            className="flex items-center justify-between dark:text-gray-50 text-lm-gray-900 break-all"
                            key={item.number}
                          >
                            <div className="inline-flex items-center">
                              <img
                                loading="lazy"
                                src={item.imageUrl}
                                className="w-8 h-8 object-cover flex-none rounded-md"
                                alt="CRYPTOPUNKS"
                              />
                              <div className="flex-1 ml-2 overflow-hidden">
                                <h4 className="text-sm font-bold leading-tight">
                                  #{item.number}
                                </h4>
                                <p className="text-xs dark:text-white text-lm-gray-900 text-opacity:20 dark:text-opacity-80 truncate">
                                  {item.name}
                                </p>
                              </div>
                            </div>
                            <button
                              className="focus:ring-0 focus:outline-none ml-2"
                              aria-label="remove"
                              onClick={() => setSelectFromIds([])}
                            >
                              <img
                                src={close}
                                alt=""
                                className="h-4 w-4 dark:text-gray-500 dark:hover:text-gray-200 text-lm-gray-600 hover-text-lm-gray-300"
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <button
                  className="inline-flex items-center justify-center outline-none font-medium
                                        rounded-md break-word hover:outline focus:outline-none focus:ring-1
                                        focus:ring-opacity-75 py-4 px-6 text-sm bg-gradient-to-b from-purple-primary
                                        to-purple-900 text-white hover:from-purple-primary hover:to-purple-primary
                                        focus:ring-pink-500 whitespace-nowrap mt-5"
                  onClick={swap}
                >
                  Mint NFT
                </button>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </Fragment>
  );
};

export default VaultSwap;
