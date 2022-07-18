import { gql, request } from "graphql-request";
import config from "@/config";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import VaultHeader from "@/pages/vault/header";

const VaultInfo = () => {
    const params = useParams();
    const [vaultId, setVaultId] = useState("");
    const [holdingItem, setHoldingItem] = useState("");
    const [vaultAddress, setVaultAddress] = useState("");
    const [assetAddress, setAssetAddress] = useState("");
    const [totalHoldings, setTotalHoldings] = useState("0");
    const [token, setToken] = useState<{ [key: string]: any }>({});

    useEffect(() => {
        getInfo();
    }, []);

    const getInfo = () => {
        const query = gql`
            query {
                vault(id: "${params.address}") {
                    id
                    vaultId
                    token {
                        id
                        name
                        symbol
                    }
                    asset {
                        id
                    }
                    holdings {
                        id
                        tokenId
                    }
                    totalHoldings
                }
            }
        `;
        request(config.nftSubgraphUrl, query)
            .then(async (data) => {
                if (data.vault) {
                    const vault = data.vault;
                    console.log("vault info :", data);
                    setToken(vault.token);
                    setVaultId(vault.vaultId);
                    setVaultAddress(vault.id);
                    setAssetAddress(vault.asset.id);
                    setTotalHoldings(vault.totalHoldings);

                    const holdings = vault.holdings
                        .map((item: any) => {
                            return item.tokenId;
                        })
                        .join(",");
                    setHoldingItem(holdings);
                }
            })
            .catch((err) => {});
    };

    return (
        <main className="flex-1 flex relative flex-wrap md:flex-nowrap text-purple-second lg:py-8 lg:px-20">
            <section className="relative sm:static pb-12 w-full">
                <VaultHeader
                    token={token}
                    isManager
                    type="info"
                    symbolImage={""}
                />
                <div className="my-10 px-6 lg:mx-20 max-w-lg w-full break-words">
                    <h1 className="font-bold text-2xl mb-10">Vault Detail</h1>
                    <div>
                        <h4 className="font-bold">Vault ID</h4>
                        {vaultId}
                    </div>
                    <div>
                        <h4 className="font-bold mt-6">Holdings</h4>
                        {totalHoldings}
                    </div>
                    <div>
                        <h4 className="font-bold mt-6">Vault Address</h4>
                        {vaultAddress}
                    </div>
                    <div>
                        <h4 className="font-bold mt-6">NFT Address</h4>
                        {assetAddress}
                    </div>
                    <div>
                        <h4 className="font-bold mt-6">
                            Items ({totalHoldings})
                        </h4>
                        {holdingItem}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default VaultInfo;
