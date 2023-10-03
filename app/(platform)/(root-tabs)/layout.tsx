import { DashboardLayout } from '@/components/dashboard-layout';
import { checkSubscription } from '@/lib/subscription';
import { getNumOfUnreadNotifications } from '@/lib/notifications';
import { getUserCashString } from '@/lib/userCash';

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const isPro = await checkSubscription();
  const userCashString = await getUserCashString();
  const numOfUnreadNotifications = await getNumOfUnreadNotifications();

  const userValues = {
    isPro: isPro,
    userCashString: userCashString,
    numOfUnreadNotifications: numOfUnreadNotifications,
  };

  return <DashboardLayout userValues={userValues} children={children} />;
};

export default RootLayout;
