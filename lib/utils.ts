import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ValidationResult {
  isValid: boolean;
  message: string;
}

export function isValidLobbyAccess(inputs: {
  scoreType: string;
  averageScore: number | null;
  scoreRestriction: number;
  expiredDateTime: Date;
  startDateTime: Date;
}): ValidationResult {
  let result: ValidationResult = {
    isValid: true,
    message: 'Access granted.',
  };

  const currentZuluTime = new Date();

  let errorMessages: string[] = [];

  // Check if expiredDateTime or startDateTime is before the current Zulu time
  if (inputs.expiredDateTime < currentZuluTime && inputs.startDateTime < currentZuluTime) {
    errorMessages.push('Lobby has expired');
  }

  if (inputs.expiredDateTime < currentZuluTime && inputs.startDateTime > currentZuluTime) {
    errorMessages.push('Lobby is not yet accessible');
  }

  if (inputs.averageScore !== null) {
    if (
      (inputs.scoreType === 'time' && inputs.averageScore < inputs.scoreRestriction) ||
      (inputs.scoreType === 'points' && inputs.averageScore > inputs.scoreRestriction)
    ) {
      errorMessages.push("You're too good of a player to access this tier!");
    }
  }

  // If there are any error messages, update the result to indicate access is denied and provide the error message(s)
  if (errorMessages.length > 0) {
    result.isValid = false;
    result.message = errorMessages.join(' & ');
  }

  return result;
}

export const convertMillisecondsToMinSec = (ms: number): string => {
  const total_seconds: number = Math.floor(ms / 1000);
  const minutes: number = Math.floor(total_seconds / 60);
  const seconds: number = total_seconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}
