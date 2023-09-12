import { DashboardLayout } from '@/components/dashboard-layout';
import { checkSubscription } from '@/lib/subscription';
import { getUserCash } from '@/lib/userCash';

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const isPro = await checkSubscription();
  const userCash = await getUserCash();
  const userValues = { isPro: isPro, userCash: userCash };

  return <DashboardLayout userValues={userValues} children={children} />;
};

export default RootLayout;
