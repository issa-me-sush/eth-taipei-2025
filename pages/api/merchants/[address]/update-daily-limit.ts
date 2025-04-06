import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Merchant from '@/models/Merchant';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { address } = req.query;
  const { amountUsed } = req.body;

  if (!address || !amountUsed) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required parameters' 
    });
  }

  try {
    await dbConnect();

    // Find the merchant and update their daily limit
    const merchant = await Merchant.findOne({ walletAddress: address });

    if (!merchant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Merchant not found' 
      });
    }

    // Calculate new daily limit
    const newDailyLimit = merchant.dailyLimit - amountUsed;

    // Update the merchant's daily limit
    const updatedMerchant = await Merchant.findOneAndUpdate(
      { walletAddress: address },
      { dailyLimit: newDailyLimit },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Daily limit updated successfully',
      dailyLimit: updatedMerchant.dailyLimit
    });

  } catch (error) {
    console.error('Error updating merchant daily limit:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update daily limit' 
    });
  }
} 