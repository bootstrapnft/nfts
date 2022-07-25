import { Contract, ethers } from "ethers";
import ERC721ABI from "@/contract/ERC721.json";
import config from "@/config";

const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

type imgType = "img" | "thumbnail";

export const getNFTInfo = async (
    assetAddress: string,
    nftIds: any[],
    type: imgType = "img"
): Promise<any[]> => {
    console.log("utils get nft:", assetAddress, nftIds);

    const NFTInfos: any[] = [];
    await Promise.all(
        nftIds.map(async (item, index) => {
            await fetch(
                `/metadata/cache?network=${config.network}&dataType=${type}&contract=${assetAddress}&nftId=${item}`
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

    let tokenIds: number[] = [];
    try {
        const total = await contract.balanceOf(account);
        console.log("开始获取nft", total.toNumber());

        await Promise.all(
            new Array(total.toNumber()).fill(1).map(async (item, index) => {
                const tokenId = await contract.tokenOfOwnerByIndex(
                    account,
                    index
                );
                console.log("tokenId:", tokenId.toString(), index);
                tokenIds.push(tokenId.toNumber());
            })
        );
    } catch (e) {
        console.log("token of owner by index err:", e);
        const nftIds: number[] = [];
        await Promise.all(
            new Array(58).fill(1).map(async (item, index) => {
                const tokenId = index + 1;
                try {
                    const result = await contract.ownerOf(tokenId);
                    if (result === account) {
                        nftIds.push(tokenId);
                    }
                } catch (e) {
                    console.log("ownerOf err:", tokenId, e);
                }
            })
        )
            .then(() => {
                tokenIds = nftIds;
            })
            .catch((err) => {
                console.log("get nft ids err:", err);
            });
    }

    const nftIds = tokenIds.sort((a, b) => {
        return a - b;
    });

    console.log("utils get nft ids:", nftIds);
    return nftIds;
};
