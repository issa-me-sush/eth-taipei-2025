import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/dbConnect';
import Transaction from '../../../models/Transaction';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🚀 Starting transaction creation...');
  
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));

    const {
      merchantAddress,
      merchantName,
      amount,
      userAddress,
      transactionHash,
    } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!merchantAddress) missingFields.push('merchantAddress');
    if (!merchantName) missingFields.push('merchantName');
    if (!amount) missingFields.push('amount');
    if (!userAddress) missingFields.push('userAddress');
    if (!transactionHash) missingFields.push('transactionHash');

    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return res.status(400).json({ 
        message: 'Missing required fields',
        missingFields 
      });
    }

    console.log('🔌 Connecting to database...');
    await dbConnect();
    console.log('✅ Database connected');

    console.log('💾 Creating transaction...');
    const transaction = await Transaction.create({
      date: new Date(),
      merchantAddress,
      merchantName,
      amount: parseFloat(amount),
      status: 'completed',
      userAddress,
      transactionHash,
    });

    console.log('✅ Transaction saved successfully:', {
      transactionId: transaction._id,
      details: transaction.toObject()
    });

    return res.status(200).json({
      message: 'Transaction saved successfully',
      transaction: transaction.toObject()
    });
  } catch (error) {
    console.error('❌ Failed to save transaction:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return res.status(500).json({ 
      message: 'Failed to save transaction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 