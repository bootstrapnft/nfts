import { Fragment } from "react";
import ethereumNft from "@/assets/icon/ethereum-nft.svg";
import { useNavigate } from "react-router";

type CardProps = {
  name: string;
  address: string;
  description: string;
  image: string;
  symbol: string;
  symbolImage: string;
  price: number;
  itemCount: number;
};

const Card = ({
  name,
  address,
  symbol,
  symbolImage,
  image,
  price,
  itemCount,
}: CardProps) => {
  const navigate = useNavigate();
  return (
    <Fragment>
      <div
        className="flex flex-col transition-all transform hover:-translate-y-1 backface-invisible
                    hover:shadow-2xl rounded-md shadow-xl dark:text-white text-lm-gray-700 dark:bg-gray-800
                    bg-lm-gray-100 border dark:border-gray-700 border-transparent p-3"
        onClick={() => navigate(`/vault/${address}/mint`)}
      >
        <div
          className="h-0 w-full rounded-md relative overflow-hidden backface-invisible"
          style={{ paddingTop: "100%" }}
        >
          <img
            loading="lazy"
            src={image}
            className="w-full h-full object-cover absolute top-0 backface-invisible"
            alt={name}
          />
        </div>
        <div className="py-2">
          <h3 className="font-medium text-xl flex items-center mb-1">
            <img
              className="w-6 h-6 mr-2 bg-cover"
              src={symbolImage}
              alt={symbol}
            />
            {symbol}
          </h3>
          <h4 className="text-sm dark:text-gray-300 text-gray-500">{name}</h4>
        </div>
        <footer className="mt-auto">
          <dl className="flex flex-wrap justify-between space-x-3">
            <div className="mt-2">
              <dt className="text-gray-400 text-xs">Price</dt>
              <dd className="text-lg whitespace-nowrap">
                <img
                  src={ethereumNft}
                  className="w-4 h-4 mr-0.5 align-middle inline-block"
                  alt="ETH"
                />
                {price}
              </dd>
            </div>
            <div className="mt-2 text-right">
              <dt className="text-gray-400 text-xs">Items</dt>
              <dd className="text-xl">{itemCount}</dd>
            </div>
          </dl>
        </footer>
      </div>
    </Fragment>
  );
};

export default Card;
