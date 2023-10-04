import { auth, redirectToSignIn } from '@clerk/nextjs';
import prismadb from '@/lib/prismadb';

export const getNumOfUnreadNotifications = async (): Promise<number> => {
  const { userId } = auth();

  if (!userId) {
    redirectToSignIn();
    return 0;
  }

  const totalNumOfUnreadNotifications = await prismadb.notification.count({
    where: {
      userId: userId,
      read: false,
    },
  });

  return totalNumOfUnreadNotifications || 0;
};
