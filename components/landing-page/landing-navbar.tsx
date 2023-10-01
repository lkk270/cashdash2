'use client';

// import { Montserrat } from "next/font/google";
// import Image from "next/image";
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

// import { cn } from "@/lib/utils";
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';

// const font = Montserrat({ weight: "600", subsets: ["latin"] });

export const LandingNavbar = () => {
  const { isSignedIn } = useAuth();
  const startButtonName = isSignedIn ? 'To Dashboard ->' : 'Get Started';
  if (isSignedIn) {
    window.location.href = '/dashboard';
  }
  return (
    <nav className="flex items-center justify-between p-4 bg-transparent">
      <Link href="/" className="flex items-center">
        {/* <Image fill alt="Logo" src="images/logo2.svg" /> */}
        <Logo />
      </Link>
      <div className="flex items-center gap-x-2">
        <Link href={isSignedIn ? '/dashboard' : '/sign-up'}>
          <Button variant="outline" className="rounded-full">
            {startButtonName}
          </Button>
        </Link>
      </div>
    </nav>
  );
};
