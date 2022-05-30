import React, { Fragment, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Web3ReactProvider } from "@web3-react/core";
import { ethers } from "ethers";

import Home from "@/pages/home";
import Header from "@/components/header";
import Create from "@/pages/create";
import Vault from "@/pages/vault";

const getLibrary = (provider: any) => {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = 8000; // frequency provider is polling
  return library;
};

function App() {
  return (
    <Fragment>
      <Suspense fallback={<div>loading...</div>}>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Header />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<Create />} />
              <Route path="/vault/:address/:type" element={<Vault />} />
            </Routes>
          </BrowserRouter>
        </Web3ReactProvider>
      </Suspense>
    </Fragment>
  );
}

export default App;
