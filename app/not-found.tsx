// import { useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { EmptyState } from '@/components/empty-state';

interface NotFoundProps {
  error: Error;
}

const NotFound: React.FC<NotFoundProps> = ({ error }) => {
  return (
    <>
      <DashboardLayout
        userValues={{ isPro: undefined, userCash: undefined }}
        children={<EmptyState title="Uh Oh" subtitle="404 - Page not Found 👾" />}
      />
    </>
  );
};

export default NotFound;
