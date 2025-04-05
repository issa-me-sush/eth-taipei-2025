import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: [true, 'Please provide a wallet address'],
    unique: true,
    trim: true,
  },
  dailyLimit: {
    type: Number,
    required: true,
    min: [0, 'Daily limit cannot be negative'],
    default: 1000000,
  }
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model('User', userSchema); 