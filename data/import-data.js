// Cela marche même si le script n'est pas à la racine avec le .env
// car ce script est lancé avec npm run import
// Donc comme s'il était à la racine
const dotenv = require('dotenv');

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const { Client } = require('pg');
const debug = require('debug')('import:log');

// On récupère les données de base
const categories = require('./categories.json');
const posts = require('./posts.json');

// Pour pouvoir utiliser await je dois être dans une fonction  async et pas dans
// le flux principal du programme.
// Je créé donc une IIFE async (une fonction exécuté aussi tôt quelle est déclaré)
(async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });
    await client.connect();

    debug('Client connected');

    debug('Clean table');

    /**
     * Il faut penser à vider les tables avant de réécrire les données
     * cela nous simplifiera la vie.
     * On utilise TRUNCATE TABLE plutôt que DELETE FROM
     * car c'est bien plus rapide
     * TRUNCATE TABLE ne vérifie par chaque enregistrement avant de le supprimer,
     * et en bonus on peut préciser plusieurs
     * table en même temps comme DROP TABLE.
     * Cela permet de s'affranchir de contraintes de clé étrangères !!
     * Donc ici l'ordre des tables n'est pas important
     * RESTART IDENTITY (optionnel) permet de reset de la numérotation des colonnes IDENTITY
     */
    await client.query('TRUNCATE TABLE category, post RESTART IDENTITY');

    // On prépare un objet qui permettra de référencer
    // l'ensemble de requêtes d'insertion des catégories
    const categoryQueries = [];

    categories.forEach((category) => {
        debug('Processing category:', category.label);
        const query = client.query(
            `
                INSERT INTO "category"
                ("label", "route")
                VALUES
                ($1, $2)
                RETURNING *
            `,
            [category.label, category.route],
        );
        categoryQueries.push(query);
    });

    const results = await Promise.all(categoryQueries);

    // On stocke les catégories dans un tableau de référence
    const categoryRows = results.map((result) => result.rows[0]);

    // Pour chaque post on genère une requête,
    // dont on va stocker la promesse d'exécution dans un tableau
    const postQueries = [];
    posts.forEach((post) => {
        debug('Processing post:', post.slug);

        const postCategory = categoryRows.find((category) => category.label === post.category);

        // Seconde syntaxe pour les requêtes : la requête 'objet'
        const insertPostQuery = {
            // ci dessous un exemple de INSERT avec une subquery
            // Pour aller chercher une donnée qui nous manque
            // text: `
            //     INSERT INTO post
            //     (slug, title, excerpt, content, category_id)
            //     VALUES ($1, $2, $3, $4, (
            //        SELECT id FROM category WHERE label = $5
            //     ))
            // `,
            // values: [
            //     post.slug,
            //     post.title,
            //     post.excerpt,
            //     post.content,
            //     post.category
            // ]
            text: `
                INSERT INTO "post"
                ("slug", "title", "excerpt", "content", "category_id")
                VALUES
                ($1, $2, $3, $4, $5)
            `,
            values: [
                post.slug,
                post.title,
                post.excerpt,
                post.content,
                // On utilise notre objet de référence
                // afin d'inséré le bon id de catégorie rattaché à l'article
                postCategory.id,
            ],
        };

        const query = client.query(insertPostQuery);
        postQueries.push(query);
    });

    // Un fois toutes les executions de requête créer
    // on les resolve toutes en même temps, et il ne faut qu'aucune ne soit en échec
    await Promise.all(postQueries);

    debug('Done');

    // On oubli pas de fermer la connection à la BDD une fois le travail terminé
    client.end();
})();
