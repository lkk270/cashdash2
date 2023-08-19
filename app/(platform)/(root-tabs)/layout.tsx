import { DashboardLayout } from '@/components/dashboard-layout';
import { getUserStripeAccount } from '@/lib/stripeAccount';
import { checkSubscription } from '@/lib/subscription';
import { getUserCash } from '@/lib/userCash';

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const isPro = await checkSubscription();
  const userCash = await getUserCash();
  const userStripeAccount = await getUserStripeAccount();
  const userValues = { isPro: isPro, userCash: userCash, userStripeAccount: userStripeAccount };

  return <DashboardLayout userValues={userValues} children={children} />;
};

export default RootLayout;
