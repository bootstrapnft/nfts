const Basket = ({ count, onClick }: any) => {
    return (
        <div className="w-full flex justify-center sm:hidden">
            <button
                className="inline-flex items-center justify-center outline-none font-medium rounded-md
                break-word hover:outline focus:outline-none focus:ring-1 focus:ring-opacity-75 py-2.5
                px-4 bg-gradient-to-b from-orange-400 via-pink-500 to-pink-500 text-white hover:from-pink-500
                hover:to-pink-500 focus:ring-red-600 rounded-full w-1/2 filter drop-shadow-md fixed bottom-10 z-20"
                onClick={onClick}
            >
                Basket
                <span
                    className="rounded-full bg-white text-black inline-flex items-center justify-center ml-2 w-6
                h-6 text-xs"
                >
                    {count}
                </span>
            </button>
        </div>
    );
};

export default Basket;
