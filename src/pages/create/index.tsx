import { Fragment } from "react";

const Create = () => {
  return (
    <Fragment>
      <main className="flex-1 flex flex-col px-4 xl:px-8 2xl:p-12 py-12">
        <div className="mx-auto my-10 max-w-lg w-full">
          <div
            className=" rounded-md shadow-xl dark:text-white text-lm-gray-700 dark:bg-gray-800
                                bg-lm-gray-100 border dark:border-gray-700 border-transparent p-6"
          >
            <form action="#" autoComplete="off">
              <h1 className="text-2xl font-bold text-center mb-4">
                Create NFT Vault
              </h1>
              <div
                className="p-4 border dark:border-teal-500 border-teal-900 dark:bg-teal-900
                                    bg-teal-200 dark:text-white rounded-md text-sm"
              >
                <b>Note:</b> Fees and eligibilities can be set after vault
                creation, but the name and symbol cannot. Please consult our
                <a
                  href="https://docs.nftx.io/tutorials/vault-creation"
                  target="_blank"
                  className="underline hover:no-underline"
                  rel="noopener noreferrer"
                >
                  create vault tutorial
                </a>
                for details, and if you have any questions or concerns, please
                reach out to us in
                <a
                  href="https://discord.com/invite/hytQVM5ZxR"
                  target="_blank"
                  className="underline hover:no-underline"
                  rel="noopener noreferrer"
                >
                  Discord
                </a>
                .
              </div>
              <fieldset className="mt-6">
                <div className="relative">
                  <input
                    name="assetAddress"
                    id="assetAddress"
                    className="   border text-lg font-mono transition-colors dark:border-gray-600
                                                border-lm-gray-300 p-4 pt-8 rounded-sm dark:text-white text-gray-700
                                                bg-white dark:bg-black dark:bg-opacity-50 w-full focus:outline-none
                                                focus:border-pink-500 focus:ring-0"
                    value=""
                  />
                  <label
                    className="absolute transition-position duration-100 left-4 cursor-text
                                            dark:text-white text-lm-gray-900 opacity-50 top-9"
                    htmlFor="assetAddress"
                  >
                    NFT Asset Address
                  </label>
                </div>
              </fieldset>
              <fieldset className="mt-6">
                <div className="relative">
                  <input
                    name="name"
                    id="name"
                    className="   border text-lg font-mono
                                        transition-colors dark:border-gray-600 border-lm-gray-300 p-4 pt-8 rounded-sm
                                        dark:text-white text-gray-700 bg-white dark:bg-black dark:bg-opacity-50 w-full
                                        focus:outline-none focus:border-pink-500 focus:ring-0"
                    value=""
                  />
                  <label
                    className="absolute transition-position duration-100 left-4 cursor-text
                                        dark:text-white text-lm-gray-900 opacity-50 top-9"
                    htmlFor="name"
                  >
                    Vault Name
                  </label>
                </div>
              </fieldset>
              <span className="text-xs mt-2 text-gray-400">
                Use the full asset name, e.g. CryptoPunks, and do not include
                the word 'vault'.
              </span>
              <fieldset className="mt-6">
                <div className="relative">
                  <input
                    name="symbol"
                    id="symbol"
                    className="uppercase   border text-lg font-mono
                                    transition-colors dark:border-gray-600 border-lm-gray-300 p-4 pt-8 rounded-sm
                                    dark:text-white text-gray-700 bg-white dark:bg-black dark:bg-opacity-50 w-full
                                    focus:outline-none focus:border-pink-500 focus:ring-0"
                    value=""
                  />
                  <label
                    className="absolute transition-position duration-100 left-4 cursor-text
                                        dark:text-white text-lm-gray-900 opacity-50 top-9"
                    htmlFor="symbol"
                  >
                    Vault Symbol
                  </label>
                </div>
              </fieldset>
              <span className="text-xs mt-2 text-gray-400">
                We recommend vault symbols be singular, e.g. PUNK, and max 6
                characters.
              </span>
              <button
                className="inline-flex items-center justify-center outline-none font-medium
                                rounded-md break-word hover:outline focus:outline-none focus:ring-1
                                focus:ring-opacity-75 py-6 px-12 w-full bg-gradient-to-b from-pink-400 to-pink-500
                                text-white hover:from-pink-500 hover:to-pink-500 focus:ring-pink-500 cursor-not-allowed
                                opacity-90 mt-8"
                disabled={false}
                type="button"
              >
                Review
              </button>
            </form>
          </div>
        </div>
      </main>
    </Fragment>
  );
};

export default Create;
