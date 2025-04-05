import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../lib/mongodb';
import { CreateMerchantInput } from '../../../lib/models/merchant';
import { verifyPrivyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get Privy token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token' });
    }

    const token = authHeader.split(' ')[1];
    const walletAddress = await verifyPrivyToken(token);

    const input = req.body as CreateMerchantInput;

    const { db } = await connectToDatabase();

    // Create merchant
    const result = await db.collection('merchants').insertOne({
      ...input,
      walletAddress,
      location: {
        type: 'Point',
        coordinates: [input.longitude, input.latitude],
      },
      reputation: 0,
      successCount: 0,
      currentCashout: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({ _id: result.insertedId });
  } catch (error) {
    console.error('Error registering merchant:', error);
    return res.status(500).json({ error: 'Failed to register merchant' });
  }
} 