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
    
    // Get user's location from query params
    const { lat, lng } = req.query;
    
    // If we have user's location, sort by distance
    if (lat && lng) {
      const merchants = await Merchant.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [parseFloat(lng as string), parseFloat(lat as string)]
            },
            distanceField: "distance",
            spherical: true,
            distanceMultiplier: 0.001 // Convert to kilometers
          }
        }
      ]);

      return res.status(200).json({
        success: true,
        merchants: merchants
      });
    }
    
    // Otherwise just return all merchants
    const merchants = await Merchant.find({});
    
    return res.status(200).json({
      success: true,
      merchants: merchants
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