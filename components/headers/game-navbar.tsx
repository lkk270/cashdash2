'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Lobby, Game, LobbySession } from '@prisma/client';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, Info } from 'lucide-react';
import { Orbitron } from 'next/font/google';

import { useLobbyAboutModal } from '@/hooks/use-lobby-about-modal';
// import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { MobileSidebar } from '@/components/headers/mobile-sidebar';
import { MobileScoresTable } from '@/components/mobile-scores-table';
import { CountdownTimer } from '@/components/countdown-timer';
import { ModifiedScoreType } from '@/app/types';

const orbitronFont = Orbitron({ subsets: ['latin'] });

interface LobbyHeaderProps {
  lobby: Lobby & {
    sessions: LobbySession[];
  };
  game: Game;
  scores: ModifiedScoreType[];
}

export const GameNavbar = ({ lobby, game, scores }: LobbyHeaderProps) => {
  const lobbyAboutModal = useLobbyAboutModal();
  const router = useRouter();
  const pathname = usePathname();
  const backPath = pathname ? pathname.split('/').slice(0, -1).join('/') : '/dashboard';
  const countdownData = {
    textSize: 'text-sm',
    expiredDateTime: lobby.sessions[0].expiredDateTime,
    startDateTime: lobby.sessions[0].startDateTime,
  };
  return (
    //     <div className="fixed z-50 flex items-center justify-between w-full h-16 px-4 py-2 border-b border-primary/10 bg-secondary">

    <div className="w-full">
      <div className="flex flex-col h-full p-3 space-y-2">
        <div className="grid items-center w-full grid-cols-3 pb-1 border-b border-primary/10">
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
            <MobileSidebar hide={'lg'} />
            <MobileScoresTable scores={scores} scoreType={game.scoreType} lobby={lobby} />
            <div className="items-center hidden pl-3 lg:flex gap-x-3">
              <CountdownTimer data={countdownData} />
            </div>
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
                {game.name}
              </span>
              <span
                className={`${orbitronFont.className} font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent whitespace-nowrap flex-grow`}
              >
                {' '}
                {lobby.name.split(' or New Player')[0]}
              </span>
            </Link>
          </div>

          {/* Right content */}
          <div className="flex items-center justify-end gap-x-4">
            {/* <div className="items-center hidden sm:flex gap-x-2">
              <Button
                title="Details"
                onClick={() => lobbyAboutModal.onOpen({ gameName: game.name, lobby: lobby })}
                size="icon"
                variant="ghost"
              >
                <Info className="w-6 h-6" />
              </Button>
            </div> */}
            <div className="flex items-center">
              <Button
                title="Details"
                onClick={() => lobbyAboutModal.onOpen({ gameName: game.name, lobby: lobby })}
                size="icon"
                variant="ghost"
              >
                <Info className="w-6 h-6 ml-3" />
              </Button>
            </div>
            {/* added justify-end to align items to the right */}
            <ModeToggle />
            <div>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
