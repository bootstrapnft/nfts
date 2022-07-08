import { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router";
import { useWeb3React } from "@web3-react/core";
import { BigNumber, Contract, ethers } from "ethers";

import VaultCard from "@/pages/vault/card";
import { useLoading } from "@/context/loading";
import VaultABI from "@/contract/Vault.json";
import close from "@/assets/icon/close.svg";
import VaultHeader from "@/pages/vault/header";
import useAssetAddress from "@/hooks/useAssetAddress";
import { toast } from "react-toastify";
import { getNFTInfo } from "@/util/nfts";
import { gql, request } from "graphql-request";
import config from "@/config";

const VaultRedeem = () => {
    const params = useParams();
    const [, setLoading] = useLoading();
    const { library, account, active } = useWeb3React();
    const [balance, setBalance] = useState("0");
    const { address: assetAddress } = useAssetAddress(params.address!);
    const [allHolding, setAllHolding] = useState<number[]>([]);
    const [ownerNFTs, setOwnerNFTs] = useState<{ [key: string]: any }[]>([]);
    const [selectRedeemIds, setSelectRedeemIds] = useState<
        { [key: string]: any }[]
    >([]);
    const [token, setToken] = useState<{ [key: string]: any }>({});

    useEffect(() => {
        if (active) {
            getAllHolding();
            getBalance();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, account]);

    useEffect(() => {
        if (allHolding.length > 0 && assetAddress) {
            setLoading(true);
            getNFTInfo(assetAddress, allHolding)
                .then((res) => {
                    setLoading(false);
                    setOwnerNFTs(res);
                })
                .catch((err) => {
                    setLoading(false);
                });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allHolding, assetAddress]);

    useEffect(() => {
        getToken();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                toast.success(`Redeem #${ids} success`);
            });
        } catch (e) {
            console.log("redeem error:", e);
            setLoading(false);
            toast.error(`Redeem #${ids} error`);
        }
    };

    const removeRedeemIds = (item: any) => {
        const newSelectRedeemIds = selectRedeemIds.filter(
            (nft) => nft.number !== item.number
        );
        setSelectRedeemIds(newSelectRedeemIds);
    };

    return (
        <Fragment>
            <main className="flex-1 flex gap-x-6 relative flex-wrap md:flex-nowrap text-purple-second py-8 px-20">
                <section className="relative sm:static pb-12 flex-1 flex flex-col">
                    <VaultHeader
                        token={token}
                        isManager
                        type="redeem"
                        symbolImage={
                            ownerNFTs.length > 0 ? ownerNFTs[0].image : ""
                        }
                    />
                    <div className="dark:bg-gray-700">
                        <div className="px-3 py-6 sm:px-6">
                            <div className="mb-2 text-sm flex items-center justify-between">
                                {allHolding.length} items
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
                                selectList={selectRedeemIds}
                                callback={(item: any) => selectTokenId(item)}
                            />
                        ))}
                    </div>
                </section>
                <aside className="flex-none w-full md:w-1/3 md:max-w-xs 2xl:max-w-sm z-20 text-purple-second bg-blue-primary">
                    <div className="md:block md:sticky md:top-18 hidden">
                        <div className="block p-6 sm:p-10 md:p-6 md:mb-8">
                            {selectRedeemIds.length === 0 && (
                                <div>
                                    <h3 className="mb-4 text-xl text-center dark:text-gray-50 text-lm-gray-600">
                                        Select NFTs to Redeem
                                    </h3>
                                    <button
                                        className="inline-flex items-center justify-center outline-none font-medium rounded-md
                                              break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-6
                                              px-12 w-full bg-gradient-to-b text-white from-gray-700 to-black focus:ring-gray-800
                                              cursor-not-allowed opacity-90"
                                        disabled={true}
                                    >
                                        Redeem NFTs
                                    </button>
                                </div>
                            )}
                            {selectRedeemIds.length > 0 && (
                                <div>
                                    <div className="relative flex justify-between items-center mb-4 pb-2">
                                        <h4 className="font-bold">
                                            You're redeem (
                                            {selectRedeemIds.length})
                                        </h4>
                                    </div>
                                    <div className="max-h-2/5-screen border-b border-gray-100 dark:border-gray-700 pb-4">
                                        <div className="flex flex-col-reverse">
                                            {selectRedeemIds.map((item) => {
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
                                                            >
                                                                <img
                                                                    src={close}
                                                                    alt=""
                                                                    className="h-4 w-4 dark:text-gray-500 dark:hover:text-gray-200 text-lm-gray-600 hover-text-lm-gray-300"
                                                                    onClick={() =>
                                                                        removeRedeemIds(
                                                                            item
                                                                        )
                                                                    }
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
                                            <dt className="mr-2">
                                                Your balance
                                            </dt>
                                            <dd className="flex-1 text-right">
                                                {balance}
                                            </dd>
                                        </div>
                                    </dl>
                                    <div className="text-center">
                                        <button
                                            className="btn-primary p-4 px-6"
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
