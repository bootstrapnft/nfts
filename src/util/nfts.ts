import { Contract, ethers } from "ethers";
import ERC721ABI from "@/contract/ERC721.json";
import config from "@/config";

const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

export const getNFTInfo = async (
    assetAddress: string,
    nftIds: any[]
): Promise<any[]> => {
    const contract = new Contract(assetAddress, ERC721ABI, provider);
    console.log("utils get nft:", assetAddress, nftIds);

    const NFTInfos: any[] = [];

    await Promise.all(
        nftIds.map(async (item, index) => {
            let url = await contract.tokenURI(item);
            if (url.startsWith("ipfs://")) {
                url = url.replace("ipfs://", "https://ipfs.io/ipfs/");
            }
            const res = await fetch(url);
            await res
                .json()
                .then((res: any) => {
                    console.log("res:", res);
                    res.number = item;
                    if (res.image.startsWith("ipfs://")) {
                        res.image = res.image.replace(
                            "ipfs://",
                            "https://ipfs.io/ipfs/"
                        );
                    }
                    NFTInfos.push(res);
                })
                .catch((err) => {
                    console.log("get nft info err:", item, err);
                });
        })
    );

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
            const result = await contract.ownerOf(index);
            if (result === account) {
                tokenIds.push(index);
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
