import { Fragment, useEffect, useState } from "react";
import Card from "@/components/card";
import { useLoading } from "@/context/loading";
import { getPublicVaults } from "@/util/vault";
import { getNFTInfo } from "@/util/nfts";

const Home = () => {
    const [, setLoading] = useLoading();
    const [vaults, setVaults] = useState<any[]>([]);

    useEffect(() => {
        getVaults();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getVaults = () => {
        setLoading(true);
        getPublicVaults()
            .then(async (vaults) => {
                await getNftInfo(vaults);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
            });
    };

    const getNftInfo = async (vaults: any[]) => {
        await Promise.all(
            vaults.map(async (item) => {
                console.log("vault item", item);
                const nftInfo = await getNFTInfo(item.asset.id, [
                    item.mints[0].nftIds[0],
                ]);
                if (nftInfo.length > 0) {
                    item.image = nftInfo[0].image;
                    item.symbolImage = nftInfo[0].image;
                } else {
                    item.image = "/images/cover.png";
                    item.symbolImage = "/images/cover.png";
                }
                return item;
            })
        )
            .then((res) => {
                console.log("promise vaults", res);
                setVaults(res);
            })
            .catch((e) => {
                console.log("get nft error", e);
            });
    };

    return (
        <Fragment>
            <main className="flex-1 flex flex-col px-4 xl:px-8 2xl:p-12 pt-12 text-purple-second">
                <section className="pb-32 lg:pb-14">
                    <header>
                        <h1 className="font-bold text-3xl mb-2">Buy NFTs</h1>
                        <p className="mb-4">
                            Browse the decentralized NFT marketplace.
                        </p>
                    </header>
                    <div className="bg-gradient-to-r from-transparent to-purple-primary h-px mb-4"></div>
                    <div className="flex justify-between items-center sm:items-start space-x-4">
                        <h3 className="uppercase mb-4 mt-4 font-bold text-xl inline-block">
                            All Collections
                        </h3>
                    </div>
                    <div
                        className="pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5
                       sm:gap-4 gap-2 "
                    >
                        {vaults.map((nft, index) => (
                            <Card key={index} {...nft} />
                        ))}
                    </div>
                </section>
            </main>
        </Fragment>
    );
};

export default Home;
