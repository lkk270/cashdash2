import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ScoreType } from '@prisma/client';
import { DateTime } from 'luxon';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ValidationResult {
  isValid: boolean;
  message: string;
}

export function isValidLobbyAccess(inputs: {
  lobbyId: string;
  lobbyWithScoresName?: string;
  lobbyWithScoresId?: string;
  userPlayedInSession: boolean;
  scoreType: string;
  weightedAverageScore?: number;
  timesPlayed: number;
  numScoresToAccess: number;
  scoreRestriction: number;
  expiredDateTime: Date;
  startDateTime: Date;
}): ValidationResult {
  let result: ValidationResult = {
    isValid: true,
    message: 'Access granted.',
  };

  const currentDate = new Date();

  let errorMessages: string[] = [];
  let needMorePlays = false;

  // Check if expiredDateTime or startDateTime is before the current Zulu time
  if (inputs.expiredDateTime < currentDate && inputs.startDateTime < currentDate) {
    errorMessages.push('This lobby has expired');
  }

  if (inputs.expiredDateTime < currentDate && inputs.startDateTime > currentDate) {
    errorMessages.push('This lobby is not yet accessible');
  }

  if (inputs.timesPlayed < inputs.numScoresToAccess) {
    needMorePlays = true;
    const moreTimes = inputs.numScoresToAccess - inputs.timesPlayed;
    const timesStr = moreTimes === 1 ? '' : 's';
    if (inputs.scoreType === ScoreType.balance) {
      errorMessages.push(
        `You need to play in ${
          inputs.numScoresToAccess - inputs.timesPlayed
        } more session${timesStr} to gain access to this tier - skill level permitting`
      );
    } else {
      errorMessages.push(
        `You need to play and finish this game ${
          inputs.numScoresToAccess - inputs.timesPlayed
        } more time${timesStr} to gain access to this tier - skill level permitting`
      );
    }
  }

  if (
    needMorePlays === false &&
    inputs.userPlayedInSession === false &&
    inputs.weightedAverageScore
  ) {
    //if the there is at least one score for this lobby session then even if the user becomes too good for the session, they are still allowed to access it for the remainder of the lobby session.
    if (
      inputs.scoreRestriction !== -1 &&
      ((inputs.scoreType === ScoreType.time &&
        inputs.weightedAverageScore < inputs.scoreRestriction) ||
        ((inputs.scoreType === ScoreType.points || inputs.scoreType === ScoreType.balance) &&
          inputs.weightedAverageScore > inputs.scoreRestriction))
    ) {
      errorMessages.push("You're too good of a player to access this tier!");
    }
  }

  if (inputs.lobbyWithScoresId && inputs.lobbyWithScoresId !== inputs.lobbyId) {
    errorMessages.push(
      `You have already played in a different tier: ${inputs.lobbyWithScoresName?.toUpperCase()}. You can only play in one tier at a time. Once the ${inputs.lobbyWithScoresName?.toUpperCase()} session resets, you will be able to choose another tier - skill level permitting`
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
  const seconds: string = (exactSeconds - minutes * 60).toPrecision(4);
  if (minutes === 0) {
    return `${seconds}s`;
  } else {
    return `${minutes}m ${seconds}s`;
  }
};

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

export function areDatesWithinXMinutes(date1: Date, date2: Date, minutesApart: number) {
  const minutesApartInMs = minutesApart * 60 * 1000;
  const difference = Math.abs(date1.getTime() - date2.getTime());
  return difference <= minutesApartInMs;
}

export function formatBalance(balance: number): string {
  if (balance <= 9999) {
    return balance.toString();
  } else if (balance >= 995_000 && balance < 1_000_000) {
    return '1M';
  } else if (balance < 1_000_000) {
    return (Math.round(balance / 100) / 10 + 'K').toString();
  } else if (balance < 1_000_000_000) {
    return (Math.round(balance / 100_000) / 10 + 'M').toString();
  } else {
    return (Math.round(balance / 100_000_000) / 10 + 'B').toString();
  }
}

export const getStartAndExpiredDate = () => {
  const currentDateInEST = DateTime.now().setZone('America/New_York');
  const isPastMidnight = currentDateInEST.hour === 0;

  let baseDate;
  if (isPastMidnight) {
    baseDate = currentDateInEST;
  } else {
    baseDate = currentDateInEST.plus({ days: 1 });
  }

  // Set startDateTime to 00:05 AM
  const startDateTime = baseDate.set({ hour: 0, minute: 5, second: 0, millisecond: 0 }).toJSDate();

  // Set expiredDateTime to 11:59 PM
  const expiredDateTime = baseDate
    .set({ hour: 23, minute: 59, second: 0, millisecond: 0 })
    .toJSDate();

  return { startDateTime, expiredDateTime };
};
