const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Route ratings API to ratings-service on port 5003
  // ratings-service mounts routes on /api/ratings
  app.use(
    createProxyMiddleware('/api/ratings', {
      target: 'http://localhost:5003',
      changeOrigin: true,
    })
  );

  // Route everything else under /api to product-service on port 5002
  // product-service mounts routes on /api/products, /api/auth, etc.
  app.use(
    createProxyMiddleware('/api', {
      target: 'http://localhost:5002',
      changeOrigin: true,
    })
  );
};
