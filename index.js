/**
 * Fichier chargé de lancé le serveur http
 * Il peut utiliser n'importe quel type de framework Node.js
 * Si la variable app contient une app Express, Koa, Fastify cela continue à fonctionner
 */
const http = require('http');
const dotenv = require('dotenv');
const debug = require('debug')('app:server');

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const app = require('./app');

/**
 * @see https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator
 */
const port = process.env.PORT ?? 3000;

const server = http.createServer(app);

server.listen(port, () => {
    debug(`Listening on ${port}`);
});
