import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let client;
  try {
    const { id, wallet_address } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid merchant ID' });
    }
    if (!wallet_address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    client = await MongoClient.connect(process.env.MONGODB_URI as string);
    const db = client.db();
    const merchantsCollection = db.collection('merchants');
    const transactionsCollection = db.collection('transactions');

    // Verify that the user owns this merchant account
    const merchant = await merchantsCollection.findOne({
      _id: new ObjectId(id),
      walletAddress: wallet_address,
    });

    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    // Fetch transactions
    const transactions = await transactionsCollection
      .find({ merchantId: new ObjectId(id) })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 