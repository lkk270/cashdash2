'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, Info } from 'lucide-react';
import { Orbitron } from 'next/font/google';

import { useLobbyAboutModal } from '@/hooks/use-lobby-about-modal';
// import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { MobileSidebar } from '@/components/headers/mobile-sidebar';
import { useGamePlaygroundInfoModal } from '@/hooks/use-game-playground-info-modal';

const orbitronFont = Orbitron({ subsets: ['latin'] });

interface LobbyHeaderProps {
  gameName: string;
}

export const GameNavbarPlayground = ({ gameName }: LobbyHeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const infoModal = useGamePlaygroundInfoModal();
  const backPath = pathname ? pathname.split('/').slice(0, -1).join('/') : '/dashboard';

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col h-full p-3 space-y-2">
        <div className="grid items-center w-full grid-cols-3 pb-4 border-b border-primary/10">
          {/* Left content */}
          <div className="z-10 flex items-center">
            <Button
              onClick={() => router.push(backPath)}
              size="icon"
              variant="ghost"
              className="hidden mr-1 xxs:flex"
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
            <MobileSidebar hide={false} />
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
            <div className="flex items-center">
              <Button
                title="Details"
                onClick={() => infoModal.onOpen()}
                size="icon"
                variant="ghost"
              >
                <Info className="w-5 h-5 ml-3" />
              </Button>
            </div>
            {/* added justify-end to align items to the right */}
            <div className="items-center hidden xxs:flex">
              <ModeToggle />
            </div>
            <div className="ml-1">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
