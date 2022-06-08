import { Transition, Dialog } from "@headlessui/react";
import { Fragment } from "react";

const SelectToken = ({ tokensInfo, selectedToken, close }: any) => {
  return (
    <Fragment>
      <Transition appear show={true}>
        <Dialog as="div" className="relative z-10" onClose={close}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className="w-full max-w-md transform overflow-hidden rounded-2xl
                                    bg-white py-6 text-left align-middle shadow-xl transition-all"
                >
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium font-bold leading-6 text-gray-900 text-center"
                  >
                    Select Token
                  </Dialog.Title>
                  {tokensInfo &&
                    tokensInfo.map((token: any) => {
                      return (
                        <div
                          className="mt-2 py-3 px-6 flex item-center gap-x-2 item
                                                cursor-pointer hover:bg-purple-second"
                          key={token.id}
                          onClick={() => selectedToken(token)}
                        >
                          <span>
                            <img
                              src={token.logoUrl}
                              alt=""
                              className="w-5 h-5"
                            />
                          </span>
                          <span>{token.name}</span>
                          <span>{token.symbol}</span>
                        </div>
                      );
                    })}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </Fragment>
  );
};

export default SelectToken;
