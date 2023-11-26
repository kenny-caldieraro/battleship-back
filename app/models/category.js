const client = require('../config/db');

/**
 * @typedef {object} Category
 * @property {number} id - Identifiant unique Pk de la table
 * @property {string} route - Segment d'URL pour accéder à la catégorie (pour SEO)
 * @property {string} label - Le nom affichable de la catégorie
 */

/**
 * @typedef {Object} InputCategory
 * @property {string} route - Segment d'URL pour accéder à la catégorie (pour SEO)
 * @property {string} label - Le nom affichable de la catégorie
 */

module.exports = {
    /**
     * Récupère tout sans filtre ni ordre
     * @returns Tous les categories dans la base de donnée
     */
    async findAll() {
        const result = await client.query('SELECT * FROM category');
        return result.rows;
    },

    /**
     * Récupère par sont id
     * @param {number} categoryId - L'id de la categorie souhaité
     * @returns La categorie souhaité ou undefined si aucune categorie à cet id
     */
    async findByPk(categoryId) {
        const result = await client.query('SELECT * FROM category WHERE id = $1', [categoryId]);

        return result.rows[0];
    },

    /**
     * Ajoute dans la base de données
     * @param {InputCategory} category - Les données à insérer
     * @returns La categorie insérer
     */
    async insert(category) {
        const savedCategory = await client.query(
            `
                INSERT INTO category
                (label, route) VALUES
                ($1, $2) RETURNING *
            `,
            [category.label, category.route],
        );

        return savedCategory.rows[0];
    },

    /**
     * Modifie dans la base de données
     * @param {number} id - L'id à modifier
     * @param {InputCategory} category - Les données à modifier
     * @returns Le Post modifié
     */
    async update(id, inputData) {
        /*
        {
            label: 'machin',
            route: '/machin'
        }
        Object.keys ==> ['label', 'route']
        .map() =======> ['"label" = $1', '"route" = $2']
        .toString() ====> "label" = $1, "route" = $2
        Object.values ===> ['machin', '/machin']
         */
        /*
        const fields = [];
        Object.keys(inputData).forEach((prop, index) => {
            fields.push(`"${prop}" = $${index + 1}`);
        });

        ou

        const fields = [];
        const keyArray = Object.keys(inputData);
        for(const index in keyArray){
            const prop = keyArray[index];
            fields.push(`"${prop}" = $${index + 1}`);
        }
        */
        const fields = Object.keys(inputData).map((prop, index) => `"${prop}" = $${index + 1}`);
        const values = Object.values(inputData);

        const savedCategory = await client.query(
            `
                UPDATE category SET
                    ${fields}
                WHERE id = $${fields.length + 1}
                RETURNING *
            `,
            [...values, id],
        );

        return savedCategory.rows[0];
    },

    /**
     * Supprime de la base de données
     * @param {number} id - L'id à supprimer
     * @returns Le résultat de la suppression
     */
    async delete(id) {
        const result = await client.query('DELETE FROM category WHERE id = $1', [id]);
        // Soit il a supprimer un enregistrement et
        // le rowcount est égal à 1 (truthy)soit non et il est égal a 0 (falsy)
        // On cast le truthy/falsy en vrai booléen
        return !!result.rowCount;
    },

    /**
     * Vérifie si une catégorie existe déjà avec le titre ou le slug
     * @param {object} inputData - Les données fourni par le client
     * @param {number} categoryId - L'identifiant de la catégorie (optionnel)
     * @returns La catégorie existante
     * ou undefined si aucune categorie avec ces données
     */
    async isUnique(inputData, categoryId) {
        const fields = [];
        const values = [];
        // On récupère la liste des infos envoyés
        /*
        {
            label: 'machin',
            route: '/machin'
        }
        Object.entries ==> [
            ['label', 'machin'],
            ['route', '/machin']
        ]
        */
        Object.entries(inputData).forEach(([key, value], index) => {
            // On ne garde que les infos qui sont censées être unique
            if (['label', 'route'].includes(key)) {
                // On génère le filtre avec ces infos
                fields.push(`"${key}" = $${index + 1}`);
                values.push(value);
            }
        });

        const preparedQuery = {
            text: `SELECT * FROM category WHERE (${fields.join(' OR ')})`,
            values,
        };

        // Si l'id est fourni on exclu l'enregistrement qui lui correspond
        if (categoryId) {
            preparedQuery.text += ` AND id <> $${values.length + 1}`;
            preparedQuery.values.push(categoryId);
        }
        const result = await client.query(preparedQuery);

        return result.rows[0];
    },
};
