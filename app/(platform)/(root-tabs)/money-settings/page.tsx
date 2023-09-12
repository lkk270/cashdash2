import { SubscriptionButton } from '@/components/buttons/subscription-button';
import { LinkStripeButton } from '@/components/buttons/link-stripe-button';
import { CashOutButton } from '@/components/buttons/cash-out-button';
import { Card } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { checkSubscription } from '@/lib/subscription';
import { getUserCash } from '@/lib/userCash';
import { getUserStripeAccount } from '@/lib/stripeAccount';
import { OpenPayoutHistoryModal } from '@/components/buttons/open-payout-history-modal-button';

const SettingsPage = async () => {
  const isPro = await checkSubscription();
  const userCash = await getUserCash();
  const userStripeAccount = await getUserStripeAccount();
  return (
    <div className="h-full p-4 space-y-6">
      <Card className="p-4 shadow-md bg-primary/10 rounded-xl">
        <h3 className="mb-3 text-lg font-bold text-sky-300">Subscription Settings</h3>
        <div className="mb-4 text-sm text-zinc-500">
          {isPro
            ? 'You are currently on a Pro plan.'
            : 'You are currently on a free plan. Upgrade to remove ads'}
        </div>
        <SubscriptionButton isPro={isPro} />
      </Card>

      <Card className="p-4 shadow-md bg-primary/10 rounded-xl">
        <h3 className="mb-3 text-lg font-bold text-sky-300">Cash Outs</h3>
        <div className="flex items-center mb-4 space-x-3">
          <Wallet size={24} />
          <span className="text-zinc-500">Manage your stripe account used for cashing out.</span>
        </div>
        <div className="flex flex-wrap min-w-[100px]">
          <LinkStripeButton userStripeAccount={userStripeAccount} />
          <CashOutButton userStripeAccount={userStripeAccount} userCash={userCash} />
          <OpenPayoutHistoryModal />
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
