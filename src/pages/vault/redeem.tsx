import { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router";
import { useWeb3React } from "@web3-react/core";
import { BigNumber, Contract, ethers } from "ethers";

import VaultCard from "@/pages/vault/card";
import { useLoading } from "@/context/loading";
import VaultABI from "@/contract/Vault.json";
import ERC721ABI from "@/contract/ERC721.json";
import close from "@/assets/icon/close.svg";
import viewGrid from "@/assets/icon/view-grid.svg";
import miniViewGrid from "@/assets/icon/mini-view-grid.svg";

const VaultRedeem = () => {
  const params = useParams();
  const { library, account, active } = useWeb3React();
  const [_, setLoading] = useLoading();
  const [balance, setBalance] = useState("0");
  const [assetAddress, setAssetAddress] = useState("");
  const [allHolding, setAllHolding] = useState<number[]>([]);
  const [ownerNFTs, setOwnerNFTs] = useState<{ [key: string]: any }[]>([]);
  const [selectRedeemIds, setSelectRedeemIds] = useState<
    { [key: string]: any }[]
  >([]);

  useEffect(() => {
    getAllHolding();
    getBalance();
    getNFTAssetAddress();
  }, []);

  useEffect(() => {
    getNFTInfo();
  }, [allHolding]);

  const selectTokenId = (item: any) => {
    let isSelect = false;
    selectRedeemIds.forEach((nft) => {
      if (nft.number === item.number) {
        isSelect = true;
        return;
      }
    });

    if (!isSelect) {
      setSelectRedeemIds([...selectRedeemIds, item]);
    }
  };

  const getAllHolding = async () => {
    const contract = new Contract(
      params.address!,
      VaultABI,
      library.getSigner()
    );
    await contract.allHoldings().then((res: any) => {
      setAllHolding(res.map((item: BigNumber) => item.toNumber()));
    });
  };

  const getBalance = async () => {
    const contract = new Contract(
      params.address!,
      VaultABI,
      library.getSigner()
    );
    await contract.balanceOf(account).then((res: any) => {
      setBalance(ethers.utils.formatEther(res));
    });
  };

  const redeem = async () => {
    setLoading(true);
    const contract = new Contract(
      params.address!,
      VaultABI,
      library.getSigner()
    );
    const ids = selectRedeemIds.map((item) => item.number);
    console.log("redeem:", ids);
    try {
      const tx = await contract.redeem(ids.length, ids);
      await tx.wait().then((res: any) => {
        console.log("redeem res:", res);
        getAllHolding();
        getBalance();
        setSelectRedeemIds([]);
        setLoading(false);
      });
    } catch (e) {
      console.log("redeem error:", e);
      setLoading(false);
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
    });
    console.log("ass:", assetAddress);
  };

  const getNFTInfo = async () => {
    setLoading(true);
    const contract = new Contract(assetAddress, ERC721ABI, library.getSigner());

    const ownerNFTs: any[] = [];
    await Promise.all(
      allHolding.map(async (item, index) => {
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

  return (
    <Fragment>
      <main className="flex-1 flex relative flex-wrap md:flex-nowrap text-purple-second">
        <section className="nft-list border-l relative sm:static pb-12 flex-1 flex flex-col border-r border-blue-primary">
          <header className="lg:flex justify-between items-center py-2 px-4 sm:px-6 lg:h-16 sticky top-14 sm:top-18 z-10">
            <div className="flex items-center">
              <div className="inline-flex items-center">
                <img
                  className="w-10 h-10 bg-cover"
                  src="https://res.cloudinary.com/nftx/image/fetch/w_150,h_150,f_auto/https://raw.githubusercontent.com/NFTX-project/nftx-assets/main/vaults-v2/0/256x256.png"
                  alt="PUNK"
                />
                <div className="flex-1 ml-2 overflow-hidden">
                  <h4 className="text-lg font-bold leading-tight">
                    Redeem Punk
                  </h4>
                </div>
              </div>
            </div>
          </header>
          <div className="dark:bg-gray-700">
            <div className="px-3 py-6 sm:px-6">
              <div className="mb-2 text-sm flex items-center justify-between">
                {allHolding.length} items
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
            className="pb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6
                    3xl:grid-cols-7 sm:gap-4 gap-2 "
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
              {selectRedeemIds.length === 0 && (
                <div>
                  <h3 className="mb-4 text-xl text-center dark:text-gray-50 text-lm-gray-600">
                    Select NFTs to mint
                  </h3>
                  <button
                    className="inline-flex items-center justify-center outline-none font-medium rounded-md break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-6 px-12 w-full bg-gradient-to-b text-white from-gray-700 to-black focus:ring-gray-800 cursor-not-allowed opacity-90"
                    disabled={true}
                  >
                    Mint NFTs
                  </button>
                </div>
              )}
              {selectRedeemIds.length > 0 && (
                <div>
                  <div className="relative flex justify-between items-center mb-4 pb-2">
                    <h4 className="font-bold">
                      You're redeem ({selectRedeemIds.length})
                    </h4>
                  </div>
                  <div className="max-h-2/5-screen border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className="flex flex-col-reverse">
                      {selectRedeemIds.map((item) => {
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
                  <dl className="mt-10 mb-6 flex-wrap">
                    <div className="flex items-center text-lg mb-2">
                      <dt className="dark:text-gray-50 text-lm-gray-900 mr-2">
                        Total
                      </dt>
                      <dd className="flex-1 text-right">
                        {selectRedeemIds.length}
                      </dd>
                    </div>
                    <div className="flex items-center text-xs mb-2 dark:text-gray-300 text-lm-gray-900">
                      <dt className="mr-2">Your balance</dt>
                      <dd className="flex-1 text-right">{balance}</dd>
                    </div>
                  </dl>
                  <div className="text-center">
                    <button
                      className="inline-flex items-center justify-center outline-none font-medium
                                        rounded-md break-word hover:outline focus:outline-none focus:ring-1
                                        focus:ring-opacity-75 py-4 px-6 text-sm bg-gradient-to-b from-purple-primary
                                        to-purple-900 text-white hover:from-purple-primary hover:to-purple-primary
                                        focus:ring-pink-500 whitespace-nowrap"
                      onClick={redeem}
                    >
                      Redeem
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </main>
    </Fragment>
  );
};

export default VaultRedeem;
