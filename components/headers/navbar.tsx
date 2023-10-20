'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
// import { Poppins } from 'next/font/google';
import { Ban, Bell } from 'lucide-react';

import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { MobileSidebar } from '@/components/headers/mobile-sidebar';
// import { useProModal } from '@/hooks/use-pro-modal';
// import { useUserCashModal } from '@/hooks/use-user-cash-modal';
import { UserStripeAccount } from '@prisma/client';
import { Notifications } from '@/components/notifications';
// import { useUserCash } from '@/components/providers/user-cash-provider';
// import { useIsPro } from '@/components/providers/is-pro-provider';

// const font = Poppins({
//   weight: '600',
//   subsets: ['latin'],
// });

interface NavbarProps {
  userValues: {
    userCashString: string;
    isPro?: boolean;
    userStripeAccount?: UserStripeAccount;
    numOfUnreadNotifications?: number;
  };
}

export const Navbar = ({ userValues }: NavbarProps) => {
  // const proModal = useProModal();
  // const userCashModal = useUserCashModal();
  // const { userCashString, setUserCashString } = useUserCash();
  // const { isPro, setIsPro } = useIsPro();

  // useEffect(() => {
  //   setUserCashString(userValues.userCashString);
  // }, [setUserCashString, userValues.userCashString]);

  // useEffect(() => {
  //   if (typeof userValues.isPro === 'boolean') {
  //     setIsPro(userValues.isPro);
  //   }
  // }, [setIsPro, userValues.isPro]);

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
          {/* {userCashString && (
            <Button
              onClick={() => userCashModal.onOpen(userCashString)}
              variant="gradient2"
              size="sm"
              className="hidden xs:flex"
            >
              {userCashString}
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
          )} */}
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
