import React, { Fragment, useEffect, useState } from "react";
import VaultHeader from "@/pages/vault/header";

import VaultCard from "@/pages/vault/card";
import close from "@/assets/icon/close.svg";
import { useParams } from "react-router";
import { Contract } from "ethers";
import VaultABI from "@/contract/Vault.json";
import { useWeb3React } from "@web3-react/core";
import ERC721ABI from "@/contract/ERC721.json";
import { useLoading } from "@/context/loading";
import useAssetAddress from "@/hooks/useAssetAddress";
import { toast } from "react-toastify";
import { getNFTInfo, getOwnerNFTIds } from "@/util/nfts";
import { gql, request } from "graphql-request";
import config from "@/config";
import { useWalletSelect } from "@/context/connect-wallet";

const VaultMint = () => {
    const params = useParams();
    const [, setLoading] = useLoading();
    const [, setIsOpen] = useWalletSelect();
    const { library, account, active } = useWeb3React();
    const { address: assetAddress } = useAssetAddress(params.address!);
    const [ownerNFTIds, setOwnerNFTIds] = useState<number[]>([]);
    const [ownerNFTs, setOwnerNFTs] = useState<{ [key: string]: any }[]>([]);
    const [selectMintIds, setSelectMintIds] = useState<
        { [key: string]: any }[]
    >([]);
    const [token, setToken] = useState<{ [key: string]: any }>({});

    useEffect(() => {
        getNFTIds();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assetAddress]);

    useEffect(() => {
        if (ownerNFTIds.length > 0) {
            setLoading(true);
            getNFTInfo(assetAddress, ownerNFTIds)
                .then((res) => {
                    setLoading(false);
                    setOwnerNFTs(res);
                })
                .catch((err) => {
                    setLoading(false);
                });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ownerNFTIds]);

    useEffect(() => {
        getToken();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getNFTIds = () => {
        if (assetAddress !== "" && account) {
            setLoading(true);
            getOwnerNFTIds(assetAddress, account)
                .then((res) => {
                    setLoading(false);
                    setOwnerNFTIds(res);
                })
                .catch((err) => {
                    setLoading(false);
                });
        }
    };

    const getToken = async () => {
        const query = gql`
            query {
                vault(id: "${params.address}") {
                    token {
                        id
                        name
                        symbol
                    }
                }
            }
        `;
        request(config.nftSubgraphUrl, query).then((res) => {
            if (res.vault.token) {
                setToken(res.vault.token);
            }
        });
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
            // setSelectMintIds([...selectMintIds, item]);
        }
        setSelectMintIds([item]);
    };

    const mint = async () => {
        if (!selectMintIds) {
            return;
        }
        try {
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
            toast.success(`Approve ${selectMintIds[0].number} success!`, {});

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
                    toast.success(
                        `Mint #${selectMintIds[0].number} success!`,
                        {}
                    );
                },
                (err: any) => {
                    setLoading(false);
                    toast.error(`Mint #${selectMintIds[0].number} error!`, {});
                    console.log("tx error:", err);
                }
            );
            setLoading(false);
        } catch (e) {
            setLoading(false);
            toast.error(`Mint #${selectMintIds[0].number} error!`, {});
            console.log("mint exception:", e);
        }
    };

    return (
        <Fragment>
            <main className="flex-1 flex gap-x-6 relative flex-wrap md:flex-nowrap text-purple-second py-8 px-20">
                <section className="relative sm:static pb-12 flex-1 flex flex-col">
                    <VaultHeader
                        token={token}
                        isManager
                        type="mint"
                        symbolImage={
                            ownerNFTs.length > 0 ? ownerNFTs[0].image : ""
                        }
                    />
                    {ownerNFTs.length > 0 && (
                        <div className="dark:bg-gray-700">
                            <div className="px-3 py-6 sm:px-6">
                                <div className="mb-2 text-sm flex items-center justify-between">
                                    {ownerNFTs.length} items
                                </div>
                            </div>
                        </div>
                    )}
                    <div
                        className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6
                    3xl:grid-cols-7 sm:gap-4 gap-2"
                    >
                        {ownerNFTs.map((item, index) => (
                            <VaultCard
                                key={index}
                                {...item}
                                selectList={selectMintIds}
                                callback={(item: any) => selectTokenId(item)}
                            />
                        ))}
                    </div>
                    {!active && (
                        <button
                            className="btn-primary w-2/3 py-6 mx-auto"
                            onClick={() => setIsOpen(true)}
                        >
                            Connect wallet
                        </button>
                    )}
                </section>
                <aside
                    className="flex-none w-full h-max md:w-1/3 md:max-w-xs 2xl:max-w-sm z-20 text-purple-second
            bg-blue-primary mb-20"
                >
                    <div className="md:block sticky top-18  hidden">
                        <div className="block p-6 sm:p-10 md:p-6 md:mb-8">
                            {selectMintIds.length === 0 && (
                                <div>
                                    <h3 className="mb-4 text-xl text-center dark:text-gray-50 text-lm-gray-600">
                                        Select NFTs to mint
                                    </h3>
                                    <button
                                        className="inline-flex items-center justify-center outline-none font-medium rounded-md break-word
                      hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-6 px-12 w-full
                      bg-gradient-to-b text-white from-gray-700 to-black focus:ring-gray-800 cursor-not-allowed opacity-90"
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
                                                    <div
                                                        className="mt-4"
                                                        key={item.number}
                                                    >
                                                        <div
                                                            className="flex items-center justify-between dark:text-gray-50 text-lm-gray-900 break-all"
                                                            key={item.number}
                                                        >
                                                            <div className="inline-flex items-center">
                                                                <img
                                                                    loading="lazy"
                                                                    src={
                                                                        item.imageUrl
                                                                    }
                                                                    className="w-8 h-8 object-cover flex-none rounded-md"
                                                                    alt="CRYPTOPUNKS"
                                                                />
                                                                <div className="flex-1 ml-2 overflow-hidden">
                                                                    <h4 className="text-sm font-bold leading-tight">
                                                                        #
                                                                        {
                                                                            item.number
                                                                        }
                                                                    </h4>
                                                                    <p className="text-xs dark:text-white text-lm-gray-900 text-opacity:20 dark:text-opacity-80 truncate">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                className="focus:ring-0 focus:outline-none ml-2"
                                                                aria-label="remove"
                                                                onClick={() =>
                                                                    setSelectMintIds(
                                                                        []
                                                                    )
                                                                }
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
                                            <dd className="flex-1 text-right">
                                                1%
                                            </dd>
                                        </div>
                                        <div className="flex items-center text-xs mb-2 dark:text-gray-300 text-lm-gray-900">
                                            <dt className="mr-2">
                                                you receive
                                            </dt>
                                            <dd className="flex-1 text-right">
                                                {selectMintIds.length * 0.9}{" "}
                                                {token.symbol}
                                            </dd>
                                        </div>
                                    </dl>
                                    <div className="text-center">
                                        <button
                                            className="btn-primary p-4 px-6"
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
