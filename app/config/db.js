/**
 * Plutôt que créer et connecté un Client
 * On va plutôt créer un "pool" de client et
 * laisser notre module manager les connexions
 * de plusieurs client en fonction des besoins.
 *
 * Le package pg étant bien fait, pas besoin de changer aurtre chose.
 * l'objet de pool à aussi une méthode query donc le reste de notre code
 * continuera de fonctionner
 *
 * Comme pour Client les informations de connexion
 * sont lu soit directement à partir de l'env soit donnée en paramêtre
 */
const debug = require('debug')('SQL:log');
const { Pool } = require('pg');

const dbConfig = {
    connectionString: process.env.DATABASE_URL,
};

if (process.env.NODE_ENV === 'production') {
    dbConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(dbConfig);

module.exports = {
    // On expose quand même le client original "au cas ou"
    originalClient: pool,

    // On fait une méthode pour "intercepter"
    // les requêtes afin de pouvoir les afficher
    // L'opérateur de "rest" permet de transformer
    // ici X variables en param. en un tableau

    // Rest Paramaters : dans le contexte de paramètre de fonction, cela transforme les arguments en
    // tableau client.query(arg1, arg2, arg3, arg4)
    async query(...params) {
        // arg1, arg2, arg3 => [arg1, arg2, arg3, arg4]

        // Spread orperator : Dans le contexte d'arguments, cela distribue chaque élément d'un
        // tableau en tant qu'argument

        // debug(arg1, arg2, arg3, arg4)
        debug(...params);

        // L'opérateur ici fait l'effet inverse on transforme
        // un tableau en une liste
        // de variables / paramétre ce qui fait que la méthode query du client sera
        // appelé exactement de la même façon que celle de notre module

        // this.originalClient.query(arg1, arg2, arg3, arg4)
        return this.originalClient.query(...params);
    },
};
