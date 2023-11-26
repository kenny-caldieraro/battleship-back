const expressJSDocSwagger = require('express-jsdoc-swagger');

const options = {
    info: {
        version: '1.0.0',
        title: "O'blog",
        description: "Blog de l'école O'clock",
    },
    baseDir: __dirname,
    // On analyse tous les fichiers du projet
    filesPattern: ['../routers/**/*.js', '../errors/*.js', '../models/*.js'],
    // URL où sera disponible la page de documentation
    swaggerUIPath: process.env.API_DOCUMENTATION_ROUTE,
    // Activation de la documentation à travers une route de l'API
    exposeApiDocs: true,
    apiDocsPath: '/api/docs',
};

/**
 * Swagger middleware factory
 * @param {object} app Express application
 * @returns Express JSDoc Swagger middleware that create web documentation
 */
module.exports = (app) => expressJSDocSwagger(app)(options);
