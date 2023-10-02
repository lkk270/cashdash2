import { DashboardLayout } from '@/components/dashboard-layout';
import { checkSubscription } from '@/lib/subscription';
import { getNumOfUnreadNotifications } from '@/lib/notifications';
import { getUserCash } from '@/lib/userCash';

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const isPro = await checkSubscription();
  const userCash = await getUserCash();
  const numOfUnreadNotifications = await getNumOfUnreadNotifications();

  const userValues = {
    isPro: isPro,
    userCash: userCash,
    numOfUnreadNotifications: numOfUnreadNotifications,
  };

  return <DashboardLayout userValues={userValues} children={children} />;
};

export default RootLayout;
