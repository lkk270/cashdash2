import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { checkSubscription } from '@/lib/subscription';

export const DashboardLayout = async ({
  isPro,
  children,
}: {
  isPro: boolean;
  children: React.ReactNode;
}) => {
  return (
    <div className="h-full">
      <Navbar isPro={isPro} />
      <div className="fixed inset-y-0 flex-col hidden w-20 mt-16 md:flex">
        <Sidebar />
      </div>
      <main className="h-full pt-16 md:pl-20">{children}</main>
    </div>
  );
};
