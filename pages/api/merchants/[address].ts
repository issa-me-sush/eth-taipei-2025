import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Merchant from '@/models/Merchant';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { address } = req.query;
    
    console.log('Looking up merchant with address:', address);
    
    if (!address || typeof address !== 'string') {
      console.log('Invalid address parameter:', address);
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    // First try exact match
    let merchant = await Merchant.findOne({ walletAddress: address });
    
    // If no exact match, try case-insensitive
    if (!merchant) {
      console.log('No exact match, trying case-insensitive search');
      merchant = await Merchant.findOne({
        walletAddress: new RegExp(`^${address.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      });
    }

    if (!merchant) {
      console.log('No merchant found for address:', address);
      // Let's check what merchants exist in the database
      const allMerchants = await Merchant.find({}, 'walletAddress');
      console.log('Available merchant addresses:', allMerchants.map(m => m.walletAddress));
      
      return res.status(404).json({ 
        success: false,
        message: 'Merchant not found' 
      });
    }

    console.log('Found merchant:', merchant.brandName);
    return res.status(200).json({
      success: true,
      message: 'Merchant found',
      merchant: merchant.toObject()
    });

  } catch (error) {
    console.error('Error in merchant lookup:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 