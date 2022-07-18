import { Fragment } from "react";
import logo from "@/assets/footer-logo.svg";
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

    return (
        <Fragment>
            <div
                className="bg-blue-primary overflow-hidden px-10 fixed bottom-0 w-full
        flex justify-between items-center py-4 flex-col lg:h-16 lg:flex-row"
            >
                <div>
                    <img src={logo} alt="" className="h-16 w-64" />
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
