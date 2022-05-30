import { Fragment, useState } from "react";
import SelectWallet from "@/components/select_wallet";
import { useWeb3React } from "@web3-react/core";
import { truncateAddress } from "@/util/address";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { account, active } = useWeb3React();

  return (
    <Fragment>
      <header className="border-b-2 bg-white">
        <div className="px-4 py-2 flex flex-wrap">
          <nav
            className="hide-scroll overflow-x-scroll lg:overflow-x-visible hidden border-r
                        border-gray-100 order-4 flex-none mt-2 w-full lg:w-auto
                        lg:order-3 lg:mt-0 ml-auto text-center whitespace-nowrap lg:block lg:mr-4"
          >
            <a
              href="/"
              className="inline-flex items-center justify-center outline-none font-medium
                                rounded-md break-word hover:outline focus:outline-none focus:ring-1
                                focus:ring-opacity-75 py-2.5 px-4 bg-transparent dark:text-white
                                text-lm-gray-900 border border-transparent hover:border-opacity-50
                                hover:border-pink-500 focus:ring-pink-700 text-sm lg:text-base mr-1.5
                                dark:text-white text-gray-900"
            >
              Buy
            </a>
            <a
              href="/sell/"
              className="inline-flex items-center justify-center outline-none font-medium
                                rounded-md break-word hover:outline focus:outline-none focus:ring-1
                                focus:ring-opacity-75 py-2.5 px-4 bg-transparent dark:text-white
                                text-lm-gray-900 border border-transparent hover:border-opacity-50
                                hover:border-pink-500 focus:ring-pink-700 text-sm lg:text-base mr-1.5
                                dark:text-white text-gray-900"
            >
              Sell
            </a>
            <a
              href="/create/"
              className="inline-flex items-center justify-center outline-none font-medium
                                rounded-md break-word hover:outline focus:outline-none focus:ring-1
                                focus:ring-opacity-75 py-2.5 px-4 bg-transparent dark:text-white
                                text-lm-gray-900 border border-transparent hover:border-opacity-50
                                hover:border-pink-500 focus:ring-pink-700 text-sm lg:text-base mr-1.5
                                dark:text-white text-gray-900"
            >
              Create
            </a>
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
    </Fragment>
  );
};

export default Header;
