import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const PRIVATE_KEY = fs.readFileSync(path.join(process.cwd(), 'keys/rsa.key'), 'utf8');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { code } = req.body;

  try {
    // 1. Exchange code for LINE access token
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.LINE_REDIRECT_URI!,
        client_id: process.env.LINE_CLIENT_ID!,
        client_secret: process.env.LINE_CLIENT_SECRET!,
      }),
    });

    const { access_token } = await tokenResponse.json();

    // 2. Get LINE user profile
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const lineProfile = await profileResponse.json();

    // 3. Create JWT for thirdweb
    const payload = {
      iss: process.env.NEXT_PUBLIC_APP_DOMAIN,
      sub: `line_${lineProfile.userId}`,
      aud: "ETHTaipei2025",
      name: lineProfile.displayName,
      picture: lineProfile.pictureUrl,
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const token = jwt.sign(payload, PRIVATE_KEY, {
      algorithm: 'RS256',
      keyid: '0',
    });

    res.json({ token });
  } catch (error) {
    console.error('LINE auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}
