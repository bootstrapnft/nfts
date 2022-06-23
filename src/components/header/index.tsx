import { useEffect, useState } from "react";
import SelectWallet from "@/components/select_wallet";
import { useWeb3React } from "@web3-react/core";
import { truncateAddress } from "@/util/address";
import { useNavigate } from "react-router";
import arrowDown from "@/assets/icon/arrow-down.svg";
import logo from "@/assets/logo.svg";
import ethereum from "@/assets/icon/ethereum.svg";
import aurora from "@/assets/icon/aurora.svg";
import { gql, request } from "graphql-request";
import rinkeby from "@/config/rinkeby.json";
import { Menu, Transition } from "@headlessui/react";

const Header = () => {
    const navigator = useNavigate();
    const { account, active } = useWeb3React();
    const [isOpen, setIsOpen] = useState(false);
    const [isManager, setIsManager] = useState(false);

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
        request(rinkeby.nftSubgraphUrl, query)
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
                <div className="px-4 py-2 flex flex-wrap">
                    <aside className="flex items-center">
                        <img src={logo} alt="" className="h-8 w-48" />
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
                                <span className="text-center transform rotate-90 ml-2">
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
                                    className="inline-flex items-center justify-left outline-none font-medium rounded-md break-word
                      hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-2.5 px-4 bg-transparent
                      dark:text-white text-lm-gray-800  hover:text-purple-primary
                      text-sm mr-1.5 lg:mr-0 dark:text-white cursor-pointer text-purple-second"
                                >
                                    Redeem
                                </div>
                                <div
                                    className="inline-flex items-center justify-left outline-none font-medium
                                rounded-md break-word hover:outline focus:outline-none focus:ring-1
                                focus:ring-opacity-75 py-2.5 px-4 bg-transparent dark:text-white
                                text-lm-gray-900 border border-transparent hover:text-purple-primary text-sm lg:text-base mr-1.5
                                dark:text-white cursor-pointer text-left text-purple-second"
                                    onClick={() => navigator("/")}
                                >
                                    Mint
                                </div>
                                <div
                                    className="inline-flex items-center justify-left outline-none font-medium
                                rounded-md break-word hover:outline focus:outline-none focus:ring-1
                                focus:ring-opacity-75 py-2.5 px-4 bg-transparent dark:text-white
                                text-lm-gray-900 border border-transparent hover:border-opacity-50
                                hover:text-purple-primary text-sm lg:text-base mr-1.5
                                dark:text-white cursor-pointer text-left text-purple-second"
                                    onClick={() => navigator("/swap")}
                                >
                                    Swap
                                </div>
                            </div>
                        </div>

                        <div
                            className="inline-flex items-center justify-center outline-none font-medium
              rounded-md break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75
              py-2.5 px-4 bg-transparent dark:text-white text-lm-gray-900 border border-transparent
              hover:text-purple-primary text-sm lg:text-base text-purple-second
              mr-1.5 dark:text-white cursor-pointer"
                            onClick={() => navigator("/vault/create")}
                        >
                            Fractionalize
                        </div>

                        {isManager && (
                            <div
                                className="inline-flex items-center justify-center outline-none font-medium
              rounded-md break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75
              py-2.5 px-4 bg-transparent dark:text-white text-lm-gray-900 border border-transparent
              hover:text-purple-primary text-sm lg:text-base text-purple-second
              mr-1.5 dark:text-white cursor-pointer"
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
                                <span className="text-center transform rotate-90 ml-2">
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
                                    className="inline-flex items-center justify-left outline-none font-medium
                                rounded-md break-word hover:outline focus:outline-none focus:ring-1
                                focus:ring-opacity-75 py-2.5 px-4 bg-transparent dark:text-white
                                text-lm-gray-900 border border-transparent hover:border-opacity-50
                                text-sm lg:text-base mr-1.5 text-purple-second
                                dark:text-white cursor-pointer text-left"
                                    onClick={() => navigator("/pool/create")}
                                    // href="http://124.222.87.17:8080/#/pool/new" target="_blank"
                                >
                                    Create Pool
                                </button>
                                <button
                                    className="inline-flex items-center justify-left outline-none font-medium
                                rounded-md break-word hover:outline focus:outline-none focus:ring-1
                                focus:ring-opacity-75 py-2.5 px-4 bg-transparent dark:text-white
                                text-lm-gray-900 border border-transparent hover:border-opacity-50
                                text-sm lg:text-base mr-1.5 text-purple-second
                                dark:text-white cursor-pointer text-left"
                                    onClick={() => navigator("/pool/explore")}
                                    // href="http://124.222.87.17:8080/#/explore"  target="_blank"
                                >
                                    Explore Pools
                                </button>
                                <button
                                    className="inline-flex items-center justify-left outline-none font-medium
                                rounded-md break-word hover:outline focus:outline-none focus:ring-1
                                focus:ring-opacity-75 py-2.5 px-4 bg-transparent dark:text-white
                                text-lm-gray-900 border border-transparent hover:border-opacity-50
                                text-sm lg:text-base mr-1.5 text-purple-second
                                dark:text-white cursor-pointer text-left"
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
                            {/*<Menu as="div" className="relative inline-block text-left">*/}
                            {/*  <div className="h-full">*/}
                            {/*    <Menu.Button className="btn-second mr-2 border border-purple-primary hover:bg-purple-primary*/}
                            {/*      hover:bg-opacity-30 h-full">*/}
                            {/*      <img src={ethereum} alt="ethereum" className="h-5 w-5" />*/}
                            {/*    </Menu.Button>*/}
                            {/*  </div>*/}
                            {/*</Menu>*/}

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
            </header>
            <SelectWallet isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
    );
};

export default Header;
