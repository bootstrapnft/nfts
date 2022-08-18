import { Contract } from "ethers";
import config from "@/config";
import DSProxyRegistryABI from "@/contract/pool/DSProxyRegistry.json";

export const truncateAddress = (address: string) =>
    [
        address.substring(0, 4),
        address.substring(address.length - 4, address.length),
    ].join("...");

export const getProxyAddress = async (library: any, account: string) => {
    const contract = new Contract(
        config.addresses.dsProxyRegistry,
        DSProxyRegistryABI,
        library.getSigner()
    );
    return await contract.proxies(account).then((res: any) => {
        console.log("proxy", res);
        if (res === "0x0000000000000000000000000000000000000000") {
            return "";
        }
        return res;
    });
};
