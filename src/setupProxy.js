const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
        "/mumbai-bal",
        createProxyMiddleware({
            target: "http://158.247.224.97:28000",
            changeOrigin: true,
            pathRewrite: {
                "^/mumbai-bal":
                    "/subgraphs/name/balancer-labs/balancer-subgraph",
            },
        })
    );
    app.use(
        "/mumbai-nft",
        createProxyMiddleware({
            target: "http://158.247.224.97:18000",
            changeOrigin: true,
            pathRewrite: {
                "^/mumbai-nft": "/subgraphs/name/nft-fractional",
            },
        })
    );

    app.use(
        "/rinkeby-bal",
        createProxyMiddleware({
            target: "http://124.222.87.17:8000",
            changeOrigin: true,
            pathRewrite: {
                "^/rinkeby-bal":
                    "/subgraphs/name/balancer-labs/balancer-subgraph",
            },
        })
    );
    app.use(
        "/rinkeby-nft",
        createProxyMiddleware({
            target: "http://45.77.30.9:7000",
            changeOrigin: true,
            pathRewrite: {
                "^/rinkeby-nft": "/subgraphs/name/nft-fractional",
            },
        })
    );
    app.use(
        "/metadata/cache",
        createProxyMiddleware({
            target: "http://45.77.30.9:5688/api/v1",
            changeOrigin: true,
        })
    );
};
