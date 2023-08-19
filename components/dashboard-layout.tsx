import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { UserStripeAccount } from '@prisma/client';

export const DashboardLayout = async ({
  userValues,
  children,
}: {
  userValues: {
    isPro?: boolean;
    userCash?: string;
    userStripeAccount?: UserStripeAccount
  };
  children: React.ReactNode;
}) => {
  return (
    <div className="h-full">
      <Navbar userValues={userValues} />
      <div className="fixed inset-y-0 flex-col hidden w-20 mt-16 md:flex">
        <Sidebar />
      </div>
      <main className="h-full pt-16 md:pl-20">{children}</main>
    </div>
  );
};
