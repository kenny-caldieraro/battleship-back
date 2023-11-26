const postDataMapper = require('../../models/post');
const { ApiError } = require('../../helpers/errorHandler');

module.exports = {
    /**
     * Post controller to get all records.
     * ExpressMiddleware signature
     * @param {object} _ Express req.object (not used)
     * @param {object} res Express response object
     * @returns Route API JSON response
     */
    async getAll(_, res) {
        const posts = await postDataMapper.findAll();
        return res.json(posts);
    },

    /**
     * Post controller to get a record.
     * ExpressMiddleware signature
     * @param {object} req Express req.object (not used)
     * @param {object} res Express response object
     * @returns Route API JSON response
     */
    async getOne(req, res) {
        const post = await postDataMapper.findByPk(req.params.id);

        if (!post) {
            throw new ApiError('Post not found', { statusCode: 404 });
        }

        return res.json(post);
    },

    /**
     * Post controller to get a record.
     * ExpressMiddleware signature
     * @param {object} req Express req.object (not used)
     * @param {object} res Express response object
     * @returns Route API JSON response
     */
    async getByCategoryId(req, res) {
        const posts = await postDataMapper.findByCategoryId(req.params.id);
        return res.json(posts);
    },

    /**
     * Post controller to create a record.
     * ExpressMiddleware signature
     * @param {object} req Express req.object (not used)
     * @param {object} res Express response object
     * @returns Route API JSON response
     */
    async create(req, res) {
        const post = await postDataMapper.isUnique(req.body);
        if (post) {
            let field;
            if (post.slug === req.body.slug) {
                field = 'slug';
            } else {
                field = 'title';
            }
            throw new ApiError(`Post already exists with this ${field}`, { statusCode: 400 });
        }

        const savedPost = await postDataMapper.insert(req.body);
        return res.json(savedPost);
    },

    /**
     * Post controller to update a record.
     * ExpressMiddleware signature
     * @param {object} req Express req.object (not used)
     * @param {object} res Express response object
     * @returns Route API JSON response
     */
    async update(req, res) {
        const post = await postDataMapper.findByPk(req.params.id);
        if (!post) {
            throw new ApiError('This post does not exists', { statusCode: 404 });
        }

        if (req.body.slug || req.body.title) {
            const existingPost = await postDataMapper.isUnique(req.body, req.params.id);
            if (existingPost) {
                let field;
                if (existingPost.slug === req.body.slug) {
                    field = 'slug';
                } else {
                    field = 'title';
                }
                throw new ApiError(`Other post already exists with this ${field}`, {
                    statusCode: 400,
                });
            }
        }

        const savedPost = await postDataMapper.update(req.params.id, req.body);
        return res.json(savedPost);
    },

    /**
     * Post controller to delete a record.
     * ExpressMiddleware signature
     * @param {object} req Express req.object (not used)
     * @param {object} res Express response object
     * @returns Route API JSON response
     */
    async delete(req, res) {
        const post = await postDataMapper.findByPk(req.params.id);
        if (!post) {
            throw new ApiError('This post does not exists', { statusCode: 404 });
        }

        await postDataMapper.delete(req.params.id);
        return res.status(204).json();
    },
};
