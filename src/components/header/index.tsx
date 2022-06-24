import React, { Fragment, useEffect, useMemo, useState } from "react";
import SelectWallet from "@/components/select_wallet";
import { useWeb3React } from "@web3-react/core";
import { truncateAddress } from "@/util/address";
import { useNavigate } from "react-router";
import arrowDown from "@/assets/icon/arrow-down.svg";
import logo from "@/assets/logo.svg";
import ethereum from "@/assets/icon/ethereum.svg";
import aurora from "@/assets/icon/aurora.svg";
import moonbeam from "@/assets/icon/moonbeam.png";
import { gql, request } from "graphql-request";
import { Menu, Transition } from "@headlessui/react";
import { changeNetwork, currentNetwork } from "@/util/network";
import { connectors } from "@/components/select_wallet/connector";
import config from "@/config";

const Header = () => {
    const navigator = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [showTips, setShowTips] = useState(false);
    const [isManager, setIsManager] = useState(false);
    const { account, active, library, activate, chainId } = useWeb3React();

    const sessionNetwork = currentNetwork();
    const network = sessionNetwork || { id: 4, name: "rinkeby" };

    const buttonStyle =
        "inline-flex items-center justify-left outline-none font-medium \n" +
        "rounded-md break-word hover:outline focus:outline-none focus:ring-1 \n" +
        "focus:ring-opacity-75 py-2.5 px-4 bg-transparent text-lm-gray-800 \n" +
        "hover:text-purple-primary text-sm mr-1.5 lg:mr-0 dark:text-white \n" +
        "cursor-pointer text-purple-second";

    useEffect(() => {
        if (chainId && chainId !== network.id) {
            setShowTips(true);
        } else {
            setShowTips(false);
        }
    }, [chainId]);

    useEffect(() => {
        // TODO save account in local storage
        const type = localStorage.getItem("provider");
        if (type !== "injected") {
            return;
        }
        connectors.injected.isAuthorized().then((isAuthorized: boolean) => {
            if (isAuthorized) {
                activate(connectors.injected, undefined, true).catch((e) => {
                    console.log("authorized true connector err:", e);
                });
            } else {
                console.log("Injected connector not authorized");
                activate(connectors.injected, undefined, true).catch((e) => {
                    console.log("connector err:", e);
                });
            }
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!active) {
            return;
        }
        getIsManager();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    const getIsManager = () => {
        const query = gql`
      query {
        vaults(where: {manager: "${account?.toLowerCase()}"}) {
          id
        }
      }
    `;
        request(config.nftSubgraphUrl, query)
            .then((data) => {
                if (data.vaults.length > 0) {
                    setIsManager(true);
                }
            })
            .catch((err) => {
                console.log("err", err);
            });
    };

    return (
        <div className="sticky top-0 z-30">
            <header className="bg-blue-primary">
                <div className="px-10 py-2 flex flex-wrap">
                    <aside className="flex items-center">
                        <img
                            src={logo}
                            alt=""
                            className="h-8 w-48 cursor-pointer"
                            onClick={() => navigator("/")}
                        />
                    </aside>
                    <nav
                        className="hide-scroll overflow-x-scroll lg:overflow-x-visible hidden border-r
                        border-gray-100 order-4 flex-none mt-2 w-full lg:w-auto
                        lg:order-3 lg:mt-0 ml-auto text-center whitespace-nowrap lg:block lg:mr-4"
                    >
                        <div className="relative inline-flex group">
                            <button
                                className="inline-flex items-center justify-center outline-none font-medium rounded-md
                  break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-2.5 px-4
                  bg-transparent dark:text-white text-lm-gray-900 border border-transparent hover:border-opacity-50
                   hidden lg:inline-flex lg:hover:bg-transparent lg:focus:ring-0 text-purple-primary"
                            >
                                Shop
                                <span className="text-center transform ml-2">
                                    <img
                                        src={arrowDown}
                                        alt=""
                                        className="h-5 w-5"
                                    />
                                </span>
                            </button>
                            <div
                                className="lg:shadow-lg lg:absolute lg:flex lg:flex-col lg:space-y-1.5 lg:top-full lg:-left-1
                  lg:-right-4 lg:p-2 lg:rounded-lg lg:border-purple-primary lg:bg-blue-primary lg:dark:bg-gray-800 lg:border
                  lg:dark:border-gray-600 lg:hidden group-hover:inline-flex z-50"
                            >
                                <div
                                    onClick={() => navigator("/")}
                                    className={`${buttonStyle}`}
                                >
                                    Redeem
                                </div>
                                <div
                                    className={`${buttonStyle}`}
                                    onClick={() => navigator("/")}
                                >
                                    Mint
                                </div>
                                <div
                                    className={`${buttonStyle}`}
                                    onClick={() => navigator("/swap")}
                                >
                                    Swap
                                </div>
                            </div>
                        </div>

                        <div
                            className={`${buttonStyle}`}
                            onClick={() => navigator("/vault/create")}
                        >
                            Fractionalize
                        </div>

                        {isManager && (
                            <div
                                className={`${buttonStyle}`}
                                onClick={() => navigator("/vault/manage")}
                            >
                                Manage
                            </div>
                        )}

                        <div className="relative inline-flex group">
                            <button
                                className="inline-flex items-center justify-center outline-none font-medium rounded-md
                                  break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-2.5 px-4
                                  bg-transparent dark:text-white text-lm-gray-900 border border-transparent
                                  hover:text-purple-primary hidden lg:inline-flex lg:dark:hover:border-gray-900
                                  lg:hover:bg-transparent lg:focus:ring-0 text-purple-second"
                            >
                                Auction
                                <span className="text-center transform ml-2">
                                    <img
                                        src={arrowDown}
                                        alt=""
                                        className="h-5 w-5"
                                    />
                                </span>
                            </button>
                            <div
                                className="lg:shadow-lg lg:absolute lg:flex lg:flex-col lg:space-y-1.5 lg:top-full lg:-left-1
                                  lg:-right-4 lg:p-2 lg:rounded-lg lg:border-purple-primary lg:bg-blue-primary lg:dark:bg-gray-800 lg:border
                                  lg:dark:border-gray-600 lg:hidden group-hover:inline-flex z-50"
                            >
                                <button
                                    className={`${buttonStyle}`}
                                    onClick={() => navigator("/pool/create")}
                                    // href="http://124.222.87.17:8080/#/pool/new" target="_blank"
                                >
                                    Create Pool
                                </button>
                                <button
                                    className={`${buttonStyle}`}
                                    onClick={() => navigator("/pool/explore")}
                                    // href="http://124.222.87.17:8080/#/explore"  target="_blank"
                                >
                                    Explore Pools
                                </button>
                                <button
                                    className={`${buttonStyle}`}
                                    onClick={() => navigator("/pool/swap")}
                                    // href="http://124.222.87.17:3000/#/swap"  target="_blank"
                                >
                                    Swap
                                </button>
                            </div>
                        </div>
                    </nav>
                    <aside className="flex order-2 sm:order-3 justify-center md:justify-end flex-wrap ml-auto md:ml-0">
                        <div className="hidden sm:inline-flex">
                            <Menu
                                as="div"
                                className="relative inline-block text-left"
                            >
                                <div className="h-full">
                                    <Menu.Button
                                        className="btn-second mr-2 border border-purple-primary hover:bg-purple-primary
                                            hover:bg-opacity-30 h-full"
                                    >
                                        {network.name === "rinkeby" && (
                                            <img
                                                src={ethereum}
                                                alt="ethereum"
                                                className="h-5 w-5"
                                            />
                                        )}
                                        {network.name === "aurora" && (
                                            <img
                                                src={aurora}
                                                alt="aurora"
                                                className="h-5 w-5"
                                            />
                                        )}
                                        {network.name === "moonbeam" && (
                                            <img
                                                src={moonbeam}
                                                alt="moonbeam"
                                                className="h-5 w-5"
                                            />
                                        )}
                                    </Menu.Button>
                                </div>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items
                                        className="absolute right-0 mt-2 w-32 origin-top-right divide-y
                                          divide-gray-100 rounded-md bg-blue-primary shadow-lg ring-1 ring-black ring-opacity-5
                                          focus:outline-none border border-purple-primary"
                                    >
                                        <div className="px-1 py-1">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        className={`${
                                                            active
                                                                ? "bg-purple-primary text-white"
                                                                : "text-purple-second"
                                                        } group flex w-full items-center justify-between rounded-md px-5 py-2 text-sm`}
                                                        onClick={() => {
                                                            changeNetwork(
                                                                {
                                                                    id: 4,
                                                                    name: "rinkeby",
                                                                },
                                                                library.provider
                                                            );
                                                        }}
                                                    >
                                                        <img
                                                            src={ethereum}
                                                            alt="ethereum"
                                                            className="h-5 w-5"
                                                        />
                                                        <span>Rinkeby</span>
                                                    </button>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        className={`${
                                                            active
                                                                ? "bg-purple-primary text-white"
                                                                : "text-purple-second"
                                                        } group flex w-full items-center justify-between rounded-md px-5 py-2 text-sm`}
                                                        onClick={() => {
                                                            changeNetwork(
                                                                {
                                                                    id: 1313161555,
                                                                    name: "aurora",
                                                                },
                                                                library.provider
                                                            );
                                                        }}
                                                    >
                                                        <img
                                                            src={aurora}
                                                            alt="aurora"
                                                            className="h-5 w-5"
                                                        />
                                                        <span>Aurora</span>
                                                    </button>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        className={`${
                                                            active
                                                                ? "bg-purple-primary text-white"
                                                                : "text-purple-second"
                                                        } group flex w-full items-center justify-between rounded-md px-5 py-2 text-sm`}
                                                        onClick={() => {
                                                            changeNetwork(
                                                                {
                                                                    id: 1287,
                                                                    name: "moonbeam",
                                                                },
                                                                library.provider
                                                            );
                                                        }}
                                                    >
                                                        <img
                                                            src={moonbeam}
                                                            alt="moonbeam"
                                                            className="h-5 w-5"
                                                        />
                                                        <span>moonbeam</span>
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        </div>
                                    </Menu.Items>
                                </Transition>
                            </Menu>

                            <button
                                className="btn-primary"
                                onClick={() => setIsOpen(true)}
                            >
                                {!active
                                    ? "Connect"
                                    : truncateAddress(account!)}
                            </button>
                        </div>
                    </aside>
                </div>
                {showTips && (
                    <div className="bg-purple-primary text-white py-2 text-center text-sm">
                        App network ({network.name}) does not match wallet
                        network.
                    </div>
                )}
            </header>
            <SelectWallet isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
    );
};

export default Header;
