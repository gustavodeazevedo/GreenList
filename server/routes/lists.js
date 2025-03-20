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
        { owner: req.user.id },
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
    if (list.owner.toString() !== req.user.id &&
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
      owner: req.user.id,
      items: []
    });

    const list = await newList.save();
    res.status(201).json(list);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Adicionar um item a uma lista
router.post('/:listId/items', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);

    // Verificar se a lista existe e pertence ao usuário
    if (!list) {
      return res.status(404).json({ message: 'Lista não encontrada' });
    }

    if (list.owner.toString() !== req.user.id && !list.sharedWith.includes(req.user.id)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Criar o novo item
    const newItem = {
      name: req.body.name,
      quantity: req.body.quantity || 1,
      unit: req.body.unit || 'unit',
      completed: req.body.completed || false
    };

    // Adicionar o item à lista
    list.items.push(newItem);

    // Salvar a lista atualizada
    const updatedList = await list.save();

    // Retornar o item adicionado com seu ID
    const addedItem = updatedList.items[updatedList.items.length - 1];

    console.log('Item adicionado com sucesso:', addedItem);

    res.status(201).json(addedItem);
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    res.status(500).json({ message: 'Erro no servidor' });
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
    if (list.owner.toString() !== req.user.id &&
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
    if (list.owner.toString() !== req.user.id &&
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

// Obter todos os itens de uma lista
router.get('/:listId/items', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);

    // Verificar se a lista existe e pertence ao usuário
    if (!list) {
      return res.status(404).json({ message: 'Lista não encontrada' });
    }

    if (list.owner.toString() !== req.user.id && !list.sharedWith.includes(req.user.id)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    console.log('Enviando itens da lista:', list.items);

    res.json(list.items);
  } catch (error) {
    console.error('Erro ao buscar itens:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

export default router;