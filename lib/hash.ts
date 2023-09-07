import crypto from 'crypto';

export const generateChallengeHash = (gameSessionId: string, serverSideSecret?: string): string => {
  const dynamicValue = Date.now() + '-' + Math.random().toString(36).substring(2, 15);

  // Create a hash
  const hash = crypto.createHash('sha256');
  hash.update(gameSessionId + serverSideSecret + dynamicValue);

  // Print the hash
  const digest = hash.digest('hex');
  return digest;
};

export const generateResponseHash = (challengeHash: string, score: number): string => {
  // Create a hash
  const hash = crypto.createHash('sha256');
  hash.update(challengeHash + score.toString());

  // Print the hash
  const digest = hash.digest('hex');
  return digest;
};
