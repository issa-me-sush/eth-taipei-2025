import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../lib/dbConnect';
import Transaction from '../../../../models/Transaction';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { address } = req.query;
    
    console.log('🔍 Fetching transactions for user:', address);
    
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ message: 'User address is required' });
    }

    await dbConnect();
    
    // Get all transactions for the user, sorted by date descending
    const transactions = await Transaction.find({ 
      userAddress: address 
    }).sort({ 
      date: -1 
    });

    console.log(`✅ Found ${transactions.length} transactions`);

    return res.status(200).json({
      success: true,
      transactions
    });

  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch transactions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 