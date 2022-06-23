import rinkeby from "@/config/rinkeby.json";
import rinkeByTokens from "@/config/rinkeby_tokens.json";

import aurora from "@/config/aurora.json";
import auroraTokens from "@/config/aurora_tokens.json";

const configs = {
    4: {
        ...rinkeby,
        ...rinkeByTokens,
    },
    1313161555: {
        aurora,
        auroraTokens,
    },
};

const network = 4;
const config = configs[network];

export default config;
