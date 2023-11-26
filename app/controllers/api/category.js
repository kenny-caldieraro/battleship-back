const categoryDataMapper = require('../../models/category');
const { ApiError } = require('../../helpers/errorHandler');
/**
 * Un controller :
 * 1. il récupère les infos de l'utilisateur
 * 2. il les vérifie
 * 3. il exécute une action
 * 4. il répond à l'utilisateur
 */

module.exports = {
    /**
     * Category controller to get all records.
     * ExpressMiddleware signature
     * @param {object} _ Express request object (not used)
     * @param {object} res Express response object
     * @returns Route API JSON response
     */
    async getAll(_, res) {
        const categories = await categoryDataMapper.findAll();
        return res.json(categories);
    },

    /**
     * Category controller to get a record.
     * ExpressMiddleware signature
     * @param {object} req Express request object (not used)
     * @param {object} res Express response object
     * @returns Route API JSON response
     */
    async getOne(req, res) {
        const category = await categoryDataMapper.findByPk(req.params.id);

        if (!category) {
            // On renvoi un status 404, et pas 400 car l'information provient de la route elle-même.
            // Si l'information de l'id avait été fourni à travers une queryString ou un body alors
            // on aurait plutôt renvoyé un status 400 générique
            throw new ApiError('Category not found', { statusCode: 404 });
        }

        return res.json(category);
    },

    /**
     * Category controller to create a record.
     * ExpressMiddleware signature
     * @param {object} req Express request object (not used)
     * @param {object} res Express response object
     * @returns Route API JSON response
     */
    async create(req, res) {
        const category = await categoryDataMapper.isUnique(req.body);
        if (category) {
            let field;
            if (category.label === req.body.label) {
                field = 'label';
            } else {
                field = 'route';
            }
            throw new ApiError(`Category already exists with this ${field}`, { statusCode: 400 });
        }

        const savedPost = await categoryDataMapper.insert(req.body);
        return res.json(savedPost);
    },

    /**
     * Category controller to update a record.
     * ExpressMiddleware signature
     * @param {object} req Express request object (not used)
     * @param {object} res Express response object
     * @returns Route API JSON response
     */
    async update(req, res) {
        // On teste si une categorie avec cet id existe
        const category = await categoryDataMapper.findByPk(req.params.id);
        // Si ce n'est pas le cas alors on ne peut pas mettre à jour et on envoi une erreur
        if (!category) {
            throw new ApiError('This category does not exists', { statusCode: 404 });
        }

        // On teste sur une autre actégorie que celle à mettre n'a pas déjà les nouveaux label et
        // route.
        if (req.body.label || req.body.route) {
            const existingCategory = await categoryDataMapper.isUnique(req.body, req.params.id);
            if (existingCategory) {
                let field;
                if (existingCategory.label === req.body.label) {
                    field = 'label';
                } else {
                    field = 'route';
                }
                throw new ApiError(`Other category already exists with this ${field}`, {
                    statusCode: 400,
                });
            }
        }

        const savedPost = await categoryDataMapper.update(req.params.id, req.body);
        return res.json(savedPost);
    },

    /**
     * Category controller to delete a record.
     * ExpressMiddleware signature
     * @param {object} req Express request object (not used)
     * @param {object} res Express response object
     * @returns Route API JSON response
     */
    async delete(req, res) {
        const category = await categoryDataMapper.findByPk(req.params.id);
        if (!category) {
            throw new ApiError('This category does not exists', { statusCode: 404 });
        }

        await categoryDataMapper.delete(req.params.id);
        // 204 : No Content
        return res.status(204).json();
    },
};
