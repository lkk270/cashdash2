import { Reward, PayoutStatus, TierBoundary } from '@prisma/client';

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
  stripePayoutId?: string | null;
  stripeAccountId?: string | null;
};

export type ModifiedPaymentType2 = {
  id: string;
  amount: number;
  status: PayoutStatus;
  createdAt: Date;
  stripePayoutId?: string | null;
  stripeAccountId?: string | null;
};

export type ModifiedGameType = {
  scoreType: string;
  cheatScore: number;
  tierBoundaries: TierBoundary[];
  lobbies: {
    id: string;
    name: string;
    scoreRestriction: number;
    numScoresToAccess: number;
    sessions: {
      id: string;
      expiredDateTime: any;
      startDateTime: any;
      scores: {
        id: string;
      }[];
    }[];
  }[];
};
