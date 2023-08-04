"use client";

import { useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import EmptyState from "@/components/empty-state";

interface ErrorStateProps {
  error: Error;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <DashboardLayout children={ <EmptyState title="Uh Oh" subtitle="Something went wrong!" />} />
     
    </>
  );
};

export default ErrorState;