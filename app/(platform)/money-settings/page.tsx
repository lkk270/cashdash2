import { SubscriptionButton } from '@/components/subscription-button';
import { LinkStripeButton } from '@/components/link-stripe-button';
import { CashOutButton } from '@/components/cash-out-button';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { checkSubscription } from '@/lib/subscription';
import { getUserCash } from '@/lib/userCash';

const SettingsPage = async () => {
  const isPro = await checkSubscription();
  const userCash = await getUserCash();
  const userValues = { isPro: isPro, userCash: userCash };

  return (
    <DashboardLayout userValues={userValues}>
      <div className="h-full p-4 space-y-6">
        <Card className="p-4 shadow-md bg-primary/10 rounded-xl">
          <h3 className="mb-3 text-lg font-semibold text-sky-500">Subscription Settings</h3>
          <div className="mb-4 text-sm text-zinc-500">
            {isPro
              ? 'You are currently on a Pro plan.'
              : 'You are currently on a free plan. Upgrade to remove ads'}
          </div>
          <SubscriptionButton isPro={isPro} />
        </Card>

        <Card className="p-4 shadow-md bg-primary/10 rounded-xl">
          <h3 className="mb-3 text-lg font-semibold text-sky-500">Cash Outs</h3>
          <div className="flex items-center mb-4 space-x-3">
            <Wallet size={24} />
            <span className="text-zinc-500">Manage your stripe account used for cashing out.</span>
          </div>
          <div className="flex space-x-3">
            <LinkStripeButton hasStripeAccount={!!userCash} />
            <CashOutButton userCash={userCash} />
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
