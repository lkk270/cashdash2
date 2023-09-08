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
  lobbyId: string;
  lobbyNameWithGameSession?: string;
  lobbyIdWithGameSession?: string;
  userPlayedInSession: boolean;
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
    errorMessages.push('This lobby has expired');
  }

  if (inputs.expiredDateTime < currentZuluTime && inputs.startDateTime > currentZuluTime) {
    errorMessages.push('This lobby is not yet accessible');
  }

  if (inputs.userPlayedInSession === false && inputs.averageScore !== null) {
    //if the there is at least one score for this lobby session then even if the user becomes too good for the session, they are still allowed to access it for the remainder of the lobby session.
    if (
      (inputs.scoreType === 'time' && inputs.averageScore < inputs.scoreRestriction) ||
      (inputs.scoreType === 'points' && inputs.averageScore > inputs.scoreRestriction)
    ) {
      errorMessages.push("You're too good of a player to access this tier!");
    }
  }

  if (inputs.lobbyIdWithGameSession && inputs.lobbyIdWithGameSession !== inputs.lobbyId) {
    errorMessages.push(
      `You have already played in a different tier: ${inputs.lobbyNameWithGameSession?.toUpperCase()}. You can only play in one tier at a time. Once the ${inputs.lobbyNameWithGameSession?.toUpperCase()} session resets, you will be able to choose another tier - skill level permitting`
    );
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

export const convertMillisecondsToMinExactSec = (exactSeconds: number): string => {
  const minutes: number = Math.floor(exactSeconds / 60);
  const seconds: string = (exactSeconds - minutes * 60).toPrecision(3);
  if (minutes === 0) {
    return `${seconds}s`;
  } else {
    return `${minutes}m ${seconds}s`;
  }
};

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}
