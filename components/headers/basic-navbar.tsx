'use client';

import Link from 'next/link';
import Logo from '@/components/logo';

export const BasicNavbar = () => {
  return (
    <nav className="flex items-center justify-between pl-4 bg-transparent">
      <Link href="/">
        {/* <Image fill alt="Logo" src="images/logo2.svg" /> */}
        <Logo />
      </Link>
      <div className="flex items-center gap-x-2"></div>
    </nav>
  );
};
