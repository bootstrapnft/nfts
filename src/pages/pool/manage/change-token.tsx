import Modal from "@/pages/pool/manage/modal";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import closeIcon from "@/assets/icon/close.svg";

const ChangeToken = ({ tokens, close }: any) => {
    return (
        <Modal close={close} title="Add and remove tokens" maxW="max-w-lg">
            <div className="mt-4">
                <div className="mt-4">
                    <div className="flex text-center bg-purple-second bg-opacity-10 rounded py-2">
                        <div className="w-1/3">Tokens</div>
                        <div className="w-1/3">Balance</div>
                        <div className="w-1/5"></div>
                    </div>
                    <div className="px-3">
                        {tokens.map((token: any) => {
                            return (
                                <div
                                    className="flex text-center py-3 border-b border-purple-primary
                                border-opacity-60"
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
                                    <div className="w-1/3">420</div>
                                    <div className="w-1/5 text-right flex justify-end">
                                        <img
                                            src={closeIcon}
                                            alt=""
                                            className="w-5 h-5 cursor-pointer"
                                        />
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
                    <button className="btn-primary" disabled={true}>
                        Confirm
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ChangeToken;
