import { SubscriptionButton } from '@/components/subscription-button';
import { DashboardLayout } from '@/components/dashboard-layout';
import { checkSubscription } from '@/lib/subscription';

const SettingsPage = async () => {
  const isPro = await checkSubscription();

  return (
    <DashboardLayout
      isPro={isPro}
      children={
        <div className="h-full p-4 space-y-2">
          <h3 className="text-lg font-medium">Settings</h3>
          <div className="text-sm text-muted-foreground">
            {isPro
              ? 'You are currently on a Pro plan.'
              : 'You are currently on a free plan. Upgrade to remove ads'}
          </div>
          <SubscriptionButton isPro={isPro} />
        </div>
      }
    />
  );
};

export default SettingsPage;
