import { Fragment, useEffect, useState } from "react";
import { gql, request } from "graphql-request";
import { truncateAddress } from "@/util/address";
import Pie from "@/components/pie";
import { ethers } from "ethers";
import { useNavigate } from "react-router";
import config from "@/config";
import { unknownColors } from "@/util/utils";
import { Pagination } from "antd";

const PoolExplore = () => {
    const navigate = useNavigate();
    const [pools, setPools] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState<any[]>([]);

    useEffect(() => {
        getPoolList();
    }, []);

    const getPoolList = async () => {
        const query = gql`
            {
                pools(
                    where: {
                        active: true
                        tokensCount_gt: 1
                        crp: true
                        tokensList_not: []
                    }
                    first: 20
                    skip: 0
                    orderBy: "liquidity"
                    orderDirection: "desc"
                ) {
                    id
                    publicSwap
                    finalized
                    crp
                    cap
                    rights
                    swapFee
                    totalWeight
                    totalShares
                    totalSwapVolume
                    liquidity
                    tokensList
                    swapsCount
                    tokens(orderBy: "denormWeight", orderDirection: "desc") {
                        id
                        address
                        balance
                        decimals
                        symbol
                        denormWeight
                    }
                    swaps(
                        first: 1
                        orderBy: "timestamp"
                        orderDirection: "desc"
                        where: { timestamp_lt: 1655010000 }
                    ) {
                        poolTotalSwapVolume
                    }
                }
            }
        `;

        request(config.subgraphUrl, query).then((data) => {
            if (data.pools) {
                const tokenInfo = config.tokens as unknown as {
                    [key: string]: any;
                };
                data.pools.map((pool: any) => {
                    pool.tokens.map((token: any, index: number) => {
                        const address = ethers.utils.getAddress(token.address);
                        token.color = tokenInfo[address]
                            ? tokenInfo[address]["color"]
                            : unknownColors[index];
                        return token;
                    });
                    return pool;
                });
            }
            console.log("data", data);
            setPools(data.pools);
            setCurrentPage(data.pools.slice(0, 10));
        });
    };

    return (
        <Fragment>
            <main className="flex-1 flex flex-col px-4 xl:px-8 2xl:p-12 2xl:pb-28 py-12 pb-36 text-purple-second">
                <section>
                    <header>
                        <h1 className="font-bold text-3xl mb-2">
                            Explore Pool
                        </h1>
                    </header>
                    <div className="bg-gradient-to-r from-transparent to-purple-primary h-px mb-4"></div>
                </section>
                <section>
                    <div className="rounded mt-4 bg-blue-primary px-3 pt-10 pb-20 rounded-lg md:px-8">
                        <div className="flex items-center px-4 py-3 text-right bg-purple-second bg-opacity-10 rounded-lg">
                            <div className="text-left md:w-1/12">
                                Pool address
                            </div>
                            <div className="flex-auto text-center md:text-left md:pl-4">
                                Asset
                            </div>
                            <div className="w-1/12 hidden md:inline md:text-center">
                                Swap fee
                            </div>
                            <div className="w-1/12 hidden md:inline">
                                Market cap
                            </div>
                            <div className="w-1/12 hidden md:inline">
                                My liquidity
                            </div>
                            <div className="w-1/12 hidden md:inline">
                                Volume (24h)
                            </div>
                        </div>
                        {currentPage.map((item, index) => {
                            return (
                                <div
                                    className="border-b border-purple-second border-opacity-30  hover:bg-purple-900 cursor-pointer"
                                    key={index}
                                    onClick={() => {
                                        navigate(`/pool/${item.id}/manage`);
                                    }}
                                >
                                    <div className="px-4 py-4 flex text-right justify-around items-center gap-x-4">
                                        <div className="text-left w-2/5 md:w-1/12">
                                            {truncateAddress(item.id)}
                                        </div>
                                        <div className="flex flex-auto gap-x-2 items-center text-left">
                                            <Pie
                                                size={34}
                                                values={item.tokens}
                                            />
                                            {item.tokens.map(
                                                (token: any, index: number) => {
                                                    return (
                                                        <span key={index}>
                                                            {" "}
                                                            {parseFloat(
                                                                token.denormWeight
                                                            ).toFixed(1)}{" "}
                                                            % {token.symbol}{" "}
                                                        </span>
                                                    );
                                                }
                                            )}
                                        </div>
                                        <div className="w-1/12 text-right hidden md:inline">
                                            {item.swapFee * 100} %
                                        </div>
                                        <div className="w-1/12 hidden md:inline">
                                            $ {item.cap}
                                        </div>
                                        <div className="w-1/12 hidden md:inline">
                                            $ {item.liquidity}
                                        </div>
                                        <div className="w-1/12 hidden md:inline">
                                            $ {item.totalSwapVolume}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="text-center w-full pt-8 mt-6">
                            <Pagination
                                defaultCurrent={1}
                                total={pools.length}
                                pageSize={10}
                                onChange={(page: number) => {
                                    setCurrentPage(
                                        pools.slice(10 * (page - 1), 10 * page)
                                    );
                                }}
                            />
                        </div>
                    </div>
                </section>
            </main>
        </Fragment>
    );
};

export default PoolExplore;
