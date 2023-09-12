'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const TableSkeleton = () => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-primary/10">
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => {
            // Rendering 5 skeleton rows as an example
            return (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="w-24 h-4 mb-2 bg-primary/10" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-24 h-4 mb-2 bg-primary/10" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-24 h-4 mb-2 bg-primary/10" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
