'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const LandingNavbar = () => {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Redirect if signed in
  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);

  const buttonPath = isSignedIn ? '/dashboard' : '/sign-up';
  const startButtonName = isSignedIn ? 'To Dashboard ->' : 'Claim your username';

  return (
    <nav className="flex items-center justify-between p-4 bg-transparent">
      <Link href="/">
        {/* <Image fill alt="Logo" src="images/logo2.svg" /> */}
        <Logo />
      </Link>
      <div className="flex items-center gap-x-2">
        <Link href={buttonPath}>
          <Button variant="outline" className="rounded-full">
            {startButtonName}
          </Button>
        </Link>
      </div>
    </nav>
  );
};
