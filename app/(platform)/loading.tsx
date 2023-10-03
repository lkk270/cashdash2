// import { Navbar } from "@/components/navbar";
import Loader from '@/components/loader';
import { DashboardLayout } from '@/components/dashboard-layout';

const Loading = () => {
  return (
    <>
      <DashboardLayout
        userValues={{
          isPro: undefined,
          userCashString: '$0.00',
          numOfUnreadNotifications: undefined,
        }}
        children={<Loader />}
      />
    </>
  );
};

export default Loading;
