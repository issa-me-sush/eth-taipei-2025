import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Merchant from '@/models/Merchant';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    // Create merchant
    const merchant = await Merchant.create(req.body);
    
    return res.status(201).json({
      success: true,
      merchant
    });
  } catch (error: any) {
    console.error('Error registering merchant:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'A merchant with this wallet address already exists' 
      });
    }

    return res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to register merchant'
    });
  }
} 