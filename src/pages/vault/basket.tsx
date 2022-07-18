const Basket = ({ count, onClick }: any) => {
    return (
        <div className="w-full flex justify-center sm:hidden">
            <button
                className="btn-primary outline-none font-medium rounded-md py-2.5
                px-4 text-white rounded-full w-1/2 filter drop-shadow-md fixed bottom-10 z-20"
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
