import { Fragment, useEffect, useState } from "react";
import Card from "@/components/card";
import { useWeb3React } from "@web3-react/core";
import { Contract } from "ethers";
import contractAddress from "@/contract/contract.json";
import Vault from "@/contract/Vault.json";
import VaultFactory from "@/contract/VaultFactory.json";
import { useLoading } from "@/context/loading";

const Home = () => {
  const nfts = [
    {
      name: "CryptoPunks",
      description: "NFT 1 description",
      image:
        "https://img.seadn.io/files/41043095fa53024c4667baa04dfcb022.png?h=1024&amp;w=1024&amp;auto=format",
      symbol: "PUNK",
      symbolImage:
        "https://res.cloudinary.com/nftx/image/fetch/w_150,h_150,f_auto/https://raw.githubusercontent.com/NFTX-project/nftx-assets/main/vaults-v2/0/256x256.png",
      address: "0x269616d549d7e8eaa82dfb17028d0b212d11232a",
      price: 46.62,
      itemCount: 149,
    },
    {
      name: "CryptoPunks",
      description: "NFT 1 description",
      image:
        "https://img.seadn.io/files/d320d70f5199c45a2a4e35156b492adc.png?h=1024&w=1024&auto=format",
      symbol: "Doodles",
      symbolImage:
        "https://res.cloudinary.com/nftx/image/fetch/w_150,h_150,f_auto/https://raw.githubusercontent.com/NFTX-project/nftx-assets/main/vaults-v2/251/256x256.png",
      address: "0x269616d549d7e8eaa82dfb17028d0b212d11232a",
      price: 13.91,
      itemCount: 44,
    },
    {
      name: "CryptoPunks",
      description: "NFT 1 description",
      image:
        "https://lh3.googleusercontent.com/HBDIaZZqiKSN_Ulwk1rkWwsM9-tfWpUq5lbtGejpQ0NmbKxvoRDvnObvzpX2xlFzuKB020etAy6qP0gwJNIa9eTDNBwBjfXX7vebnQ",
      symbol: "Killer GF",
      symbolImage:
        "https://res.cloudinary.com/nftx/image/fetch/w_150,h_150,f_auto/https://raw.githubusercontent.com/NFTX-project/nftx-assets/main/vaults-v2/341/256x256.png",
      address: "0x269616d549d7e8eaa82dfb17028d0b212d11232a",
      price: 0.2121,
      itemCount: 259,
    },
    {
      name: "CryptoPunks",
      description: "NFT 1 description",
      image:
        "https://lh3.googleusercontent.com/WWmwcJuvosVwW6kW4WjdvFnM80wmor4nHndX8L9-bkZhmaM7ihnOuqYevF3ttFRw58pHYKWCKu0bavRMRnaN_BHpJA",
      symbol: "CryptoKitties [Gen 0]",
      symbolImage:
        "https://res.cloudinary.com/nftx/image/fetch/w_150,h_150,f_auto/https://raw.githubusercontent.com/NFTX-project/nftx-assets/main/vaults-v2/5/256x256.png",
      address: "0x269616d549d7e8eaa82dfb17028d0b212d11232a",
      price: 0.1006,
      itemCount: 537,
    },
    {
      name: "CryptoPunks",
      description: "NFT 1 description",
      image:
        "https://lh3.googleusercontent.com/UmmfTvpfSUsrfsARWuUkKHbB61MH69dVgfBDycS_UBgFDjgKtEV25By4X77yuSm6UAK7SMjH3yYNBw6XRbnp2cXcEqLAmbA02SV0XXk",
      symbol: "fRiENDSiES",
      symbolImage:
        "https://res.cloudinary.com/nftx/image/fetch/w_150,h_150,f_auto/https://raw.githubusercontent.com/NFTX-project/nftx-assets/main/vaults-v2/429/256x256.png",
      address: "0x269616d549d7e8eaa82dfb17028d0b212d11232a",
      price: 0.0814,
      itemCount: 340,
    },
    {
      name: "CryptoPunks",
      description: "NFT 1 description",
      image:
        "https://lh3.googleusercontent.com/SmabBcOuwr4MEe3WCiXPX22YXkLvTYYdnsYfwmyc2Mg69pV16g8fkAZR-fKZg2WL9YMztT79Qp7Pg1FgYyxyeCLew66_xNNUL7WQdQ",
      symbol: "HDPunk 🔫 Roulette 🔫",
      symbolImage:
        "https://res.cloudinary.com/nftx/image/fetch/w_150,h_150,f_auto/https://raw.githubusercontent.com/NFTX-project/nftx-assets/main/vaults-v2/136/256x256.png",
      address: "0x269616d549d7e8eaa82dfb17028d0b212d11232a",
      price: 0.0403,
      itemCount: 438,
    },
  ];
  const { library, account, active } = useWeb3React();
  const [vaults, setVaults] = useState<any[]>([]);
  const [_, setLoading] = useLoading();

  useEffect(() => {
    if (!active) {
      return;
    }
    setLoading(true);
    const contract = new Contract(
      contractAddress.VaultFactoryAddress,
      VaultFactory,
      library.getSigner()
    );
    contract.allVaults().then(async (vaults: any) => {
      await filterManager(vaults);
      setLoading(false);
    });
  }, [account]);

  useEffect(() => {
    (async () => {
      if (!vaults) {
        return;
      }
      await getVaultInfo(vaults);
    })();
  }, [vaults]);

  const filterManager = async (vaults: any) => {
    if (!vaults || !active) {
      return;
    }
    const manager: string[] = [];
    await Promise.all(
      vaults.map(async (address: any) => {
        const contract = new Contract(address, Vault, library.getSigner());
        const res = await contract.manager();
        if (0 === Number(res)) {
          manager.push(address);
        }
      })
    );
    setVaults(manager);
  };

  const getVaultInfo = async (vaultAddress: string[]) => {
    if (!vaults || !active) {
      return;
    }

    Promise.all(
      vaultAddress.map(async (address: any) => {
        const contract = new Contract(address, Vault, library.getSigner());
        const vaultName = await contract.name();
        const vaultSymbol = await contract.symbol();

        return {
          name: vaultName,
          symbol: vaultSymbol,
          address: address,
          price: 100,
          itemCount: 101,
          image: "https://picsum.photos/200/300",
          symbolImage: "https://picsum.photos/200/300",
        };
      })
    ).then((vaultInfo: any) => {
      setVaults([...vaultInfo, ...nfts]);
    });
  };

  return (
    <Fragment>
      <main className="flex-1 flex flex-col px-4 xl:px-8 2xl:p-12 py-12 text-purple-second">
        <section>
          <header>
            <h1 className="font-bold text-3xl mb-2">Buy NFTs</h1>
            <p className="mb-4">Browse the decentralized NFT marketplace.</p>
          </header>
          <div className="bg-gradient-to-r from-transparent to-purple-primary h-px mb-4"></div>
          <div className="flex justify-between items-center sm:items-start space-x-4">
            <h3 className="uppercase mb-4 mt-4 font-bold text-xl inline-block">
              All Collections
            </h3>
          </div>
          <div
            className="pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5
                            sm:gap-4 gap-2 "
          >
            {vaults.map((nft, index) => (
              <Card key={index} {...nft} />
            ))}
          </div>
        </section>
      </main>
    </Fragment>
  );
};

export default Home;
