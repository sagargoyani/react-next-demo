const express = require('express');
const nextJS = require('next');
const cookiesMiddleware = require('universal-cookie-express');
const compression = require('compression');
const proxy = require('http-proxy-middleware');
const routes = require('../client/routes/index');

const dev = process.env.NODE_ENV !== 'production';
const app = nextJS({ dir: './client', dev });
const handler = routes.getRequestHandler(app);

const apiProxy = proxy('/api', {
  target: 'https://jsonplaceholder.typicode.com/',
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
  // logLevel: 'debug',
});

const ignoreFavicon = (req, res, next) => {
  if (req.originalUrl === '/favicon.ico') {
    res.status(204).json({ nope: true });
  } else {
    next();
  }
};

app.prepare().then(() => {
  const server = express();
  server
    .use(cookiesMiddleware())
    .use(ignoreFavicon)
    .use(compression())
    .use('/api/*', apiProxy)
    .use(handler);
  server.listen(3300, err => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3300'); // eslint-disable-line
  });
});
