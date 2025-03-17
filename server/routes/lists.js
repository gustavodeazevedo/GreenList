import express from 'express';
import auth from '../middleware/auth.js';
import List from '../models/List.js';
import User from '../models/User.js';

const router = express.Router();

// Get all lists for the current user
router.get('/', auth, async (req, res) => {
  try {
    // Find lists where the user is the owner or the list is shared with them
    const lists = await List.find({
      $or: [
        { user: req.user.id },
        { sharedWith: req.user.id }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(lists);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific list by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    // Check if the user is the owner or the list is shared with them
    if (list.user.toString() !== req.user.id && 
        !list.sharedWith.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to access this list' });
    }
    
    res.json(list);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new list
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    
    const newList = new List({
      name,
      user: req.user.id,
      items: []
    });
    
    const list = await newList.save();
    res.status(201).json(list);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add an item to a list
router.post('/:id/items', auth, async (req, res) => {
  try {
    const { name, quantity, unit } = req.body;
    
    const list = await List.findById(req.params.id);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    // Check if the user is the owner or the list is shared with them
    if (list.user.toString() !== req.user.id && 
        !list.sharedWith.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to modify this list' });
    }
    
    const newItem = {
      name,
      quantity: quantity || 1,
      unit: unit || 'unit',
      completed: false
    };
    
    list.items.push(newItem);
    await list.save();
    
    res.status(201).json(list.items[list.items.length - 1]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an item in a list
router.put('/:id/items/:itemId', auth, async (req, res) => {
  try {
    const { name, quantity, unit, completed } = req.body;
    
    const list = await List.findById(req.params.id);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    // Check if the user is the owner or the list is shared with them
    if (list.user.toString() !== req.user.id && 
        !list.sharedWith.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to modify this list' });
    }
    
    const item = list.items.id(req.params.itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (name !== undefined) item.name = name;
    if (quantity !== undefined) item.quantity = quantity;
    if (unit !== undefined) item.unit = unit;
    if (completed !== undefined) item.completed = completed;
    
    await list.save();
    
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an item from a list
router.delete('/:id/items/:itemId', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    // Check if the user is the owner or the list is shared with them
    if (list.user.toString() !== req.user.id && 
        !list.sharedWith.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to modify this list' });
    }
    
    const itemIndex = list.items.findIndex(item => item._id.toString() === req.params.itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    list.items.splice(itemIndex, 1);
    await list.save();
    
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;