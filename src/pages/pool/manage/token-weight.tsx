import { useEffect, useState } from "react";
import Modal from "@/components/modal";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { Contract } from "ethers";
import {
    bnum,
    calcSingleInGivenWeightIncrease,
    scale,
    toWei,
} from "@/util/math";
import { ethers } from "ethers/lib.esm";
import { Interface } from "ethers/lib/utils";
import BActionABI from "@/contract/pool/BAction.json";
import DSProxyABI from "@/contract/pool/DSProxy.json";
import rinkeby from "@/config/rinkeby.json";
import { useLoading } from "@/context/loading";
import { useWeb3React } from "@web3-react/core";

const ChangeTokenWeight = ({ proxyAddress, pool, close }: any) => {
    const divisor = 100 / 25;
    const maxPercentage = 100 - divisor;
    const [, setLoading] = useLoading();
    const { active, library } = useWeb3React();
    const [totalWeights, setTotalWeights] = useState(1);
    const [weights, setWeights] = useState<{ [key: string]: any }>({});
    const [initialPercentages, setInitialPercentages] = useState<{
        [key: string]: any;
    }>({});

    useEffect(() => {
        const w: { [key: string]: any } = {};
        pool.tokens.map(
            (token: any) =>
                (w[token.symbol] = divisor * parseFloat(token.denormWeight))
        );
        setWeights(w);

        let totalWeight = 0;
        Object.keys(w).map((key: string) => (totalWeight += w[key]));
        setTotalWeights(totalWeight);

        const initialPercentages: { [key: string]: any } = {};
        pool.tokens.map(
            (token: any) =>
                (initialPercentages[token.symbol] =
                    parseFloat(token.denormWeight) /
                    parseFloat(pool.totalWeight))
        );
        setInitialPercentages(initialPercentages);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpdate = async () => {
        console.log("update", pool, weights);

        const tokenWeiAmountIn = calcSingleInGivenWeightIncrease(
            scale(bnum(pool.tokens[0].balance), pool.tokens[0].decimals),
            toWei(pool.tokens[0].denormWeight),
            toWei(weights[pool.tokens[0].symbol])
        );

        const token = pool.tokens[0];
        const newWeight = ethers.utils.parseEther(
            weights[token.symbol].toString()
        );
        const tokenAddress = ethers.utils.getAddress(token.address);

        console.log(
            "res",
            pool.controller,
            tokenAddress,
            newWeight.toString(),
            tokenWeiAmountIn.toString()
        );

        const ifac = new Interface(BActionABI);
        const data = ifac.encodeFunctionData("increaseWeight", [
            pool.controller,
            tokenAddress,
            newWeight,
            tokenWeiAmountIn,
        ]);
        setLoading(true);
        const contract = new Contract(
            proxyAddress,
            DSProxyABI,
            library.getSigner()
        );
        const tx = await contract.execute(rinkeby.addresses.bActions, data);
        await tx
            .wait()
            .then((res: any) => {
                console.log("update weight success", res);
                setLoading(false);
                close();
            })
            .catch((err: any) => {
                console.log("update weight err", err);
                setLoading(false);
            });

        console.log(
            "res",
            pool.controller,
            tokenAddress,
            newWeight,
            tokenWeiAmountIn
        );
    };

    return (
        <Modal close={close} title="Edit token weights" maxW="max-w-lg">
            <div className="mt-4">
                <div className="mt-4">
                    <div className="flex text-center bg-purple-second bg-opacity-10 rounded py-2">
                        <div className="w-1/3">Tokens</div>
                        <div className="w-1/3">Weights</div>
                        <div className="w-1/3">Percent</div>
                    </div>
                    <div className="px-3">
                        {pool.tokens.map((token: any, index: number) => {
                            return (
                                <div
                                    className="flex text-center py-3 border-b border-purple-primary
                                        border-opacity-60"
                                    key={index}
                                >
                                    <div className="flex items-center gap-x-2 w-1/3 pl-3">
                                        <Jazzicon
                                            diameter={22}
                                            seed={jsNumberForAddress(
                                                token.address
                                            )}
                                        />
                                        <span>{token.symbol}</span>
                                    </div>
                                    <div className="w-1/3">
                                        <input
                                            className="border text-lg font-mono transition-colors w-20 px-2
                                                  border-lm-gray-300 rounded-sm  text-gray-700 bg-white focus:outline-none
                                                  focus:border-purple-primary focus:ring-0 text-center"
                                            type="number"
                                            value={weights[token.symbol] || 0}
                                            min="1"
                                            step="1"
                                            onChange={(e: any) => {
                                                const newWeights: {
                                                    [key: string]: any;
                                                } = { ...weights };
                                                newWeights[token.symbol] =
                                                    parseFloat(e.target.value);
                                                setWeights(newWeights);
                                            }}
                                        />
                                    </div>
                                    <div className="w-1/3">
                                        {(
                                            initialPercentages[token.symbol] *
                                            100
                                        ).toFixed(2)}{" "}
                                        % →
                                        {(
                                            (weights[token.symbol] /
                                                totalWeights) *
                                            100
                                        ).toFixed(2)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="flex justify-center gap-x-4 mt-8">
                    <button
                        className="btn-primary bg-purple-primary bg-opacity-50"
                        onClick={close}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        disabled={false}
                        onClick={handleUpdate}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ChangeTokenWeight;
