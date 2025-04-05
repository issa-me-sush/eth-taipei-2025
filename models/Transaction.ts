import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  merchantAddress: {
    type: String,
    required: [true, 'Please provide merchant address'],
    trim: true,
  },
  merchantName: {
    type: String,
    required: [true, 'Please provide merchant name'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please provide amount'],
    min: [0, 'Amount cannot be negative'],
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },
  userAddress: {
    type: String,
    required: [true, 'Please provide user address'],
    trim: true,
  },
  transactionHash: {
    type: String,
    required: [true, 'Please provide transaction hash'],
    trim: true,
  }
}, {
  timestamps: true
});

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema); 