import React, { ReactNode, useContext, useState } from "react";
import SelectWallet from "@/components/select_wallet";

const WalletContext = React.createContext<
    { isOpen: boolean; setIsOpen: (isOpen: boolean) => void } | undefined
>(undefined);

const WalletProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);

    const updateOpen = (isOpen: boolean) => {
        setIsOpen(isOpen);
    };

    return (
        <WalletContext.Provider value={{ isOpen, setIsOpen: updateOpen }}>
            <div>
                {children}
                {isOpen && (
                    <SelectWallet
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                    />
                )}
            </div>
        </WalletContext.Provider>
    );
};

export const useWalletSelect = () => {
    const { isOpen, setIsOpen } = useContext(WalletContext)!;
    return [isOpen, setIsOpen] as const;
};

export default WalletProvider;
