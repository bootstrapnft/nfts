import { gql, request } from "graphql-request";
import config from "@/config";

export const getPublicVaults = async (): Promise<any[]> => {
    const query = gql`
        query {
            vaults(
                where: { isFinalized: true }
                orderBy: "totalMints"
                orderDirection: "desc"
            ) {
                id
                vaultId
                token {
                    id
                    name
                    symbol
                }
                asset {
                    id
                    name
                    symbol
                }
                mints {
                    id
                    date
                    nftIds
                }
            }
        }
    `;

    let vaults: any[] = [];
    try {
        const result = await request(config.nftSubgraphUrl, query);
        if (result.vaults) {
            console.log("public vaults data", result);
            vaults = result.vaults;
        }
    } catch (e) {
        console.log("get public vault err:", e);
    }
    return vaults;
};
