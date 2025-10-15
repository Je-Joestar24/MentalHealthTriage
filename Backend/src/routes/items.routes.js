import express from 'express';
import { body, param } from 'express-validator';
import asyncWrapper from '../middleware/async.wrapper.js';
import * as ItemsController from '../controllers/items.controller.js';

const router = express.Router();

router.get('/', asyncWrapper(ItemsController.list));        // GET /api/items
router.get('/:id', [param('id').isString()], asyncWrapper(ItemsController.getById));
router.post('/', [ body('name').isString().notEmpty() ], asyncWrapper(ItemsController.create));
router.put('/:id', [param('id').isString(), body('name').optional().isString()], asyncWrapper(ItemsController.update));
router.delete('/:id', [param('id').isString()], asyncWrapper(ItemsController.remove));

export default router;