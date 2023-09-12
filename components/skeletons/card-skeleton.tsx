'use client';

import { Skeleton } from '@/components/ui/skeleton';

export const CardSkeleton = () => {
  return (
    <>
      <Skeleton className="w-48 h-48 mb-4 rounded-lg bg-primary/10" />
      {/* Line Skeletons for Text */}
      <Skeleton className="w-full h-4 mb-2 rounded-md bg-primary/10" />
      <Skeleton className="w-3/4 h-4 mb-2 rounded-md bg-primary/10" />
      <Skeleton className="w-1/2 h-4 rounded-md bg-primary/10" />
    </>
  );
};
