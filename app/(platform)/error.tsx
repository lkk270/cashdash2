'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { EmptyState } from '@/components/empty-state';

interface ErrorStateProps {
  error: Error;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  // useEffect(() => {
  //   console.error(error);
  // }, [error]);

  return (
    <>
      <DashboardLayout
        userValues={{
          isPro: undefined,
          userCashString: '$0.00',
          numOfUnreadNotifications: undefined,
        }}
      >
        <EmptyState title="Uh Oh" subtitle="Something went wrong!" />
      </DashboardLayout>
    </>
  );
};

export default ErrorState;
