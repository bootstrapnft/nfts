import React, { Fragment, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useWeb3React, Web3ReactProvider } from "@web3-react/core";
import { ethers } from "ethers";

import Home from "@/pages/home";
import Header from "@/components/header";
import Create from "@/pages/create";
import Vault from "@/pages/vault";
import VaultManager from "@/pages/vault/manage";
import VaultMint from "./pages/vault/mint";
import "./App.scss";
import VaultRedeem from "@/pages/vault/redeem";
import LoadingProvider from "@/context/loading";
import PoolCreate from "@/pages/pool/create";
import PoolExplore from "@/pages/pool/explore";
import Footer from "@/components/footer";
import PoolManage from "@/pages/pool/manage";
import VaultSwap from "@/pages/vault/swap";
import { connectors } from "@/components/select_wallet/connector";
import OwnerVault from "@/pages/vault/owner";
import PoolSwap from "@/pages/pool/swap";
import VaultInfo from "@/pages/vault/info";

const getLibrary = (provider: any) => {
    const library = new ethers.providers.Web3Provider(provider);
    library.pollingInterval = 8000; // frequency provider is polling
    return library;
};

const App = () => {
    const { activate } = useWeb3React();
    useEffect(() => {
        // TODO save account in local storage
        connectors.injected.isAuthorized().then((isAuthorized: boolean) => {
            if (isAuthorized) {
                activate(connectors.injected, undefined, true).catch(() => {
                    console.log("Injected connector not authorized");
                });
            } else {
                console.log("Injected connector not authorized 111");
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Fragment>
            <Suspense fallback={<div>loading...</div>}>
                <Web3ReactProvider getLibrary={getLibrary}>
                    <LoadingProvider>
                        <BrowserRouter>
                            <Header />
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route
                                    path="/vault/create"
                                    element={<Create />}
                                />
                                <Route
                                    path="/vault/:address/buy"
                                    element={<Vault />}
                                />
                                <Route
                                    path="/vault/:address/mint"
                                    element={<VaultMint />}
                                />
                                <Route
                                    path="/vault/:address/redeem"
                                    element={<VaultRedeem />}
                                />
                                <Route
                                    path="/vault/:address/manage"
                                    element={<VaultManager />}
                                />
                                <Route
                                    path="/vault/:address/swap"
                                    element={<VaultSwap />}
                                />
                                <Route
                                    path="/vault/:address/info"
                                    element={<VaultInfo />}
                                />
                                <Route
                                    path="/pool/swap"
                                    element={<PoolSwap />}
                                />
                                <Route
                                    path="/pool/create"
                                    element={<PoolCreate />}
                                />
                                <Route
                                    path="/vault/manage"
                                    element={<OwnerVault />}
                                />
                                <Route
                                    path="/pool/explore"
                                    element={<PoolExplore />}
                                />
                                <Route
                                    path="/pool/:address/manage"
                                    element={<PoolManage />}
                                />
                            </Routes>
                            <Footer />
                        </BrowserRouter>
                    </LoadingProvider>
                </Web3ReactProvider>
            </Suspense>
        </Fragment>
    );
};

export default App;
