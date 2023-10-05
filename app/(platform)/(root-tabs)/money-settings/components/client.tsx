'use client';

import { SubscriptionButton } from '@/components/buttons/subscription-button';
import { LinkStripeButton } from '@/components/buttons/link-stripe-button';
import { CashOutButton } from '@/components/buttons/cash-out-button';
import { Card } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { OpenPayoutHistoryModal } from '@/components/buttons/open-payout-history-modal-button';

import { UserStripeAccount } from '@prisma/client';
import { useIsPro } from '@/components/providers/is-pro-provider';

interface MoneySettingsClientProps {
  userStripeAccount?: UserStripeAccount;
}

export const MoneySettingsClient = ({ userStripeAccount }: MoneySettingsClientProps) => {
  const { isPro } = useIsPro();
  return (
    <div className="h-full p-4 pace-y-6 p md:ml-20">
      <Card className="p-4 shadow-md bg-primary/10 rounded-xl">
        <h3 className="mb-3 text-lg font-bold text-sky-300">Subscription Settings</h3>
        <div className="mb-4 text-sm text-zinc-500">
          {isPro
            ? 'You are currently on a Pro plan.'
            : 'You are currently on a free plan. Upgrade to remove ads'}
        </div>
        <SubscriptionButton />
      </Card>

      <Card className="p-4 mt-4 shadow-md bg-primary/10 rounded-xl">
        <h3 className="mb-3 text-lg font-bold text-sky-300">Cash Outs</h3>
        <div className="flex items-center mb-4 space-x-3">
          <Wallet size={24} />
          <span className="text-zinc-500">Manage your Stripe account used for cashing out.</span>
        </div>
        <div className="flex flex-wrap min-w-[100px]">
          <LinkStripeButton userStripeAccount={userStripeAccount} />
          <CashOutButton userStripeAccount={userStripeAccount} />
          <OpenPayoutHistoryModal />
        </div>
      </Card>
    </div>
  );
};
