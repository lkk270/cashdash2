// import { Navbar } from "@/components/navbar";
import Loader from '@/components/loader';
import { DashboardLayout } from '@/components/dashboard-layout';

const Loading = () => {
  return (
    <>
      <DashboardLayout
        userValues={{ isPro: undefined, userCash: undefined }}
        children={<Loader />}
      />
    </>
  );
};

export default Loading;
