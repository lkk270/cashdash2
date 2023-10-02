'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

export const NotificationsSkeleton = () => {
  return [...Array(3)].map((_, i) => {
    // Rendering 5 skeleton rows as an example
    return (
      <div>
        <Skeleton className="w-1/2 h-4 mb-2 bg-primary/10" />
        <Skeleton className="w-2/3 h-4 mb-2 bg-primary/10" />
        <Skeleton className="w-full h-4 mb-2 bg-primary/10" />
        <DropdownMenuSeparator />
      </div>
    );
  });
};