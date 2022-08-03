import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import ethereum from "@/assets/icon/ethereum.svg";
import aurora from "@/assets/icon/aurora.svg";
import moonbeam from "@/assets/icon/moonbeam.png";
import sbibuya from "@/assets/icon/astar.png";
import mumbai from "@/assets/icon/mumbai.svg";
import { changeNetwork, currentNetwork } from "@/util/network";
import { useWeb3React } from "@web3-react/core";

const SwitchNetwork = () => {
    const { library } = useWeb3React();

    const sessionNetwork = currentNetwork();
    const network = sessionNetwork || { id: 80001, name: "Mumbai Testnet" };

    const chainImage = (chainId: number) => {
        switch (chainId) {
            case 4:
                return ethereum;
            case 1313161555:
                return aurora;
            case 1287:
                return moonbeam;
            case 81:
                return sbibuya;
            case 80001:
                return mumbai;
            default:
                return ethereum;
        }
    };

    return (
        <Fragment>
            <div className="sm:inline-flex">
                <Menu as="div" className="relative inline-block text-left">
                    <div className="h-full">
                        <Menu.Button
                            className="btn-second mr-2 border border-purple-primary hover:bg-purple-primary
                                            hover:bg-opacity-30 h-full"
                        >
                            {
                                <img
                                    src={chainImage(network.id)}
                                    alt={network.name}
                                    className="h-5 w-5"
                                />
                            }
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
                                {/*<Menu.Item>*/}
                                {/*    {({ active }) => (*/}
                                {/*        <button*/}
                                {/*            className={`${*/}
                                {/*                active*/}
                                {/*                    ? "bg-purple-primary text-white"*/}
                                {/*                    : "text-purple-second"*/}
                                {/*            } group flex w-full items-center justify-between rounded-md px-5 py-2 text-sm`}*/}
                                {/*            onClick={() => {*/}
                                {/*                changeNetwork(*/}
                                {/*                    {*/}
                                {/*                        id: 1287,*/}
                                {/*                        name: "moonbeam",*/}
                                {/*                    },*/}
                                {/*                    library.provider*/}
                                {/*                );*/}
                                {/*            }}*/}
                                {/*        >*/}
                                {/*            <img*/}
                                {/*                src={moonbeam}*/}
                                {/*                alt="moonbeam"*/}
                                {/*                className="h-5 w-5"*/}
                                {/*            />*/}
                                {/*            <span>moonbeam</span>*/}
                                {/*        </button>*/}
                                {/*    )}*/}
                                {/*</Menu.Item>*/}
                                {/*<Menu.Item>*/}
                                {/*    {({ active }) => (*/}
                                {/*        <button*/}
                                {/*            className={`${*/}
                                {/*                active*/}
                                {/*                    ? "bg-purple-primary text-white"*/}
                                {/*                    : "text-purple-second"*/}
                                {/*            } group flex w-full items-center justify-between rounded-md px-5 py-2 text-sm`}*/}
                                {/*            onClick={() => {*/}
                                {/*                changeNetwork(*/}
                                {/*                    {*/}
                                {/*                        id: 81,*/}
                                {/*                        name: "sbibuya",*/}
                                {/*                    },*/}
                                {/*                    library.provider*/}
                                {/*                );*/}
                                {/*            }}*/}
                                {/*        >*/}
                                {/*            <img*/}
                                {/*                src={sbibuya}*/}
                                {/*                alt="sbibuya"*/}
                                {/*                className="h-5 w-5"*/}
                                {/*            />*/}
                                {/*            <span>sbibuya</span>*/}
                                {/*        </button>*/}
                                {/*    )}*/}
                                {/*</Menu.Item>*/}
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
                                                        id: 80001,
                                                        name: "mumbai",
                                                    },
                                                    library.provider
                                                );
                                            }}
                                        >
                                            <img
                                                src={mumbai}
                                                alt="mumbai"
                                                className="h-5 w-5"
                                            />
                                            <span>mumbai</span>
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </Fragment>
    );
};

export default SwitchNetwork;
