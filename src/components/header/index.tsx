import { Fragment, useState } from "react";
import SelectWallet from "@/components/select_wallet";
import { useWeb3React } from "@web3-react/core";
import { truncateAddress } from "@/util/address";
import { useNavigate } from "react-router";
import arrowDown from "@/assets/icon/arrow-down.svg";

const Header = () => {
  const navigator = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { account, active } = useWeb3React();

  return (
    <div className="sticky top-0 z-30">
      <header className="border-b-2 bg-white">
        <div className="px-4 py-2 flex flex-wrap">
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
                  hover:border-pink-500 focus:ring-pink-700 hidden lg:inline-flex lg:dark:hover:border-gray-900
                  lg:hover:bg-transparent lg:focus:ring-0"
              >
                Shop
                <span className="text-center transform rotate-90 ml-2">
                  <img src={arrowDown} alt="" className="h-5 w-5" />
                </span>
              </button>
              <div
                className="lg:shadow-lg lg:absolute lg:flex lg:flex-col lg:space-y-1.5 lg:top-full lg:-left-1
                  lg:-right-4 lg:p-2 lg:rounded-lg lg:border-gray-300 lg:bg-gray-50 lg:dark:bg-gray-800 lg:border
                  lg:dark:border-gray-600 lg:hidden group-hover:inline-flex z-50"
              >
                <div
                  onClick={() => navigator("/")}
                  className="inline-flex items-center justify-left outline-none font-medium rounded-md break-word
                      hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-2.5 px-4 bg-transparent
                      border border-pink-500 dark:text-white text-lm-gray-800 hover:bg-pink-500 hover:bg-opacity-10
                      focus:ring-pink-700 bg-pink-500 bg-opacity-10 text-sm mr-1.5 lg:mr-0
                      dark:text-white text-gray-900 cursor-pointer"
                >
                  Buy
                </div>
                <div
                  className="inline-flex items-center justify-left outline-none font-medium
                                rounded-md break-word hover:outline focus:outline-none focus:ring-1
                                focus:ring-opacity-75 py-2.5 px-4 bg-transparent dark:text-white
                                text-lm-gray-900 border border-transparent hover:border-opacity-50
                                hover:border-pink-500 focus:ring-pink-700 text-sm lg:text-base mr-1.5
                                dark:text-white text-gray-900 cursor-pointer text-left"
                  onClick={() => navigator("/sell")}
                >
                  Sell
                </div>
                <div
                  className="inline-flex items-center justify-left outline-none font-medium
                                rounded-md break-word hover:outline focus:outline-none focus:ring-1
                                focus:ring-opacity-75 py-2.5 px-4 bg-transparent dark:text-white
                                text-lm-gray-900 border border-transparent hover:border-opacity-50
                                hover:border-pink-500 focus:ring-pink-700 text-sm lg:text-base mr-1.5
                                dark:text-white text-gray-900 cursor-pointer text-left"
                  onClick={() => navigator("/swap")}
                >
                  Swap
                </div>
              </div>
            </div>
            <div
              className="inline-flex items-center justify-center outline-none font-medium
                                rounded-md break-word hover:outline focus:outline-none focus:ring-1
                                focus:ring-opacity-75 py-2.5 px-4 bg-transparent dark:text-white
                                text-lm-gray-900 border border-transparent hover:border-opacity-50
                                hover:border-pink-500 focus:ring-pink-700 text-sm lg:text-base mr-1.5
                                dark:text-white text-gray-900 cursor-pointer"
              onClick={() => navigator("/create")}
            >
              Create
            </div>
          </nav>
          <aside className="flex order-2 sm:order-3 justify-center md:justify-end flex-wrap ml-auto md:ml-0">
            <div className="hidden sm:inline-flex">
              <button
                className="inline-flex items-center justify-center outline-none font-medium
                                    rounded-md break-word hover:outline focus:outline-none focus:ring-1
                                    focus:ring-opacity-75 py-2 px-3 text-sm bg-gradient-to-b from-pink-400
                                    to-pink-500 text-white hover:from-pink-500 hover:to-pink-500 focus:ring-pink-500
                                    whitespace-nowrap"
                onClick={() => setIsOpen(true)}
              >
                {!active ? "Connect" : truncateAddress(account!)}
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
