import { Fragment } from "react";
import logo from "@/assets/footer-logo.svg";
import telegram from "@/assets/icon/telegram.png";
import twitter from "@/assets/icon/twitter.png";
import medium from "@/assets/icon/medium.png";
import github from "@/assets/icon/github.png";
import { useNavigate } from "react-router";

const Footer = () => {
    const navigator = useNavigate();
    const nav = [
        {
            name: "Shop",
            uri: "/",
        },
        {
            name: "Fractionalize",
            uri: "/vault/create",
        },
        {
            name: "Auction",
            uri: "/",
        },
        {
            name: "Explore pools",
            uri: "/pool/explore",
        },
        {
            name: "Swap",
            uri: "/pool/swap",
        },
        {
            name: "Activity",
            uri: "/",
        },
    ];

    const media = [
        {
            name: "Telegram",
            url: "https://t.me/bootstrapnft",
            icon: telegram,
        },
        {
            name: "Telegram",
            url: "https://twitter.com/bootstrapnfts",
            icon: twitter,
        },
        {
            name: "Medium",
            url: "https://bootstrapnft.medium.com",
            icon: medium,
        },
        {
            name: "Github",
            url: "https://github.com/bootstrapnft",
            icon: github,
        },
    ];

    return (
        <Fragment>
            <div
                className="bg-blue-primary overflow-hidden px-10 fixed bottom-0 w-full
                flex justify-between items-center py-4 flex-col lg:h-16 lg:flex-row"
            >
                <div className="flex gap-x-3 items-center">
                    <div className="text-purple-second text-base">
                        Join the community
                    </div>
                    <div className="flex gap-x-2">
                        {media.map((item, index) => {
                            return (
                                <a
                                    className="p-2 bg-purple-primary rounded-full"
                                    href={item.url}
                                    target="_blank"
                                    key={index}
                                >
                                    <img
                                        src={item.icon}
                                        alt={item.name}
                                        className="w-4 h-4"
                                    />
                                </a>
                            );
                        })}
                    </div>
                </div>
                <div className="text-purple-second flex flex-wrap justify-between gap-x-4 gap-y-3">
                    {nav.map(({ name, uri }) => {
                        return (
                            <div
                                className="cursor-pointer hover:text-purple-primary"
                                onClick={() => navigator(uri)}
                                key={name}
                            >
                                {name}
                            </div>
                        );
                    })}
                </div>
            </div>
        </Fragment>
    );
};

export default Footer;
