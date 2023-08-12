import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidLobbyAccess(inputs: {
  scoreType: string;
  averageScore: number | null;
  scoreRestriction: number;
}): boolean {
  let isValidLobbyAccess = true;

  if (inputs.averageScore !== null) {
    if (
      (inputs.scoreType === 'time' && inputs.averageScore < inputs.scoreRestriction) ||
      (inputs.scoreType === 'points' && inputs.averageScore > inputs.scoreRestriction)
    ) {
      isValidLobbyAccess = false;
    }
  }
  return isValidLobbyAccess;
}

export const convertMillisecondsToMinSec = (ms: number): string => {
  const total_seconds: number = Math.floor(ms / 1000);
  const minutes: number = Math.floor(total_seconds / 60);
  const seconds: number = total_seconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
