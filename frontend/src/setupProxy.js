const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5002', // Point to the Docker container mapped port
      changeOrigin: true,
    })
  );
};
