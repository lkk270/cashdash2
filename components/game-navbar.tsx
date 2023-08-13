'use client';

import { UserButton } from '@clerk/nextjs';
import { Lobby, Game, Score } from '@prisma/client';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, Info } from 'lucide-react';
import { Orbitron } from 'next/font/google';

import { useLobbyAboutModal } from '@/hooks/use-lobby-about-modal';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { MobileScoresTable } from '@/components/mobile-scores-table';
import { CountdownTimer } from '@/components/countdown-timer';

const orbitronFont = Orbitron({ subsets: ['latin'] });

interface LobbyHeaderProps {
  lobby: Lobby & {
    scores: Score[];
    _count: {
      scores: number;
    };
  };
  game: Game;
}

export const GameNavbar = ({ lobby, game }: LobbyHeaderProps) => {
  const lobbyAboutModal = useLobbyAboutModal();
  const router = useRouter();
  const pathname = usePathname();
  const backPath = pathname.split('/').slice(0, -1).join('/');

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col h-full p-4 space-y-2">
        <div className="grid items-center w-full grid-cols-3 pb-4 border-b border-primary/10">
          {/* Left content */}
          <div className="flex items-center gap-x-2">
            <MobileScoresTable lobby={lobby} />
            <Button
              onClick={() => router.push(backPath)}
              size="icon"
              variant="gradient1"
              className="hidden sm:flex"
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
            <div className="flex items-center sm:hidden gap-x-2">
              <Button
                title="Details"
                onClick={() => lobbyAboutModal.onOpen({ gameName: game.name, lobby: lobby })}
                size="icon"
                variant="ghost"
              >
                <Info className="w-6 h-6" />
              </Button>
            </div>
            <div className="items-center hidden pl-3 lg:flex gap-x-3">
              <CountdownTimer textSize={'text-sm'} targetDate={new Date('2024-08-10T17:36:00Z')} />
            </div>
          </div>
          {/* Center content */}
          <div className="flex flex-col items-center justify-center">
            <Logo />
            <span
              className={`${orbitronFont.className} font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent whitespace-nowrap`}
            >
              {game.name} {lobby.name}
            </span>
          </div>

          {/* Right content */}
          <div className="flex items-center justify-end gap-x-3">
            <div className="items-center hidden sm:flex gap-x-2">
              <Button
                title="Details"
                onClick={() => lobbyAboutModal.onOpen({ gameName: game.name, lobby: lobby })}
                size="icon"
                variant="ghost"
              >
                <Info className="w-6 h-6" />
              </Button>
            </div>
            {/* added justify-end to align items to the right */}
            <div className="flex items-center sm:flex gap-x-3">
              <ModeToggle />
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </div>
  );
};
