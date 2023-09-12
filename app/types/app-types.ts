import { Reward, PayoutStatus } from '@prisma/client';

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

export type ModifiedScoreType = {
  userId: string;
  username: string;
  score: number;
  rank?: number;
};

export type ModifiedScoreType2 = {
  score: number;
  createdAt: Date;
};

export type ModifiedPaymentType = {
  id: string;
  amount: number;
  status: PayoutStatus;
  createdAt: string;
};

export type ModifiedPaymentType2 = {
  id: string;
  amount: number;
  status: PayoutStatus;
  createdAt: Date;
};

