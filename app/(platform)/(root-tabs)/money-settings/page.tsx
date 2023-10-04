import { getUserStripeAccount } from '@/lib/stripeAccount';

import { MoneySettingsClient } from './components/client';

const MoneySettingsPage = async () => {
  const userStripeAccount = await getUserStripeAccount();
  return <MoneySettingsClient userStripeAccount={userStripeAccount} />;
};

export default MoneySettingsPage;
