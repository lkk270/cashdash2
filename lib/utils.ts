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
