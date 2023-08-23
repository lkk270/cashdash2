import { Reward } from '@prisma/client';

export type ScoreRelationsType = {
  id: string;
  userId: string;
  lobbySessionId: string;
  createdAt: Date;
  score: number;
  reward: Reward | null;
  lobbySession: {
    lobby: {
      game: { id: string; name: string; scoreType: string };
    };
  };
};
