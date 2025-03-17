import mongoose from 'mongoose';

const itemSchema = mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const shoppingListSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a list name']
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [itemSchema],
    sharedWith: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, {
    timestamps: true
});

const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema);

export default ShoppingList;