'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
// import { Poppins } from 'next/font/google';
import { Ban, Bell } from 'lucide-react';

import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { MobileSidebar } from '@/components/headers/mobile-sidebar';
import { useProModal } from '@/hooks/use-pro-modal';
import { useUserCashModal } from '@/hooks/use-user-cash-modal';
import { UserStripeAccount } from '@prisma/client';
import { Notifications } from '@/components/notifications';

// const font = Poppins({
//   weight: '600',
//   subsets: ['latin'],
// });

interface NavbarProps {
  userValues: {
    isPro?: boolean;
    userCashString?: string;
    userStripeAccount?: UserStripeAccount;
    numOfUnreadNotifications?: number;
  };
}

export const Navbar = ({ userValues }: NavbarProps) => {
  const isPro = userValues.isPro;
  const proModal = useProModal();
  const userCashModal = useUserCashModal();
  const pathname = usePathname();
  const [userCashString, setUserCashString] = useState(userValues.userCashString);

  return (
    <div className="fixed z-50 flex items-center justify-between w-full h-16 px-4 py-2 border-b border-primary/10 bg-secondary">
      <div className="flex items-center">
        <MobileSidebar hide={'md'} />
        <Link href="/dashboard">
          {/* <h1
            className={cn(
              "px-3 text-xl font-bold sm:text-3xl text-primary",
              font.className
            )}
          >
            CashDash
          </h1> */}
          <div className="px-3">
            <Logo />
          </div>
        </Link>
      </div>
      <div className="flex items-center">
        <div className="flex items-center sm:flex gap-x-4">
          {userCashString && pathname !== '/money-settings' && (
            <Button
              onClick={() => userCashModal.onOpen(userCashString, setUserCashString)}
              variant="gradient2"
              size="sm"
              className="hidden xs:flex"
            >
              {userCashString}
              {/* {userCashModal.valueChanged ? userCashModal.userCashString : userCashString} */}
            </Button>
          )}
          {isPro !== undefined && isPro === false && (
            <Button
              onClick={proModal.onOpen}
              variant="premium"
              size="sm"
              className="hidden xs:flex gap-x-1"
            >
              <Ban className="w-4 h-4 text-white" /> Ads
            </Button>
          )}
          {typeof userValues.numOfUnreadNotifications === 'number' && (
            <Notifications numOfUnreadNotificationsParam={userValues.numOfUnreadNotifications} />
          )}
          <ModeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
};
