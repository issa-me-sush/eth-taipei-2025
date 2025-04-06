import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { address } = req.query;

  if (!address) {
    console.log('❌ Missing merchant address');
    return res.status(400).json({ success: false, message: 'Merchant address is required' });
  }

  try {
    console.log('🔌 Connecting to database...');
    await dbConnect();
    console.log('✅ Database connected');
    
    console.log('🔍 Fetching transaction count for merchant:', address);
    
    const count = await Transaction.countDocuments({
      merchantAddress: address,
      status: 'completed'
    });

    console.log('✅ Found transactions:', count);

    return res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('❌ Error fetching transaction count:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction count'
    });
  }
} 