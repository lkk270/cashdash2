import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';

export const getUserStripeAccount = async () => {
  const { userId } = auth();

  if (!userId) {
    return undefined;
  }

  const stripeAccount = await prismadb.userStripeAccount.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!stripeAccount) {
    return undefined;
  }
  return stripeAccount;
};
