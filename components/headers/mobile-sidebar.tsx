'use client';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from '@/components/headers/sidebar';
import { Menu } from 'lucide-react';

export const MobileSidebar = ({ hide }: { hide?: boolean }) => {
  const triggerClassName = hide ? 'mr-2  md:hidden' : 'mr-2';
  return (
    <Sheet>
      <SheetTrigger className={triggerClassName}>
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-32 p-0 pt-10 bg-secondary">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};
