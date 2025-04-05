import { PrivyClient } from '@privy-io/server-auth';

const privy = new PrivyClient(
  process.env.PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

export async function verifyPrivyToken(token: string): Promise<string> {
  try {
    const { userId } = await privy.verifyAuthToken(token);
    return userId;
  } catch (error) {
    throw new Error('Invalid token');
  }
} 