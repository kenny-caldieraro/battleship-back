const express = require('express');

const validate = require('../../validation/validator');
const createSchema = require('../../validation/schemas/postCreateSchema');
const updateSchema = require('../../validation/schemas/postUpdateSchema');

const { postController: controller } = require('../../controllers/api');
const controllerHandler = require('../../helpers/controllerHandler');

const router = express.Router();

router
    .route('/')
    /**
     * GET /api/posts
     * @summary Get all posts
     * @tags Post
     * @return {[Post]} 200 - success response - application/json
     */
    .get(controllerHandler(controller.getAll))
    /**
     * POST /api/posts
     * @summary Create a post
     * @tags Post
     * @param {InputPost} request.body.required - post info
     * @return {Post} 200 - success response - application/json
     * @return {ApiError} 400 - Bad request response - application/json
     */
    .post(validate('body', createSchema), controllerHandler(controller.create));

router
    .route('/:id(\\d+)')
    /**
     * GET /api/posts/{id}
     * @summary Get one post
     * @tags Post
     * @param {number} id.path.required - post identifier
     * @return {Post} 200 - success response - application/json
     * @return {ApiError} 400 - Bad request response - application/json
     * @return {ApiError} 404 - Post not found - application/json
     */
    .get(controllerHandler(controller.getOne))
    /**
     * PATCH /api/posts/{id}
     * @summary Update one post
     * @tags Post
     * @param {number} id.path.required - post identifier
     * @param {InputPost} request.body.required - post info
     * @return {Post} 200 - success response - application/json
     * @return {ApiError} 400 - Bad request response - application/json
     * @return {ApiError} 404 - Post not found - application/json
     */
    .patch(validate('body', updateSchema), controllerHandler(controller.update))
    /**
     * DELETE /api/posts/{id}
     * @summary Delete one post
     * @tags Post
     * @param {number} id.path.required - post identifier
     * @return {Post} 200 - success response - application/json
     * @return {ApiError} 400 - Bad request response - application/json
     * @return {ApiError} 404 - Post not found - application/json
     */
    .delete(controllerHandler(controller.delete));

router
    .route('/category/:id(\\d+)')
    /**
     * GET /api/posts/category/{id}
     * @summary Get posts by category
     * @tags Post
     * @param {number} id.path.required - category identifier
     * @return {[Post]} 200 - success response - application/json
     * @return {ApiError} 400 - Bad request response - application/json
     * @return {ApiError} 404 - Category not found - application/json
     */
    .get(controllerHandler(controller.getByCategoryId));

module.exports = router;
