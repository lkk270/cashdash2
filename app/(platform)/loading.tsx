// import { Navbar } from "@/components/navbar";
import Loader from '@/components/loader';
import { DashboardLayout } from '@/components/dashboard-layout';

const Loading = () => {
  return (
    <>
      <DashboardLayout isPro={true} children={<Loader />} />
    </>
  );
};

export default Loading;
