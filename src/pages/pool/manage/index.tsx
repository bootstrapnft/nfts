import { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router";
import { Contract, ethers } from "ethers";
import { gql, request } from "graphql-request";
import { useWeb3React } from "@web3-react/core";
import { id, Interface } from "ethers/lib/utils";
import { Axis, Chart, Geom, Tooltip } from "bizcharts";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

import ChangeCap from "@/pages/pool/manage/cap";
import SwapFee from "@/pages/pool/manage/swap-fee";
import Liquidity from "@/pages/pool/manage/liquidity";
import SwapPause from "@/pages/pool/manage/swap-pause";
import SwapTable from "@/pages/pool/manage/swap-table";
import TokenTable from "@/pages/pool/manage/token-table";
import ChangeToken from "@/pages/pool/manage/change-token";
import ChangeWhiteList from "@/pages/pool/manage/whitelist";
import ChangeController from "@/pages/pool/manage/controller";
import GradualWeight from "@/pages/pool/manage/gradual-weight";
import ChangeTokenWeight from "@/pages/pool/manage/token-weight";
import RemoveLiquidity from "@/pages/pool/manage/remove-liquidity";

import { truncateAddress } from "@/util/address";
import { getPoolLiquidity } from "@/util/utils";

import config from "@/config";
import ERC20ABI from "@/contract/ERC20.json";
import MulticalABI from "@/contract/pool/Multical.json";
import DSProxyRegistryABI from "@/contract/pool/DSProxyRegistry.json";
import ConfigurableRightsPoolABI from "@/contract/pool/ConfigurableRightsPool.json";
import { getLbpData, swapPrice } from "@/util/lbpData";
import { currentNetwork } from "@/util/network";

const enum InfoBtn {
    Swap = "swap",
    Balance = "balance",
    About = "about",
    Setting = "setting",
}

const PoolManage = () => {
    const params = useParams();
    const [cap, setCap] = useState(0);
    const { active, account, library } = useWeb3React();
    const [totalShares, setTotalShares] = useState(0);
    const [pool, setPool] = useState<any>(undefined);
    const [poolBalance, setPoolBalance] = useState("0");
    const [proxyAddress, setProxyAddress] = useState("");
    const [totalLiquidity, setTotalLiquidity] = useState(0);
    const [infoBtn, setInfoBtn] = useState<InfoBtn>(InfoBtn.Balance);
    const [openLiquidity, setOpenLiquidity] = useState(false);
    const [openRemoveLiquidity, setOpenRemoveLiquidity] = useState(false);
    const [openChangeCap, setOpenChangeCap] = useState(false);
    const [openChangeToken, setOpenChangeToken] = useState(false);
    const [openGradualWeight, setOpenGradualWeight] = useState(false);
    const [openChangeSwapFee, setOpenChangeSwapFee] = useState(false);
    const [openChangeWhitelist, setOpenChangeWhitelist] = useState(false);
    const [openChangePublicSwap, setOpenChangePublicSwap] = useState(false);
    const [openChangeTokenWeight, setOpenChangeTokenWeight] = useState(false);
    const [openChangeController, setOpenChangeController] = useState(false);
    const [changeWeightBlockNum, setChangeWeightBlockNum] = useState<any>();
    const [poolLiquidity, setPoolLiquidity] = useState<any[]>([]);
    const [poolTotalSwapFee, setPoolTotalSwapFee] = useState<any[]>([]);
    const [poolTotalSwapVolume, setPoolTotalSwapVolume] = useState<any[]>([]);
    const [chartType, setChartType] = useState("Liquidity");
    const [lbpData, setLbpData] = useState<any>(null);
    const [chartPrice, setChartPrice] = useState<any[]>([]);

    useEffect(() => {
        getProxyAddress();
        getInfo();
        getPoolMetrics();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, account]);

    useEffect(() => {
        if (pool && active) {
            getMetaData();
            getPoolBalance();

            Promise.all(
                pool.tokens.map(async (token: any) => {
                    const contract = new Contract(
                        token.address,
                        ERC20ABI,
                        library.getSigner()
                    );
                    await contract
                        .balanceOf(params.address)
                        .then((res: any) => {
                            token.balance = ethers.utils.formatUnits(
                                res.toString(),
                                token.decimals
                            );
                        })
                        .catch((err: any) => {
                            console.log("balanceOf err", err);
                        });
                    return token;
                })
            )
                .then((res) => {
                    pool.tokens = res;
                    console.log("balanceOf result:", res);
                    // setPool(pool);
                })
                .catch((err) => {
                    console.log("get tokens balance err", err);
                });

            getPoolLiquidity(pool).then((res) => {
                setTotalLiquidity(res);
            });

            const lbpData = getLbpData(pool);
            setLbpData(lbpData);
            getSwaps();
            console.log("get lbpData", lbpData);
        }
    }, [pool, active]);

    const getInfo = () => {
        const query = gql`
      {
        pool(id: "${params.address}") {
          id
          active
          controller
          finalized
          crp
          swapFee
          totalWeight
          totalSwapVolume
          totalSwapFee
          createTime
          joinsCount
          exitsCount
          liquidity
          tokensList
          swapsCount
          holdersCount
          tx
          rights
          controller
          crpController
          cap
          createTime
          name
          symbol
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
            where: { timestamp_lt: 1655011996 }
          ) {
            poolTotalSwapVolume
          }
        }
      }
    `;
        request(config.subgraphUrl, query).then((data) => {
            const tokenInfo = config.tokens as unknown as {
                [key: string]: any;
            };
            data.pool.tokens.map((token: any) => {
                const address = ethers.utils.getAddress(token.address);
                token.color = tokenInfo[address]
                    ? tokenInfo[address]["color"]
                    : "#7ada6a";
                token.weightPercent =
                    (100 / data.pool.totalWeight) * token.denormWeight;
                return token;
            });
            console.log("get pool info:", data);
            setPool(data.pool);
        });
    };

    const getProxyAddress = async () => {
        if (!active) {
            return;
        }
        const contract = new Contract(
            config.addresses.dsProxyRegistry,
            DSProxyRegistryABI,
            library.getSigner()
        );
        await contract.proxies(account).then((res: any) => {
            console.log("proxy", res);
            setProxyAddress(res);
        });
    };

    const getMetaData = async () => {
        const [
            publicSwap,
            name,
            decimals,
            symbol,
            totalShares,
            rights,
            bspCap,
            crpController,
            minimumWeightChangeBlockPeriod,
            addTokenTimeLockInBlocks,
            { startBlock, endBlock },
        ] = await multicall(
            ConfigurableRightsPoolABI,
            [
                "isPublicSwap",
                "name",
                "decimals",
                "symbol",
                "totalSupply",
                "rights",
                "bspCap",
                "getController",
                "minimumWeightChangeBlockPeriod",
                "addTokenTimeLockInBlocks",
                "gradualUpdate",
            ].map((method) => [pool.controller, method, []])
        );

        console.log(
            "ccc",
            publicSwap,
            name,
            decimals,
            symbol,
            totalShares,
            rights,
            bspCap.toString(),
            crpController,
            minimumWeightChangeBlockPeriod,
            addTokenTimeLockInBlocks,
            startBlock,
            endBlock
        );

        setCap(parseInt(ethers.utils.formatEther(bspCap.toString())));
        setTotalShares(
            parseInt(ethers.utils.formatEther(totalShares.toString()))
        );
        console.log(
            "share:",
            parseInt(ethers.utils.formatEther(totalShares.toString()))
        );
        setChangeWeightBlockNum(minimumWeightChangeBlockPeriod);
    };

    const multicall = async (abi: any[], calls: any[], options?: any) => {
        console.log("multicall", calls);
        const multi = new Contract(
            config.addresses.multicall,
            MulticalABI,
            library.getSigner()
        );
        const itf = new Interface(abi);
        try {
            const [, response] = await multi.aggregate(
                calls.map((call) => [
                    call[0].toLowerCase(),
                    itf.encodeFunctionData(call[1], call[2]),
                ]),
                options || {}
            );
            return response.map((call: any, i: number) =>
                itf.decodeFunctionResult(calls[i][1], call)
            );
        } catch (e) {
            console.log("multicall err", e, calls);
            return Promise.reject();
        }
    };

    const getPoolBalance = async () => {
        const contract = new Contract(
            pool.controller,
            ERC20ABI,
            library.getSigner()
        );
        contract.balanceOf(account).then((res: any) => {
            console.log("get pool balance of:", ethers.utils.formatEther(res));
            setPoolBalance(ethers.utils.formatEther(res));
        });
    };

    const getPoolMetrics = () => {
        const day = 24 * 60 * 60 * 1000;
        const now = Date.now();
        const today = now - (now % day);
        let query = "";
        for (let i = 0; i < 31; i++) {
            const timestamp = today - i * day;
            query += `metrics_${timestamp}:swaps(first: 1, orderBy: timestamp, orderDirection: desc,
             where: {poolAddress: "${params.address}", timestamp_gt: ${
                timestamp / 1000
            }, timestamp_lt: ${(timestamp + day) / 1000} }) {
                poolTotalSwapVolume
                poolTotalSwapFee
                poolLiquidity 
             }`;
        }
        const querySql = gql`
            query {
                ${query}
            }
        `;
        request(config.subgraphUrl, querySql).then((data) => {
            const res = normalizeMetrics(data);
            const poolLiquidity: any[] = [];
            const poolTotalSwapFee: any[] = [];
            const poolTotalSwapVolume: any[] = [];

            Object.keys(res).forEach((key) => {
                const item = res[key];
                if (!item) {
                    return;
                }
                const date = new Date(
                    parseInt(key.replace("metrics_", ""))
                ).toLocaleDateString();
                poolLiquidity.push({
                    date: date,
                    price: Number(parseFloat(item.poolLiquidity).toFixed(3)),
                });
                poolTotalSwapVolume.push({
                    date: date,
                    price: Number(
                        parseFloat(item.poolTotalSwapVolume).toFixed(3)
                    ),
                });
                poolTotalSwapFee.push({
                    date: date,
                    price: Number(parseFloat(item.poolTotalSwapFee).toFixed(3)),
                });
            });
            setPoolLiquidity(poolLiquidity);
            setPoolTotalSwapVolume(poolTotalSwapVolume);
            setPoolTotalSwapFee(poolTotalSwapFee);
        });
    };

    const normalizeMetrics = (rawMetrics: any) => {
        const keys = Object.keys(rawMetrics);
        const metrics: any = {};
        for (let i = 0; i < keys.length; i++) {
            if (rawMetrics[keys[i]].length) {
                metrics[keys[i]] = rawMetrics[keys[i]][0];
            } else {
                metrics[keys[i]] = metrics[keys[i - 1]];
            }
        }
        const metricsKeys = Object.keys(metrics).reverse();
        for (let i = 0; i < metricsKeys.length; i++) {
            if (!metrics[metricsKeys[i]]) {
                metrics[metricsKeys[i]] = metrics[metricsKeys[i - 1]];
            }
        }
        return metrics;
    };

    const getSwaps = () => {
        // if (parseInt(pool.swapsCount) === 0) {

        const query = gql`
            query {
                swaps (where: {poolAddress: "${params.address}"}, first: ${pool.swapsCount}, skip: 0, orderBy: "timestamp", orderDirection: "asc")
                {
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
        request(config.subgraphUrl, query)
            .then((data) => {
                console.log("get swaps:", data);
                const swaps = data.swaps;

                const chartPrice = swaps.map((item: any) => {
                    const date = new Date(
                        item.timestamp * 1000
                    ).toLocaleDateString();
                    const price = swapPrice(pool, item);
                    return {
                        date: date,
                        price: Number(price.toFixed(3)),
                    };
                });
                console.log("chartPrice:", chartPrice);
                setChartPrice(chartPrice);
            })
            .catch((err) => {});
    };

    // @ts-ignore
    return (
        <Fragment>
            <main className="flex-1 flex flex-col px-4 xl:px-8 2xl:p-12 2xl:pb-28 py-12 text-purple-second">
                <section>
                    <header>
                        <h1 className="font-bold text-3xl mb-2">
                            Explore Pool
                        </h1>
                        {/*<p className="mb-4">Browse the decentralized NFT marketplace.</p>*/}
                    </header>
                    <div className="bg-gradient-to-r from-transparent to-purple-primary h-px mb-4"></div>
                </section>
                <section>
                    <header className="flex justify-between items-center">
                        <div className="flex gap-x-2 items-center">
                            <div className="flex justify-end sm:justify-start -space-x-3.5">
                                {pool &&
                                    pool.tokens.map(
                                        (token: any, index: number) => {
                                            const logoUrl =
                                                config.tokens[
                                                    ethers.utils.getAddress(
                                                        token.address
                                                    )
                                                ]?.logoUrl;
                                            return logoUrl ? (
                                                <img
                                                    key={index}
                                                    src={logoUrl}
                                                    alt={token.symbol}
                                                    className="w-8 h-8 rounded-full bg-slate-100 ring-2 ring-white"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div key={index}>
                                                    <Jazzicon
                                                        diameter={34}
                                                        seed={jsNumberForAddress(
                                                            token.address
                                                        )}
                                                    />
                                                </div>
                                            );
                                        }
                                    )}
                            </div>
                            <div>
                                <div className="flex gap-x-2">
                                    {pool && (
                                        <h3>
                                            {pool.name} ({pool.symbol})
                                        </h3>
                                    )}
                                </div>
                                <div className="inline-block border border-emerald-primary rounded-full text-[12px] px-2">
                                    smart pool
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-x-2">
                            <button
                                className="btn-primary"
                                onClick={() => setOpenLiquidity(true)}
                            >
                                Add liquidity
                            </button>
                            <button
                                className="inline-flex items-center justify-center outline-none font-medium
                                rounded-md break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75
                                p-2 bg-gradient-to-b hover:from-purple-primary border border-purple-primary text-purple-primary
                                hover:to-purple-primary text-sm hover:text-purple-second"
                                onClick={() => setOpenRemoveLiquidity(true)}
                            >
                                Remove liquidity
                            </button>
                        </div>
                    </header>
                    <div className="flex flex-1 justify-between flex-nowrap mt-5">
                        <div className="bg-blue-primary rounded-lg h-32 w-1/5 flex justify-center items-center flex-col">
                            <h1 className="font-bold text-2xl">
                                ${totalLiquidity}
                            </h1>
                            <h3>Liquidity</h3>
                        </div>

                        <div className="bg-blue-primary rounded-lg h-32 w-1/5 flex justify-center items-center flex-col">
                            <h1 className="font-bold text-2xl">
                                ${" "}
                                {pool &&
                                    parseFloat(pool.totalSwapVolume).toFixed(2)}
                            </h1>
                            <h3>Volume (24h)</h3>
                        </div>

                        <div className="bg-blue-primary rounded-lg h-32 w-1/5 flex justify-center items-center flex-col">
                            <h1 className="font-bold text-2xl">
                                {pool && pool.swapFee * 100}%
                            </h1>
                            <h3>Swap fee</h3>
                        </div>

                        <div className="bg-blue-primary rounded-lg h-32 w-1/5 flex justify-center items-center flex-col">
                            <h1 className="font-bold text-2xl">
                                {totalShares > 0
                                    ? (
                                          (1 / totalShares) *
                                          parseFloat(poolBalance) *
                                          100
                                      ).toFixed(2) + "%"
                                    : "-"}
                            </h1>
                            <h3>My pool share</h3>
                        </div>
                    </div>

                    <div>
                        <div className="flex gap-x-10 mt-5 px-2">
                            <div
                                className={`py-2 hover:text-purple-primary cursor-pointer 
                                ${
                                    chartType === "Liquidity"
                                        ? "text-purple-primary border-b border-purple-primary border-b-2"
                                        : ""
                                }`}
                                onClick={() => setChartType("Liquidity")}
                            >
                                Liquidity
                            </div>
                            <div
                                className={`py-2 hover:text-purple-primary cursor-pointer ${
                                    chartType === "Volume"
                                        ? "text-purple-primary border-b border-purple-primary border-b-2"
                                        : ""
                                }`}
                                onClick={() => setChartType("Volume")}
                            >
                                Volume
                            </div>
                            <div
                                className={`py-2 hover:text-purple-primary cursor-pointer ${
                                    chartType === "Fee returns"
                                        ? "text-purple-primary border-b border-purple-primary border-b-2"
                                        : ""
                                }`}
                                onClick={() => setChartType("Fee returns")}
                            >
                                Fee returns
                            </div>
                            {lbpData && (
                                <div
                                    className={`py-2 hover:text-purple-primary cursor-pointer ${
                                        chartType === "Price"
                                            ? "text-purple-primary border-b border-purple-primary border-b-2"
                                            : ""
                                    }`}
                                    onClick={() => setChartType("Price")}
                                >
                                    {lbpData.projectToken} Price
                                </div>
                            )}
                        </div>
                        <div className="bg-blue-primary h-72 w-full rounded-lg px-6 py-8 overflow-hidden">
                            <div
                                className={`${
                                    chartType !== "Price"
                                        ? ""
                                        : "opacity-0 -mt-60"
                                }`}
                            >
                                <Chart
                                    height={240}
                                    grid={null}
                                    autoFit
                                    visible={chartType !== "Price"}
                                    data={
                                        chartType === "Liquidity"
                                            ? poolLiquidity
                                            : chartType === "Volume"
                                            ? poolTotalSwapVolume
                                            : poolTotalSwapFee
                                    }
                                >
                                    <Tooltip shared />
                                    <Axis
                                        name="date"
                                        grid={null}
                                        line={null}
                                        tickLine={null}
                                        label={{ style: { fill: "#ebebeb" } }}
                                    />
                                    <Axis
                                        name="price"
                                        grid={null}
                                        line={null}
                                        label={{ style: { fill: "#ebebeb" } }}
                                    />
                                    {chartType !== "Price" && (
                                        <Geom
                                            type="interval"
                                            position="date*price"
                                            color="#31d399"
                                            active={[
                                                true,
                                                {
                                                    highlight: true,
                                                    style: {
                                                        color: "#fff",
                                                    },
                                                },
                                            ]}
                                        />
                                    )}
                                    {chartType === "Price" && (
                                        <Geom
                                            type="line"
                                            position="date*price"
                                            color="#31d399"
                                            shape={"smooth"}
                                        />
                                    )}
                                </Chart>
                            </div>
                            <Chart
                                height={240}
                                grid={null}
                                autoFit
                                visible={chartType === "Price"}
                                data={chartPrice}
                            >
                                <Tooltip shared />
                                <Axis
                                    name="date"
                                    grid={null}
                                    line={null}
                                    tickLine={null}
                                    label={{ style: { fill: "#ebebeb" } }}
                                />
                                <Axis
                                    name="price"
                                    grid={null}
                                    line={null}
                                    label={{ style: { fill: "#ebebeb" } }}
                                />
                                <Geom
                                    type="line"
                                    position="date*price"
                                    color="#31d399"
                                    shape={"smooth"}
                                />
                            </Chart>
                        </div>
                    </div>

                    <div>
                        <div className="flex gap-x-10 mt-5 px-2">
                            <div
                                className={`py-2 hover:text-purple-primary cursor-pointer flex items-center gap-x-1
                                ${
                                    infoBtn === InfoBtn.Balance
                                        ? "border-b-2 text-purple-primary border-b border-purple-primary"
                                        : ""
                                }`}
                                onClick={() => setInfoBtn(InfoBtn.Balance)}
                            >
                                Balance{" "}
                                <span
                                    className="inline-block border border-purple-primary
                                    text-purple-primary rounded-full w-4 h-4 text-xs text-center leading-3"
                                >
                                    {pool && pool.tokens.length}
                                </span>
                            </div>
                            <div
                                className={`py-2 hover:text-purple-primary cursor-pointer flex items-center gap-x-1
                                ${
                                    infoBtn === InfoBtn.Swap
                                        ? "border-b-2 text-purple-primary border-b border-purple-primary"
                                        : ""
                                }`}
                                onClick={() => setInfoBtn(InfoBtn.Swap)}
                            >
                                Swap{" "}
                                {pool && Number(pool.swapsCount) > 0 && (
                                    <span
                                        className="inline-block border border-purple-primary
                                    text-purple-primary rounded-full w-4 h-4 text-xs text-center leading-3"
                                    >
                                        {pool.swapsCount}
                                    </span>
                                )}
                            </div>
                            <div
                                className={`py-2 hover:text-purple-primary cursor-pointer
                                ${
                                    infoBtn === InfoBtn.About
                                        ? "border-b-2 text-purple-primary border-b border-purple-primary"
                                        : ""
                                }`}
                                onClick={() => setInfoBtn(InfoBtn.About)}
                            >
                                About
                            </div>
                            {pool &&
                                proxyAddress.toLowerCase() ===
                                    pool.crpController && (
                                    <div
                                        className={`py-2 hover:text-purple-primary cursor-pointer
                                ${
                                    infoBtn === InfoBtn.Setting
                                        ? "border-b-2 text-purple-primary border-b border-purple-primary"
                                        : ""
                                }`}
                                        onClick={() =>
                                            setInfoBtn(InfoBtn.Setting)
                                        }
                                    >
                                        Settings
                                    </div>
                                )}
                        </div>
                        <div className="bg-blue-primary pt-8 py-16 px-8 w-full">
                            {infoBtn === InfoBtn.Balance && (
                                <TokenTable pool={pool} />
                            )}
                            {infoBtn === InfoBtn.Swap && (
                                <SwapTable
                                    pool={pool}
                                    address={params.address}
                                />
                            )}
                            {infoBtn === InfoBtn.About && pool && (
                                <div>
                                    <div>
                                        <dt className="text-gray-400 text-xs">
                                            Pool type
                                        </dt>
                                        <dd className="text-xl font-medium">
                                            Smart pool
                                        </dd>
                                    </div>
                                    <div className="mt-2">
                                        <dt className="text-gray-400 text-xs">
                                            Rights
                                        </dt>
                                        {pool.rights.map(
                                            (item: any, index: number) => {
                                                return (
                                                    <dd
                                                        className="text-lg font-medium"
                                                        key={index}
                                                    >
                                                        {item}
                                                    </dd>
                                                );
                                            }
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <dt className="text-gray-400 text-xs">
                                            cap
                                        </dt>
                                        <dd className="text-xl font-medium">
                                            {cap}
                                        </dd>
                                    </div>

                                    <div className="mt-2">
                                        <dt className="text-gray-400 text-xs">
                                            Controller
                                        </dt>
                                        <dd className="text-xl font-medium flex items-center gap-x-2">
                                            <Jazzicon
                                                diameter={22}
                                                seed={jsNumberForAddress(
                                                    pool.controller
                                                )}
                                            />
                                            {truncateAddress(pool.controller)}
                                        </dd>
                                    </div>

                                    <div className="mt-2">
                                        <dt className="text-gray-400 text-xs">
                                            Smart Controller
                                        </dt>
                                        <dd className="text-xl font-medium flex items-center gap-x-2">
                                            <Jazzicon
                                                diameter={22}
                                                seed={jsNumberForAddress(
                                                    pool.crpController
                                                )}
                                            />
                                            {truncateAddress(
                                                pool.crpController
                                            )}
                                        </dd>
                                    </div>
                                    <div className="mt-2">
                                        <dt className="text-gray-400 text-xs">
                                            Creation date
                                        </dt>
                                        <dd className="text-xl font-medium">
                                            {new Date(
                                                pool.createTime * 1000
                                            ).toLocaleString()}
                                        </dd>
                                    </div>
                                    <div className="mt-2">
                                        <dt className="text-gray-400 text-xs">
                                            Swap fee
                                        </dt>
                                        <dd className="text-xl font-medium">
                                            {pool.swapFee * 100}%
                                        </dd>
                                    </div>
                                    <div className="mt-2">
                                        <dt className="text-gray-400 text-xs">
                                            Total swap volume
                                        </dt>
                                        <dd className="text-xl font-medium">
                                            {parseFloat(
                                                pool.totalSwapVolume
                                            ).toFixed(2)}
                                        </dd>
                                    </div>
                                    <div className="mt-2">
                                        <dt className="text-gray-400 text-xs">
                                            Total swap fee
                                        </dt>
                                        <dd className="text-xl font-medium">
                                            {parseFloat(
                                                pool.totalSwapFee
                                            ).toFixed(2)}
                                        </dd>
                                    </div>
                                </div>
                            )}
                            {infoBtn === InfoBtn.Setting && (
                                <div>
                                    <div className="flex justify-between items-center border-b border-purple-primary pb-4 border-opacity-50">
                                        <dl>
                                            <dt className="text-sm">
                                                Public swap
                                            </dt>
                                            <dd className="text-2xl font-bold text-white">
                                                Enable
                                            </dd>
                                        </dl>
                                        <div>
                                            <button
                                                className="btn-primary"
                                                onClick={() =>
                                                    setOpenChangePublicSwap(
                                                        true
                                                    )
                                                }
                                            >
                                                Toggle
                                            </button>
                                        </div>
                                    </div>

                                    <div
                                        className="flex justify-between items-center border-b border-purple-primary pb-4
                        border-opacity-50 mt-6"
                                    >
                                        <dl>
                                            <dt className="text-sm">
                                                Swap fee
                                            </dt>
                                            <dd className="text-2xl font-bold text-white">
                                                {parseFloat(pool.swapFee) * 100}{" "}
                                                %
                                            </dd>
                                        </dl>
                                        <div>
                                            <button
                                                className="btn-primary"
                                                onClick={() =>
                                                    setOpenChangeSwapFee(true)
                                                }
                                            >
                                                Change
                                            </button>
                                        </div>
                                    </div>
                                    <div
                                        className="flex justify-between items-center border-b border-purple-primary pb-4
                        border-opacity-50 mt-6"
                                    >
                                        <dl>
                                            <dt className="text-sm">
                                                Manage weight
                                            </dt>
                                            <dd className="text-2xl font-bold">
                                                {""}
                                            </dd>
                                        </dl>
                                        <div className="space-x-3">
                                            <button
                                                className="btn-primary"
                                                onClick={() =>
                                                    setOpenGradualWeight(true)
                                                }
                                            >
                                                Update Gradually
                                            </button>
                                            <button
                                                className="btn-primary"
                                                onClick={() =>
                                                    setOpenChangeTokenWeight(
                                                        true
                                                    )
                                                }
                                            >
                                                Update
                                            </button>
                                        </div>
                                    </div>
                                    <div
                                        className="flex justify-between items-center border-b border-purple-primary pb-4
                        border-opacity-50 mt-6"
                                    >
                                        <dl>
                                            <dt className="text-sm">Tokens</dt>
                                            <dd className="flex gap-x-6 mt-2 ">
                                                {pool.tokens.map(
                                                    (
                                                        token: any,
                                                        index: number
                                                    ) => {
                                                        return (
                                                            <div
                                                                className="flex items-center gap-x-2"
                                                                key={index}
                                                            >
                                                                <Jazzicon
                                                                    diameter={
                                                                        22
                                                                    }
                                                                    seed={jsNumberForAddress(
                                                                        token.address
                                                                    )}
                                                                />
                                                                <span>
                                                                    {
                                                                        token.symbol
                                                                    }
                                                                </span>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </dd>
                                        </dl>
                                        <div>
                                            <button
                                                className="btn-primary"
                                                onClick={() =>
                                                    setOpenChangeToken(true)
                                                }
                                            >
                                                Change
                                            </button>
                                        </div>
                                    </div>
                                    <div
                                        className="flex justify-between items-center border-b border-purple-primary pb-4
                        border-opacity-50 mt-6"
                                    >
                                        <dl>
                                            <dt className="text-sm">Cap</dt>
                                            <dd className="text-2xl font-bold text-white">
                                                {cap}
                                            </dd>
                                        </dl>
                                        <div>
                                            <button
                                                className="btn-primary"
                                                onClick={() =>
                                                    setOpenChangeCap(true)
                                                }
                                            >
                                                Change
                                            </button>
                                        </div>
                                    </div>
                                    {pool.rights.includes(
                                        "canWhitelistLPs"
                                    ) && (
                                        <div
                                            className="flex justify-between items-center border-b border-purple-primary pb-4
                                            border-opacity-50 mt-6"
                                        >
                                            <dl>
                                                <dt className="text-sm">
                                                    LP whitelist
                                                </dt>
                                                <dd className="text-2xl font-bold">
                                                    {""}
                                                </dd>
                                            </dl>
                                            <div>
                                                <button
                                                    className="btn-primary"
                                                    onClick={() =>
                                                        setOpenChangeWhitelist(
                                                            true
                                                        )
                                                    }
                                                >
                                                    Manage
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <div
                                        className="flex justify-between items-center border-b border-purple-primary pb-4
                        border-opacity-50 mt-6"
                                    >
                                        <dl>
                                            <dt className="text-sm">
                                                Controller
                                            </dt>
                                            <dd className="text-xl font-bold text-white">
                                                {proxyAddress}
                                            </dd>
                                        </dl>
                                        <div>
                                            <button
                                                className="btn-primary"
                                                onClick={() =>
                                                    setOpenChangeController(
                                                        true
                                                    )
                                                }
                                            >
                                                Change
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
            {openLiquidity && (
                <Liquidity
                    poolInfo={pool}
                    proxyAddress={proxyAddress}
                    totalShares={totalShares}
                    tokens={pool.tokens}
                    cap={cap}
                    close={() => setOpenLiquidity(false)}
                />
            )}
            {openRemoveLiquidity && (
                <RemoveLiquidity
                    poolInfo={pool}
                    proxyAddress={proxyAddress}
                    totalShares={totalShares}
                    tokens={pool.tokens}
                    close={() => setOpenRemoveLiquidity(false)}
                />
            )}
            {openChangePublicSwap && (
                <SwapPause
                    proxyAddress={proxyAddress}
                    controller={pool.controller}
                    status={true}
                    close={() => setOpenChangePublicSwap(false)}
                />
            )}
            {openChangeSwapFee && (
                <SwapFee
                    proxyAddress={proxyAddress}
                    controller={pool.controller}
                    fee={parseFloat(pool.swapFee) * 100}
                    close={() => setOpenChangeSwapFee(false)}
                />
            )}
            {openChangeTokenWeight && (
                <ChangeTokenWeight
                    proxyAddress={proxyAddress}
                    pool={pool}
                    totalShares={totalShares}
                    close={() => setOpenChangeTokenWeight(false)}
                />
            )}
            {openGradualWeight && (
                <GradualWeight
                    proxyAddress={proxyAddress}
                    pool={pool}
                    changeBlockNum={changeWeightBlockNum}
                    totalShares={totalShares}
                    close={() => setOpenGradualWeight(false)}
                />
            )}
            {openChangeToken && (
                <ChangeToken
                    proxyAddress={proxyAddress}
                    controller={pool.controller}
                    symbol={pool.symbol}
                    tokens={pool.tokens}
                    totalShares={totalShares}
                    totalWeight={pool.totalWeight}
                    close={() => setOpenChangeToken(false)}
                />
            )}
            {openChangeCap && (
                <ChangeCap
                    proxyAddress={proxyAddress}
                    controller={pool.controller}
                    cap={cap}
                    close={() => setOpenChangeCap(false)}
                />
            )}
            {openChangeWhitelist && (
                <ChangeWhiteList
                    proxyAddress={proxyAddress}
                    controller={pool.controller}
                    close={() => setOpenChangeWhitelist(false)}
                />
            )}
            {openChangeController && (
                <ChangeController
                    proxyAddress={proxyAddress}
                    controller={pool.controller}
                    close={() => setOpenChangeController(false)}
                />
            )}
        </Fragment>
    );
};

export default PoolManage;
