const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/menu', createProxyMiddleware({ target: 'http://menu-service:3001', changeOrigin: true }));
app.use('/orders', createProxyMiddleware({ target: 'http://order-service:3002', changeOrigin: true }));
app.use('/inventory', createProxyMiddleware({ target: 'http://inventory-service:3003', changeOrigin: true }));
app.use('/customers', createProxyMiddleware({ target: 'http://customer-service:3004', changeOrigin: true }));
app.use('/payments', createProxyMiddleware({ target: 'http://payment-service:3005', changeOrigin: true }));

app.listen(3000, () => {
  console.log('API Gateway running on port 3000');
});