import { Fragment } from "react";
import ethereumNft from "@/assets/images/ethereum-nft.svg";

type CardProps = {
  title: string;
  address: string;
  description: string;
  image: string;
  category: string;
  categoryImage: string;
  price: number;
  itemCount: number;
};

const Card = ({
  title,
  address,
  category,
  categoryImage,
  image,
  price,
  itemCount,
}: CardProps) => {
  return (
    <Fragment>
      <a
        className="flex flex-col transition-all transform hover:-translate-y-1 backface-invisible
                    hover:shadow-2xl rounded-md shadow-xl dark:text-white text-lm-gray-700 dark:bg-gray-800
                    bg-lm-gray-100 border dark:border-gray-700 border-transparent p-3"
        href="/vault/0x269616d549d7e8eaa82dfb17028d0b212d11232a/buy/"
      >
        <div
          className="h-0 w-full rounded-md relative overflow-hidden backface-invisible"
          style={{ paddingTop: "100%" }}
        >
          <img
            loading="lazy"
            src={image}
            className="w-full h-full object-cover absolute top-0 backface-invisible"
            alt="CRYPTOPUNKS"
          />
        </div>
        <div className="py-2">
          <h3 className="font-medium text-xl flex items-center mb-1">
            <img
              className="w-6 h-6 mr-2 bg-cover"
              src={categoryImage}
              alt="PUNK"
            />
            {category}
          </h3>
          <h4 className="text-sm dark:text-gray-300 text-gray-500">{title}</h4>
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
      </a>
    </Fragment>
  );
};

export default Card;
