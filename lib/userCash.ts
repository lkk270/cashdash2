import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';

export const getUserCashString = async () => {
  const { userId } = auth();

  if (!userId) {
    return '$0.00';
  }

  const userCash = await prismadb.userCash.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!userCash) {
    return '$0.00';
  }
  return '$' + userCash.cash.toFixed(2);
};
