import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📨 Merchant API Request:', {
    method: req.method,
    query: req.query,
    headers: req.headers
  });

  if (req.method !== 'GET') {
    console.log('❌ Wrong method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let client;
  try {
    const { wallet_address } = req.query;
    console.log('🔍 Looking up wallet:', wallet_address);

    if (!wallet_address) {
      console.log('❌ No wallet address provided');
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    console.log('🔌 Connecting to MongoDB...');
    client = await MongoClient.connect(process.env.MONGODB_URI as string);
    const db = client.db();
    const merchantsCollection = db.collection('merchants');

    console.log('🔎 Querying merchants collection...');
    const merchant = await merchantsCollection.findOne({
      walletAddress: wallet_address,
    });

    console.log('📦 Query result:', merchant);

    if (!merchant) {
      console.log('❌ No merchant found for wallet:', wallet_address);
      return res.status(404).json({ 
        error: 'Merchant not found',
        message: 'You are not registered as a merchant. Please register first.'
      });
    }

    console.log('✅ Merchant found, sending response');
    res.status(200).json(merchant);
  } catch (error) {
    console.error('🚨 API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  } finally {
    if (client) {
      console.log('🔌 Closing MongoDB connection');
      await client.close();
    }
  }
} 