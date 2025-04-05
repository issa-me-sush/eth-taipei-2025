import { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  walletAddress: string;
  dailyLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  _id: ObjectId;
  date: Date;
  merchantAddress: string;
  merchantName: string;
  amount: number; // in USDC
  status: 'pending' | 'completed' | 'failed';
  userAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  walletAddress: string;
  dailyLimit?: number;
} 