import express from 'express';
import {
    createList,
    getLists,
    getListById,
    updateList,
    deleteList,
    addItem,
    updateItem,
    removeItem,
    shareList,
    removeSharedUser
} from '../controllers/listController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// List routes
router.route('/')
    .get(getLists)
    .post(createList);

router.route('/:id')
    .get(getListById)
    .put(updateList)
    .delete(deleteList);

// Item routes
router.route('/:id/items')
    .post(addItem);

router.route('/:id/items/:itemId')
    .put(updateItem)
    .delete(removeItem);

// Sharing routes
router.route('/:id/share')
    .post(shareList)
    .delete(removeSharedUser);

export default router;