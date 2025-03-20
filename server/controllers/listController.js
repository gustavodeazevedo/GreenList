import List from '../models/List.js';
import User from '../models/User.js';

// @desc    Create a new shopping list
// @route   POST /api/lists
// @access  Private
export const createList = async (req, res) => {
    try {
        const { name, items } = req.body;

        const list = await List.create({
            name,
            owner: req.user._id,
            items: items || []
        });

        res.status(201).json(list);
    } catch (error) {
        console.error('Create list error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all lists for a user (owned and shared)
// @route   GET /api/lists
// @access  Private
export const getLists = async (req, res) => {
    try {
        // Find lists where user is owner or in sharedWith array
        const lists = await List.find({
            $or: [
                { owner: req.user._id },
                { sharedWith: req.user._id }
            ]
        }).sort({ updatedAt: -1 });

        res.json(lists);
    } catch (error) {
        console.error('Get lists error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get a single list by ID
// @route   GET /api/lists/:id
// @access  Private
export const getListById = async (req, res) => {
    try {
        const list = await List.findById(req.params.id);

        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        // Check if user is owner or list is shared with them
        if (list.owner.toString() !== req.user._id.toString() &&
            !list.sharedWith.some(userId => userId.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized to access this list' });
        }

        res.json(list);
    } catch (error) {
        console.error('Get list error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a list
// @route   PUT /api/lists/:id
// @access  Private
export const updateList = async (req, res) => {
    try {
        const { name, items } = req.body;
        const list = await List.findById(req.params.id);

        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        // Check if user is the owner
        if (list.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the owner can update this list' });
        }

        // Update list
        list.name = name || list.name;
        if (items) list.items = items;

        const updatedList = await list.save();
        res.json(updatedList);
    } catch (error) {
        console.error('Update list error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a list
// @route   DELETE /api/lists/:id
// @access  Private
export const deleteList = async (req, res) => {
    try {
        const list = await List.findById(req.params.id);

        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        // Check if user is the owner
        if (list.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the owner can delete this list' });
        }

        await list.deleteOne();
        res.json({ message: 'List removed' });
    } catch (error) {
        console.error('Delete list error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add item to list
// @route   POST /api/lists/:id/items
// @access  Private
export const addItem = async (req, res) => {
    try {
        const { text } = req.body;
        const list = await List.findById(req.params.id);

        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        // Check if user is owner or list is shared with them
        if (list.owner.toString() !== req.user._id.toString() &&
            !list.sharedWith.some(userId => userId.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized to modify this list' });
        }

        // Add new item
        const newItem = {
            text,
            completed: false,
            addedBy: req.user._id
        };

        list.items.push(newItem);
        await list.save();

        res.status(201).json(list);
    } catch (error) {
        console.error('Add item error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update item in list
// @route   PUT /api/lists/:id/items/:itemId
// @access  Private
export const updateItem = async (req, res) => {
    try {
        const { text, completed } = req.body;
        const list = await List.findById(req.params.id);

        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        // Check if user is owner or list is shared with them
        if (list.owner.toString() !== req.user._id.toString() &&
            !list.sharedWith.some(userId => userId.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized to modify this list' });
        }

        // Find item
        const item = list.items.id(req.params.itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Update item
        if (text !== undefined) item.text = text;
        if (completed !== undefined) item.completed = completed;

        await list.save();
        res.json(list);
    } catch (error) {
        console.error('Update item error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Remove item from list
// @route   DELETE /api/lists/:id/items/:itemId
// @access  Private
export const removeItem = async (req, res) => {
    try {
        const list = await List.findById(req.params.id);

        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        // Check if user is owner or list is shared with them
        if (list.owner.toString() !== req.user._id.toString() &&
            !list.sharedWith.some(userId => userId.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized to modify this list' });
        }

        // Find and remove item
        const item = list.items.id(req.params.itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        item.deleteOne();
        await list.save();

        res.json(list);
    } catch (error) {
        console.error('Remove item error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Share list with another user
// @route   POST /api/lists/:id/share
// @access  Private
export const shareList = async (req, res) => {
    try {
        const { email } = req.body;
        const list = await List.findById(req.params.id);

        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        // Check if user is the owner
        if (list.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the owner can share this list' });
        }

        // Find user to share with
        const userToShare = await User.findOne({ email });
        if (!userToShare) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already shared
        if (list.sharedWith.includes(userToShare._id)) {
            return res.status(400).json({ message: 'List already shared with this user' });
        }

        // Add user to sharedWith array
        list.sharedWith.push(userToShare._id);
        await list.save();

        res.json({ message: 'List shared successfully' });
    } catch (error) {
        console.error('Share list error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Remove user from shared list
// @route   DELETE /api/lists/:id/share
// @access  Private
export const removeSharedUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const list = await List.findById(req.params.id);

        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        // Check if user is the owner
        if (list.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the owner can modify sharing settings' });
        }

        // Remove user from sharedWith array
        list.sharedWith = list.sharedWith.filter(
            id => id.toString() !== userId
        );

        await list.save();

        res.json({ message: 'User removed from shared list' });
    } catch (error) {
        console.error('Remove shared user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};