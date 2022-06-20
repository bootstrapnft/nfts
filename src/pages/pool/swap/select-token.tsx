import Modal from "@/components/modal";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { useState } from "react";

const SwapSelectToken = ({ tokensInfo, selectedToken, close }: any) => {
    const [tokenList, setTokenList] = useState(tokensInfo);

    const filter = (name: string) => {
        console.log("search name: ", name);
        if (name === "") {
            setTokenList(tokensInfo);
            return;
        }

        const tl = tokenList.filter((token: any) =>
            token.name.toLowerCase().includes(name.toLowerCase())
        );
        setTokenList(tl);
    };

    return (
        <Modal close={close} title="Select Token" maxW="max-w-lg">
            <div className="">
                <div className="w-full mt-4">
                    <input
                        type="text"
                        className="input-second w-full rounded-lg bg-purple-second text-white bg-opacity-30"
                        placeholder="Search name or paste address"
                        onChange={(e) => filter(e.target.value)}
                    />
                </div>
                <div className="p-4 border border-purple-primary mt-4 rounded-lg max-h-96 overflow-hidden overflow-y-auto">
                    {tokenList &&
                        tokenList.map((token: any) => {
                            return (
                                <div
                                    className="mt-2 py-3 px-6 flex item-center gap-x-2 item rounded-lg
                                                 cursor-pointer hover:bg-purple-second hover:text-black"
                                    key={token.id}
                                    onClick={() => {
                                        selectedToken(token);
                                        close();
                                    }}
                                >
                                    {token.logoUrl ? (
                                        <img
                                            src={token.logoUrl}
                                            alt=""
                                            className="w-6 h-6"
                                        />
                                    ) : (
                                        <Jazzicon
                                            diameter={24}
                                            seed={jsNumberForAddress(
                                                token.address
                                            )}
                                        />
                                    )}
                                    <div className="space-x-2">
                                        <span>{token.name}</span>
                                        <span className="text-sm opacity-70">
                                            {token.symbol}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    {tokenList.length === 0 && <div>no match found token</div>}
                </div>
            </div>
        </Modal>
    );
};

export default SwapSelectToken;
