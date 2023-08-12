import { DashboardLayout } from '@/components/dashboard-layout';
import { checkSubscription } from '@/lib/subscription';

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const isPro = await checkSubscription();

  return <DashboardLayout isPro={isPro} children={children} />;
};

export default RootLayout;
