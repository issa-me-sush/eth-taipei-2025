import mongoose from 'mongoose';

const merchantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  brandName: {
    type: String,
    required: [true, 'Please provide a brand name'],
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    trim: true,
    lowercase: true,
  },
  commissionPercent: {
    type: Number,
    required: true,
    min: [0, 'Commission cannot be negative'],
    max: [100, 'Commission cannot exceed 100%'],
    default: 0,
  },
  dailyLimit: {
    type: Number,
    required: true,
    min: [0, 'Daily limit cannot be negative'],
    default: 1000000,
  },
  walletAddress: {
    type: String,
    required: [true, 'Please provide a wallet address'],
    unique: true,
    trim: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    }
  },
  address: {
    type: String,
    required: [true, 'Please provide an address'],
    trim: true,
  },
  placeId: {
    type: String,
    required: [true, 'Please provide a place ID'],
    trim: true,
  }
}, {
  timestamps: true
});

// Create a 2dsphere index for geospatial queries
merchantSchema.index({ location: '2dsphere' });

export default mongoose.models.Merchant || mongoose.model('Merchant', merchantSchema); 