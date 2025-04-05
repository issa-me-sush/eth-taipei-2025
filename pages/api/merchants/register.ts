import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import { CreateMerchantInput, Merchant } from '../../../lib/models/merchant';
import { verifyPrivyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📨 Registration Request:', {
    method: req.method,
    body: req.body,
    headers: req.headers
  });

  if (req.method !== 'POST') {
    console.log('❌ Wrong method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify Privy token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token' });
    }

    const token = authHeader.split(' ')[1];
    const userId = await verifyPrivyToken(token);

    const input = req.body as CreateMerchantInput;
    console.log('📝 Registration input:', input);

    // Validate input
    if (!input.name || !input.walletAddress || !input.latitude || !input.longitude) {
      console.log('❌ Missing required fields:', {
        name: !input.name,
        walletAddress: !input.walletAddress,
        latitude: !input.latitude,
        longitude: !input.longitude
      });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('🔌 Connecting to MongoDB...');
    const client = await MongoClient.connect(process.env.MONGODB_URI as string);
    const db = client.db();
    const merchants = db.collection<Merchant>('merchants');

    // Create geospatial index
    console.log('📍 Creating geospatial index...');
    await merchants.createIndex({ location: '2dsphere' });

    // Check if merchant already exists
    console.log('🔎 Checking for existing merchant...');
    const existingMerchant = await merchants.findOne({
      walletAddress: input.walletAddress
    });

    if (existingMerchant) {
      console.log('❌ Merchant already exists:', input.walletAddress);
      return res.status(400).json({ error: 'Merchant already exists' });
    }

    const merchant: Omit<Merchant, '_id'> = {
      ...input,
      location: {
        type: 'Point',
        coordinates: [input.longitude, input.latitude],
      },
      currentCashout: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: userId,
    };

    console.log('💾 Creating new merchant:', merchant);
    const result = await merchants.insertOne(merchant);
    console.log('✅ Merchant created:', result.insertedId);

    return res.status(201).json({
      _id: result.insertedId,
      ...merchant,
    });
  } catch (error) {
    console.error('🚨 Registration Error:', error);
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