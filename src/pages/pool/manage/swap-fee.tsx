import Modal from "@/components/modal";
import { useState } from "react";
import { Contract, ethers } from "ethers";
import config from "@/config";
import BActionABI from "@/contract/pool/BAction.json";
import { useLoading } from "@/context/loading";
import { useWeb3React } from "@web3-react/core";
import { Interface } from "ethers/lib/utils";
import DSProxyABI from "@/contract/pool/DSProxy.json";
import { toast } from "react-toastify";

const SwapFee = ({ proxyAddress, controller, fee, close }: any) => {
    const [, setLoading] = useLoading();
    const { active, library } = useWeb3React();
    const [swapFees, setSwapFees] = useState(fee);

    const changeSwapFee = async () => {
        const swapFee = ethers.utils
            .parseEther(swapFees + "")
            .div(100)
            .toString();

        if (!active) {
            return;
        }
        setLoading(true);

        const ifac = new Interface(BActionABI);
        const data = ifac.encodeFunctionData("setSwapFee", [
            controller,
            swapFee,
        ]);
        setLoading(true);
        const contract = new Contract(
            proxyAddress,
            DSProxyABI,
            library.getSigner()
        );
        try {
            const tx = await contract.execute(config.addresses.bActions, data);
            await tx
                .wait()
                .then((res: any) => {
                    console.log("update swap fee success", res);
                    setLoading(false);
                    toast.success("Update swap fee success");
                    close();
                })
                .catch((err: any) => {
                    console.log("update swap fee err", err);
                    setLoading(false);
                });
        } catch (e) {
            console.log("update swap fee err", e);
            setLoading(false);
            toast.error("Update swap fee failed");
        }
    };

    return (
        <Modal close={close} title="Edit swap fee" maxW="max-w-lg">
            <div className="mt-4">
                <dl className="text-center">
                    <dt className="mt-4 text-lg text-purple-second">
                        Swap fee range: 0.0001% to 10%
                    </dt>
                    <dd>
                        <input
                            className={`input-second w-2/3 mt-3 ${
                                swapFees < 0
                                    ? "border-red-500 text-red-500"
                                    : ""
                            }`}
                            value={swapFees}
                            type="number"
                            step="0.0001"
                            min="0.0001"
                            max="10"
                            onChange={(e) => {
                                if (e.target.value === "") {
                                    return;
                                }
                                const val = parseFloat(e.target.value);
                                setSwapFees(val > 10 ? 10 : val);
                            }}
                        />
                    </dd>
                </dl>
                <div className="flex justify-center gap-x-4 mt-8">
                    <button
                        className="btn-primary bg-purple-primary bg-opacity-50"
                        onClick={close}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        disabled={fee === swapFees || swapFees < 0}
                        onClick={changeSwapFee}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default SwapFee;
