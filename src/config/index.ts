import rinkeby from "@/config/rinkeby.json";
import rinkeByTokens from "@/config/rinkeby_tokens.json";

import aurora from "@/config/aurora.json";
import auroraTokens from "@/config/aurora_tokens.json";

import moonbeam from "@/config/moonbeam.json";
import moonbeamTokens from "@/config/moonbeam_tokens.json";

import { currentNetwork } from "@/util/network";

const configs = {
    4: {
        ...rinkeby,
        ...rinkeByTokens,
    },
    1313161555: {
        ...aurora,
        ...auroraTokens,
    },
    1287: {
        ...moonbeam,
        ...moonbeamTokens,
    },
};

const sessionNetwork = currentNetwork();
const network = sessionNetwork.id || 4;

console.log("config:", sessionNetwork);
// @ts-ignore
const config = configs[network];

export default config;
