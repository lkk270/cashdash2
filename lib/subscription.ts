import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  const userStripeSubscription = await prismadb.userStripeSubscription.findUnique({
    where: {
      userId: userId,
    },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
    },
  });

  if (!userStripeSubscription) {
    return false;
  }
  const isValid =
    userStripeSubscription.stripePriceId &&
    userStripeSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();
  console.log(isValid);
  return !!isValid;
};
