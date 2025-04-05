import { ObjectId } from 'mongodb';

export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Merchant {
  _id: ObjectId;
  walletAddress: string;
  name: string;
  brandName: string;
  description: string;
  dailyLimit: number;
  phoneNumber: string;
  location: Location;
  address: string;
  commissionPercent: number;
  email: string;
  reputation: number;
  successCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMerchantInput {
  walletAddress: string;
  name: string;
  brandName: string;
  description?: string;
  phoneNumber: string;
  address: string;
  latitude: number;
  longitude: number;
  commissionPercent: number;
  email: string;
  dailyLimit: number;
} 