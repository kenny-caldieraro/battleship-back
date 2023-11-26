const path = require('path');
const express = require('express');
const cors = require('cors');

const router = require('./routers');

const app = express();
require('./helpers/apiDocs')(app);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

/**
 * Ces 2 middleware sont chargé de transformé le corp de la requête reçu en même temps que les
 * headers (route, type de contenu la date de requête…)
 * en un objet JS qui sera stocké dans une propriété "body" de la requête
 */
// On active le middleware pour parser le payload JSON
app.use(express.json());
// On active le middleware pour parser le payload urlencoded
app.use(express.urlencoded({ extended: true }));

// On lève la restriction CORS pour nos amis React
app.use(cors(process.env.CORS_DOMAINS ?? '*'));

/**
 * Le coeur de l'application c'est la dispatching des requêtes
 */
app.use(router);

module.exports = app;
