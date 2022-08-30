const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
        "/mumbai-bal",
        createProxyMiddleware({
            target: "http://158.247.224.97:18000",
            changeOrigin: true,
            pathRewrite: {
                "^/mumbai-bal": "/subgraphs/name/bootstrapnft",
            },
        })
    );
    app.use(
        "/mumbai-nft",
        createProxyMiddleware({
            target: "http://158.247.224.97:18000",
            changeOrigin: true,
            pathRewrite: {
                "^/mumbai-nft": "/subgraphs/name/bootstrapnft",
            },
        })
    );

    app.use(
        "/rinkeby-bal",
        createProxyMiddleware({
            target: "http://45.77.30.9:7000",
            changeOrigin: true,
            pathRewrite: {
                "^/rinkeby-bal": "/subgraphs/name/bootstrapnft",
            },
        })
    );
    app.use(
        "/rinkeby-nft",
        createProxyMiddleware({
            target: "http://45.77.30.9:7000",
            changeOrigin: true,
            pathRewrite: {
                "^/rinkeby-nft": "/subgraphs/name/bootstrapnft",
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
