import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Merchant from '@/models/Merchant';

interface MongoError extends Error {
  code?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const merchant = await Merchant.create(req.body);
    return res.status(201).json({ success: true, merchant });
  } catch (error) {
    console.error('Error creating merchant:', error);
    
    // Check if it's a MongoDB duplicate key error
    if ((error as MongoError).code === 11000) {
      return res.status(400).json({ 
        message: 'A merchant with this wallet address already exists' 
      });
    }

    return res.status(500).json({ 
      success: false,
      message: 'Error creating merchant',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 