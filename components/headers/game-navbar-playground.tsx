'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { Orbitron } from 'next/font/google';

import { useLobbyAboutModal } from '@/hooks/use-lobby-about-modal';
// import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { MobileSidebar } from '@/components/headers/mobile-sidebar';
import { useGamePlaygroundInfoModal } from '@/hooks/use-game-playground-info-modal';

const orbitronFont = Orbitron({ subsets: ['latin'] });

interface HeaderProps {
  gameName: string;
}

export const GameNavbarPlayground = ({ gameName }: HeaderProps) => {
  const infoModal = useGamePlaygroundInfoModal();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col h-full p-3 space-y-2">
        <div className="grid items-center w-full grid-cols-3 pb-4 border-b border-primary/10">
          {/* Left content */}
          <div className="z-10 flex items-center">
            <MobileSidebar hide={'lg'} />
            <Button title="Details" onClick={() => infoModal.onOpen()} size="icon" variant="ghost">
              <Info className="w-5 h-5" />
            </Button>
          </div>
          {/* Center content */}

          <div className="flex flex-col items-center justify-center text-xs xxs:text-xs sm:text-lg">
            {/* <Link href="/dashboard">
              <div className="px-3">
                <Logo />
              </div>
            </Link> */}
            <Link href="/dashboard">
              <span
                className={`${orbitronFont.className} font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent whitespace-nowrap`}
              >
                {gameName}
              </span>
            </Link>
          </div>

          {/* Right content */}
          <div className="flex items-center justify-end">
            {/* added justify-end to align items to the right */}
            <div className="items-center hidden xxs:flex">
              <ModeToggle />
            </div>
            <div className="ml-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
