import { Contract, ethers } from "ethers";
import ERC721ABI from "@/contract/ERC721.json";
import config from "@/config";

const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

export const getNFTInfo = async (
    assetAddress: string,
    nftIds: any[]
): Promise<any[]> => {
    console.log("utils get nft:", assetAddress, nftIds);

    const NFTInfos: any[] = [];
    await Promise.all(
        nftIds.map(async (item, index) => {
            await fetch(
                `/metadata/cache?network=${config.network}&dataType=img&contract=${assetAddress}&nftId=${item}`
            )
                .then(async (res) => {
                    const blob = await res.blob();
                    NFTInfos.push({
                        number: item,
                        image: window.URL.createObjectURL(blob),
                    });
                })
                .catch((err) => {
                    console.log("fetch nft metadata err:", err);
                });
        })
    ).catch((err) => {
        console.log("fetch nft metadata promise err:", err);
    });

    return NFTInfos;
};

export const getOwnerNFTIds = async (
    assetAddress: string,
    account: string
): Promise<any[]> => {
    const contract = new Contract(assetAddress, ERC721ABI, provider);

    const tokenIds: number[] = [];
    await Promise.all(
        new Array(58).fill(1).map(async (item, index) => {
            const tokenId = index + 1;
            const result = await contract.ownerOf(tokenId);
            if (result === account) {
                tokenIds.push(tokenId);
            }
        })
    ).catch((err) => {
        console.log("get nft ids err:", err);
    });

    const nftIds = tokenIds.sort((a, b) => {
        return a - b;
    });

    console.log("utils get nft ids:", nftIds);
    return nftIds;
};
