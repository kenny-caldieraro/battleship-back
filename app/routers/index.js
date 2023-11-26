const express = require('express');

const apiRouter = require('./api');
const websiteRouter = require('./website');
const { errorHandler } = require('../helpers/errorHandler');

const router = express.Router();

/**
 * 2 grands catégories de routes
 * On préfixe les routers
 */
// Les routes pour l'API
router.use('/api', apiRouter);
// Les routes pour le site web de présentation de l'API, de l'entreprise, du service en général
router.use('/', websiteRouter);

router.use((err, _, response, next) => {
    errorHandler(err, response, next);
});

module.exports = router;
