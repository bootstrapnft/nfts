import { useNavigate } from "react-router";

const VaultHeader = ({ token, type, symbolImage }: any) => {
    const navigator = useNavigate();

    return (
        <header
            className="lg:flex justify-between items-center py-2 px-4 sm:px-6 lg:h-16 dark:bg-gray-800
           sticky top-14 sm:top-18 bg-blue-primary z-10"
        >
            <div className="flex items-center">
                <div className="inline-flex items-center">
                    <img
                        className="w-10 h-10 bg-cover rounded-full"
                        src={symbolImage || "/images/cover.png"}
                        alt={token.name}
                    />
                    <div className="flex-1 ml-2 overflow-hidden">
                        <h4 className="text-lg font-bold leading-tight">
                            {token.name}
                        </h4>
                        <p
                            className="text-sm dark:text-white text-lm-gray-900 text-opacity:20
                                        dark:text-opacity-80 truncate"
                        >
                            {token.symbol}
                        </p>
                    </div>
                </div>
                <div className="flex items-center md:hidden ml-auto">
                    <button className="inline-flex items-center justify-center outline-none font-medium rounded-md break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-1.5 px-2 text-xs bg-white text-gray-900 hover:bg-gray-100 focus:ring-gray-300 dark:bg-gray-700 dark:text-white text-sm p-2 rounded">
                        Filters
                    </button>
                </div>
            </div>
            <div className="xl:ml-2 mt-2 lg:mt-0 flex-none flex flex-nowrap space-x-2 justify-between">
                <button
                    className={`btn-second 
                        ${
                            type === "redeem"
                                ? "bg-purple-primary text-white hover:bg-purple-hover"
                                : ""
                        }`}
                    onClick={() => navigator(`/vault/${token.id}/redeem`)}
                >
                    Redeem
                </button>
                <button
                    className={`btn-second
                    ${
                        type === "mint"
                            ? "bg-purple-primary text-white hover:bg-purple-hover"
                            : ""
                    }`}
                    onClick={() => navigator(`/vault/${token.id}/mint`)}
                >
                    Mint
                </button>
                <button
                    className={`btn-second ${
                        type === "swap"
                            ? "bg-purple-primary text-white hover:bg-purple-hover"
                            : ""
                    }`}
                    onClick={() => navigator(`/vault/${token.id}/swap`)}
                >
                    Swap
                </button>
                <button
                    className={`btn-second ${
                        type === "info"
                            ? "bg-purple-primary text-white hover:bg-purple-hover"
                            : ""
                    }`}
                    onClick={() => navigator(`/vault/${token.id}/info`)}
                >
                    Info
                </button>
            </div>
        </header>
    );
};

export default VaultHeader;
