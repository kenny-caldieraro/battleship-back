const client = require('../config/db');
const categoryDataMapper = require('./category');
const { ApiError } = require('../helpers/errorHandler');

/**
 * @typedef {object} Post
 * @property {number} id - Indentifiant unique, Pk de la table
 * @property {string} slug - URL d'accès au post (pour le SEO)
 * @property {string} title - Titre de l'article
 * @property {string} excerpt - Texte d'introduction de l'article
 * @property {string} content - Contenu de l'article
 * @property {number} categoryId - Id de la catégorie à laquelle est rattaché le posts
 */

/**
 * @typedef {object} InputPost
 * @property {string} slug - URL d'accès au post (pour le SEO)
 * @property {string} title - Titre de l'article
 * @property {string} excerpt - Texte d'introduction de l'article
 * @property {string} content - Contenu de l'article
 * @property {number} categoryId - Id de la catégorie à laquelle est rattaché le posts
 */

module.exports = {
    /**
     * Récupère tout sans filtre ni ordre
     * @returns - Tous les posts dans la base de donnée
     */
    async findAll() {
        const result = await client.query('SELECT * FROM post');
        return result.rows;
    },

    /**
     * Récupère par sont id
     * @param {number} postId - L'id du post souhaité
     * @returns - Le Post souhaité ou undefined si aucun Post à cet id
     */
    async findByPk(postId) {
        const result = await client.query('SELECT * FROM post WHERE id = $1', [postId]);

        if (result.rowCount === 0) {
            return null;
        }

        return result.rows[0];
    },

    /**
     * Ajoute dans la base de données
     * @param {InputPost} post - Les données à insérer
     * @returns Le Post inséré
     */
    async insert(post) {
        const savedPost = await client.query(
            `
        INSERT INTO post
        (slug, title, excerpt, content, category_id) VALUES
        ($1, $2, $3, $4, $5) RETURNING *
      `,
            [post.slug, post.title, post.excerpt, post.content, post.category_id],
        );

        return savedPost.rows[0];
    },

    /**
     * Modifie dans la base de données
     * @param {number} id - L'id à modifier
     * @param {InputPost} post - Les données à modifier
     * @returns Le Post modifié
     */
    async update(id, post) {
        const fields = Object.keys(post).map((prop, index) => `"${prop}" = $${index + 1}`);
        const values = Object.values(post);

        const savedPost = await client.query(
            `
                UPDATE post SET
                    ${fields}
                WHERE id = $${fields.length + 1}
                RETURNING *
            `,
            [...values, id],
        );

        return savedPost.rows[0];
    },

    /**
     * Supprime de la base de données
     * @param {number} id - L'id à supprimer
     * @returns Le résultat de la suppression
     */
    async delete(id) {
        const result = await client.query('DELETE FROM post WHERE id = $1', [id]);
        // Soit il a supprimer un enregistrement et
        // le rowcount est égal à 1 (truthy)soit non et il est égal a 0 (falsy)
        // On cast le truthy/falsy en vrai booléen
        return !!result.rowCount;
    },

    /**
     * Vérifie si un post existe déjà avec le titre ou le slug
     * @param {object} inputData - Les données fourni par le client
     * @param {number} postId - L'identifiant du post (optionnel)
     * @returns - Le Post existant
     * ou undefined si aucun Post avec ces données
     */
    async isUnique(inputData, postId) {
        const fields = [];
        const values = [];
        // On récupère la liste des infos envoyés
        Object.entries(inputData).forEach(([key, value], index) => {
            // On ne garde que les infos qui sont censées être unique
            if (['slug', 'title'].includes(key)) {
                // On génère le filtre avec ces infos
                fields.push(`"${key}" = $${index + 1}`);
                values.push(value);
            }
        });

        const preparedQuery = {
            text: `SELECT * FROM post WHERE (${fields.join(' OR ')})`,
            values,
        };

        // Si l'id est fourni on exclu l'enregistrement qui lui correspond
        if (postId) {
            preparedQuery.text += ` AND id <> $${values.length + 1}`;
            preparedQuery.values.push(postId);
        }
        const result = await client.query(preparedQuery);

        if (result.rowCount === 0) {
            return null;
        }

        return result.rows[0];
    },

    /**
     * Récupère par l'id de category
     * @param {number} categoryId - L'id de la Category
     * @returns - La liste des Post marqué avec cette Categorydans la BDD
     */
    async findByCategoryId(categoryId) {
        // On veut d'abord vérifié que la category demandé existe
        const category = await categoryDataMapper.findByPk(categoryId);
        if (!category) {
            // Elle n'existe pas, je veux le signaler au controller
            // mais un return ne semble pas adapté.
            // Je vais donc "lancer" une exception que mon controller va pouvoir
            // "attraper" et traiter
            throw new ApiError('Category not found', { statusCode: 404 });
        }

        const result = await client.query('SELECT * FROM post WHERE category_id = $1', [
            categoryId,
        ]);
        return result.rows;
    },
};
