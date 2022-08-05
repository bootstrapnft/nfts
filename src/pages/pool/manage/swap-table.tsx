import { Pagination } from "antd";
import { Fragment, useEffect, useState } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { gql, request } from "graphql-request";
import config from "@/config";

const SwapTable = ({ pool, address }: any) => {
    const [swaps, setSwaps] = useState<any[]>([]);

    useEffect(() => {
        getSwap();
    }, []);

    const getSwap = (pageIndex: number = 1, pageSize: number = 20) => {
        const query = gql`
            {
                swaps(
                    where: { poolAddress: "${address}" }
                    first: ${pageSize}
                    skip: ${(pageIndex - 1) * pageSize}
                    orderBy: "timestamp"
                    orderDirection: "desc"
                ) {
                    id
                    tokenIn
                    tokenInSym
                    tokenAmountIn
                    tokenOut
                    tokenOutSym
                    tokenAmountOut
                    poolTotalSwapVolume
                    timestamp
                    value
                    feeValue
                }
            }
        `;

        request(config.subgraphUrl, query).then((data) => {
            console.log(data);
            setSwaps(data.swaps);
        });
    };

    return (
        <Fragment>
            <table className="w-full">
                <thead className="bg-purple-second bg-opacity-10">
                    <tr className="text-sm font-light">
                        <th className="text-left w-1/2 h-12 pl-4 rounded-l-lg">
                            Time
                        </th>
                        <th className="text-left">Trade in</th>
                        <th className="text-left">Trade out</th>
                        <th className="text-right pr-4 rounded-r-lg">
                            Swap fee
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {swaps &&
                        swaps.map((swap: any, index: number) => {
                            return (
                                <tr
                                    className="text-sm font-light border-b border-purple-second border-opacity-50"
                                    key={index}
                                >
                                    <td className="text-left w-2/3 h-12 pl-4">
                                        {new Date(
                                            swap.timestamp * 1000
                                        ).toUTCString()}
                                    </td>
                                    <td>
                                        <div className="flex items-center justify-start gap-x-2 h-12">
                                            <Jazzicon
                                                diameter={22}
                                                seed={jsNumberForAddress(
                                                    swap.tokenIn
                                                )}
                                            />
                                            <div>
                                                {parseFloat(
                                                    swap.tokenAmountIn
                                                ).toFixed(3)}
                                            </div>
                                            <div>{swap.tokenInSym}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center justify-start gap-x-2 h-12">
                                            <Jazzicon
                                                diameter={22}
                                                seed={jsNumberForAddress(
                                                    swap.tokenOut
                                                )}
                                            />
                                            <div>
                                                {parseFloat(
                                                    swap.tokenAmountOut
                                                ).toFixed(3)}
                                            </div>
                                            <div>{swap.tokenOutSym}</div>
                                        </div>
                                    </td>
                                    <td className="text-right pr-4">
                                        $ {parseFloat(swap.feeValue).toFixed(4)}
                                    </td>
                                </tr>
                            );
                        })}
                </tbody>
            </table>
            {pool.swapsCount > 0 && (
                <div className="text-center w-full pt-8">
                    <Pagination
                        defaultCurrent={1}
                        total={pool.swapsCount}
                        pageSize={10}
                        onChange={(page, pageSize) => getSwap(page, pageSize)}
                    />
                </div>
            )}
        </Fragment>
    );
};

export default SwapTable;
