import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

const TokenTable = ({ pool }: any) => {
    return (
        <table className="w-full">
            <thead className="bg-purple-second bg-opacity-10">
                <tr className="text-sm font-light">
                    <th className="text-left w-1/2 h-12 pl-4 rounded-l-lg">
                        Token
                    </th>
                    <th className="text-right">Weight</th>
                    <th className="text-right">Pool balance</th>
                    <th className="text-right">My balance</th>
                    <th className="text-right pr-4 rounded-r-lg">
                        My asset value
                    </th>
                </tr>
            </thead>
            <tbody>
                {pool &&
                    pool.tokens.map((token: any, index: number) => {
                        return (
                            <tr
                                className="text-sm font-light border-b border-purple-second border-opacity-50"
                                key={index}
                            >
                                <td className="text-left w-1/2 h-12 pl-4 flex gap-x-3 items-center">
                                    {/*<img src="https://s2.coinmarketcap.com/static/img/coins/64x64/825.png" alt=""*/}
                                    {/*     className="h-6 w-6"/>*/}
                                    <Jazzicon
                                        diameter={22}
                                        seed={jsNumberForAddress(token.address)}
                                    />
                                    <span>{token.symbol}</span>
                                </td>
                                <td className="text-right px-4">
                                    {parseFloat(token.weightPercent).toFixed(2)}{" "}
                                    %
                                </td>
                                <td className="text-right px-4">
                                    {token.balance !== ""
                                        ? parseFloat(token.balance).toFixed(4)
                                        : "-"}
                                </td>
                                <td className="text-right px-4">
                                    {token.balance !== ""
                                        ? parseFloat(token.balance).toFixed(4)
                                        : "-"}
                                </td>
                                <td className="text-right pr-4">
                                    {token.balance !== ""
                                        ? parseFloat(token.balance).toFixed(4)
                                        : "-"}
                                </td>
                            </tr>
                        );
                    })}
            </tbody>
        </table>
    );
};

export default TokenTable;
