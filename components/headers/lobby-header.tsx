'use client';

import Link from 'next/link';
import { Orbitron } from 'next/font/google';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

const orbitronFont = Orbitron({ subsets: ['latin'] });

interface LobbyHeaderProps {
  gameName: string;
}

export const LobbyHeader = ({ gameName }: LobbyHeaderProps) => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-between w-full pb-4">
      <div className="text-sm text-center text-primary/50">
        <div className="flex flex-col items-center justify-center text-2xl">
          <Link href="/dashboard">
            <span
              className={`${orbitronFont.className} font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent whitespace-nowrap`}
            >
              {gameName}
            </span>
            <span
              className={`${orbitronFont.className} font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent whitespace-nowrap flex-grow`}
            >
              {' '}
              Tiers
            </span>
          </Link>
        </div>
        {/* <h1 className="items-center text-3xl font-bold">Choose a Tier</h1> */}
        {/* <div className="items-center hidden ml-20 sm:flex gap-x-2">
          <Button onClick={() => router.push('/dashboard')} size="icon" variant="ghost">
            <ChevronLeft className="w-8 h-8" />
          </Button>
        </div> */}
        <div className="max-w-lg mt-4 text-left">
          <p>
            To maintain an even playing field, better players are restricted to more advanced tiers.
            We use a combination of your average score & individual scores to determine tier
            eligibility. Please note that players can participate in only one tier at any given
            time.
          </p>
        </div>
        <p className="flex justify-center mt-2 font-bold gap-x-1">
          {/* Click <Info /> for more details & prize info */}
          Click <Info size={18} strokeWidth={3} /> for prize info
        </p>
      </div>
      <div className="flex items-center gap-x-2">{/* <Button>TIME LEFT</Button> */}</div>
    </div>
  );
};
