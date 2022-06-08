import { Fragment, useEffect, useState } from "react";
import VaultHeader from "@/pages/vault/header";
import viewGrid from "@/assets/icon/view-grid.svg";
import miniViewGrid from "@/assets/icon/mini-view-grid.svg";
import VaultCard from "@/pages/vault/card";
import close from "@/assets/icon/close.svg";
import { useParams } from "react-router";
import { Contract } from "ethers";
import VaultABI from "@/contract/Vault.json";
import { useWeb3React } from "@web3-react/core";
import ERC721ABI from "@/contract/ERC721.json";
import { useLoading } from "@/context/loading";

const VaultMint = () => {
  const params = useParams();
  const { library, account, active } = useWeb3React();
  const [_, setLoading] = useLoading();
  const [selectMintIds, setSelectMintIds] = useState<{ [key: string]: any }[]>(
    []
  );
  const [assetAddress, setAssetAddress] = useState("");
  const [ownerNFTs, setOwnerNFTs] = useState<{ [key: string]: any }[]>([]);
  const [ownerNFTIds, setOwnerNFTIds] = useState<number[]>([]);
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    getNFTAssetAddress();
    getOwner();
  }, []);

  useEffect(() => {
    getNFTIds();
  }, [assetAddress]);

  useEffect(() => {
    getNFTInfo();
  }, [ownerNFTIds]);

  const getOwner = () => {
    if (active) {
      const contract = new Contract(
        params.address!,
        VaultABI,
        library.getSigner()
      );
      contract
        .owner()
        .then((owner: any) => {
          console.log("get owner result:", owner);
          if (account === owner) {
            setIsManager(true);
          }
        })
        .catch((err: any) => {
          console.log("get owner:", err);
        });
    }
  };

  const selectTokenId = (item: any) => {
    console.log(item);
    let isSelect = false;
    selectMintIds.forEach((nft) => {
      if (nft.number === item.number) {
        isSelect = true;
        return;
      }
    });

    if (!isSelect) {
      setSelectMintIds([...selectMintIds, item]);
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

  const getNFTIds = async () => {
    setLoading(true);
    const contract = new Contract(assetAddress, ERC721ABI, library.getSigner());

    const tokenIds: number[] = [];
    await Promise.all(
      new Array(18).fill(1).map(async (item, index) => {
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

  const mint = async () => {
    if (!selectMintIds) {
      return;
    }
    setLoading(true);
    const erc721Contract = new Contract(
      assetAddress,
      ERC721ABI,
      library.getSigner()
    );
    const approve = await erc721Contract
      .approve(params.address, selectMintIds[0].number)
      .catch((e: any) => {
        console.log("approve error:", e);
        setLoading(false);
      });
    const approveResult = await approve.wait();
    console.log("approve result:", approveResult);

    const contract = new Contract(
      params.address!,
      VaultABI,
      library.getSigner()
    );
    const tx = await contract
      .mint([selectMintIds[0].number], [1])
      .catch((e: any) => {
        console.log("mint error:", e);
        setLoading(false);
      });
    await tx.wait().then(
      (res: any) => {
        console.log("tx success:", res);
        setSelectMintIds([]);
        getNFTIds();
      },
      (err: any) => {
        setLoading(false);
        console.log("tx error:", err);
      }
    );
    setLoading(false);
  };

  return (
    <Fragment>
      <main className="flex-1 flex relative flex-wrap md:flex-nowrap text-purple-second">
        <section
          className="nft-list border-l relative sm:static pb-12 flex-1 flex flex-col border-r
                    border-blue-primary"
        >
          <VaultHeader address={params?.address} isManager />
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
              {selectMintIds.length === 0 && (
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
              {selectMintIds.length > 0 && (
                <div>
                  <div className="relative flex justify-between items-center mb-4 pb-2">
                    <h4 className="font-bold">
                      You're mint ({selectMintIds.length})
                    </h4>
                  </div>
                  <div className="max-h-2/5-screen border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className="flex flex-col-reverse">
                      {selectMintIds.map((item) => {
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
                                onClick={() => setSelectMintIds([])}
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
                        {selectMintIds.length}
                      </dd>
                    </div>
                    <div className="flex items-center text-xs mb-2 dark:text-gray-300 text-lm-gray-900">
                      <dt className="mr-2">Mint fee</dt>
                      <dd className="flex-1 text-right">1%</dd>
                    </div>
                    <div className="flex items-center text-xs mb-2 dark:text-gray-300 text-lm-gray-900">
                      <dt className="mr-2">you receive</dt>
                      <dd className="flex-1 text-right">
                        {selectMintIds.length * 0.9} PUNK
                      </dd>
                    </div>
                  </dl>
                  <div className="text-center">
                    <button
                      className="inline-flex items-center justify-center outline-none font-medium
                                        rounded-md break-word hover:outline focus:outline-none focus:ring-1
                                        focus:ring-opacity-75 py-4 px-6 text-sm bg-gradient-to-b from-purple-primary
                                        to-purple-900 text-white hover:from-purple-primary hover:to-purple-primary
                                        focus:ring-pink-500 whitespace-nowrap"
                      onClick={mint}
                    >
                      Mint NFT
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

export default VaultMint;
