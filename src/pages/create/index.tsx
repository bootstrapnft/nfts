import { Fragment, useEffect, useState } from "react";
import CreateForm from "@/pages/create/create";
import Review from "@/pages/create/review";
import { useWeb3React } from "@web3-react/core";
import config from "@/config";
import VaultFactory from "@/contract/VaultFactory.json";
import { Contract, ethers } from "ethers";
import Created from "@/pages/create/created";
import { useLoading } from "@/context/loading";
import { toast } from "react-toastify";

const enum State {
    Create,
    Review,
    Created,
}

const Create = () => {
    const [nftAssetAddress, setNftAssetAddress] = useState("");
    const [vaultName, setVaultName] = useState("");
    const [vaultSymbol, setVaultSymbol] = useState("");
    const [vaultAddress, setVaultAddress] = useState("");
    const [state, setState] = useState(State.Create);
    const { library, account, active } = useWeb3React();
    const [, setLoading] = useLoading();

    const changeState = (status: State) => {
        setState(status);
    };

    const create = async () => {
        setLoading(true);
        try {
            const contract = new Contract(
                config.addresses.VaultFactoryAddress,
                VaultFactory,
                library.getSigner()
            );
            const tx = await contract.createVault(
                vaultName,
                vaultSymbol,
                nftAssetAddress,
                false,
                true
            );
            tx.wait().then((res: any) => {
                console.log("create vault:", res);
                for (let i = 0; i < res.events.length; i++) {
                    if (res.events[i].event === "NewVault") {
                        console.log(res.events[i].args);
                        console.log(res.events[i].args[1]);
                        setVaultAddress(res.events[i].args[1]);
                    }
                }
                changeState(State.Created);
                setLoading(false);
                toast.success("Vault created successfully!");
            });
        } catch (e) {
            console.log("create vault err:", e);
            setLoading(false);
            toast.error("Create vault failed!");
        }
    };

    useEffect(() => {
        if (!active) {
            return;
        }
        console.log("account", account);
        library.getBalance(account).then((balance: any) => {
            console.log("balance", ethers.utils.formatEther(balance));
        });

        const contract = new Contract(
            config.addresses.VaultFactoryAddress,
            VaultFactory,
            library.getSigner()
        );
        const tx = contract.allVaults().then((res: any) => {
            console.log("all", res);
        });
    }, [account]);

    return (
        <Fragment>
            <main className="flex-1 flex flex-col px-4 xl:px-8 2xl:p-12 py-12">
                <div className="mx-auto my-10 max-w-lg w-full">
                    {active && (
                        <div
                            className="rounded-md shadow-xl dark:text-white text-lm-gray-700 dark:bg-gray-800
                    bg-lm-gray-100 border dark:border-gray-700 border-transparent p-6"
                        >
                            {state === State.Create && (
                                <CreateForm
                                    nftAssetAddress={nftAssetAddress}
                                    vaultName={vaultName}
                                    vaultSymbol={vaultSymbol}
                                    changeState={() =>
                                        changeState(State.Review)
                                    }
                                    setNftAssetAddress={setNftAssetAddress}
                                    setVaultName={setVaultName}
                                    setVaultSymbol={setVaultSymbol}
                                />
                            )}
                            {state === State.Review && (
                                <Review
                                    address={nftAssetAddress}
                                    name={vaultName}
                                    symbol={vaultSymbol}
                                    create={create}
                                />
                            )}
                            {state === State.Created && (
                                <Created
                                    address={vaultAddress}
                                    name={vaultName}
                                    symbol={vaultSymbol}
                                    assetAddress={nftAssetAddress}
                                />
                            )}
                        </div>
                    )}
                </div>
            </main>
        </Fragment>
    );
};

export default Create;
