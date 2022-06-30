import { useEffect, useState } from "react";
import { Contract } from "ethers";
import VaultABI from "@/contract/Vault.json";
import { useWeb3React } from "@web3-react/core";

const useAssetAddress = (contractAddress: string): { address: string } => {
    const { active, library } = useWeb3React();
    const [address, setAddress] = useState("");
    useEffect(() => {
        if (!active) {
            return;
        }
        (async () => {
            const contract = new Contract(
                contractAddress,
                VaultABI,
                library.getSigner()
            );
            const res = await contract.assetAddress();
            setAddress(res);
        })();
    }, [active]);

    return { address };
};

export default useAssetAddress;
