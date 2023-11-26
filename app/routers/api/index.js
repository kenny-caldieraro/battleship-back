const express = require('express');

const categoryRouter = require('./category');
const postRouter = require('./post');
const { apiController } = require('../../controllers/api');

const { ApiError } = require('../../helpers/errorHandler');

const router = express.Router();

// Route par défaut de l'API, ici on la configure pour toutes les méthodes
// afin de donner l'information en cas d'oubli de spéfication de la route par l'utilisateur
router.all('/', apiController.home);
/*
router.get('/', apiController.home);
router.post('/', apiController.home);
router.patch('/', apiController.home);
router.delete('/', apiController.home);
router.put('/', apiController.home);
router.options('/', apiController.home);
…
*/

// On préfixe les routers de l'API
router.use('/categories', categoryRouter);
router.use('/posts', postRouter);

// on implémente 2 middleware de 404, afin de personnaliser le message du côté site web et du côté
// API
router.use(() => {
    // Ici on force une erreur, afin de déclencher le gestionnaire d'erreur et donc l'affichage de
    // l'erreur
    throw new ApiError('API Route not found', { statusCode: 404 });
});

module.exports = router;
