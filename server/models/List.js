import mongoose from 'mongoose';

const ListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      name: {
        type: String,
        required: true,
        trim: true
      },
      quantity: {
        type: Number,
        default: 1
      },
      unit: {
        type: String,
        default: 'unit'
      },
      completed: {
        type: Boolean,
        default: false
      }
    }
  ],
  sharedWith: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('List', ListSchema);