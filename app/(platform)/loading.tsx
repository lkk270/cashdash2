// import { Navbar } from "@/components/navbar";
import Loader from "@/components/loader";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Navbar } from "@/components/navbar";

const Loading = () => {
  return (
    <>
      <DashboardLayout children={<Loader />} />
    </>
  );
};

export default Loading;
