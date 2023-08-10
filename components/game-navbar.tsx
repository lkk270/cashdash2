'use client';

import { UserButton } from '@clerk/nextjs';
import { Lobby, Game, Score } from '@prisma/client';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Orbitron } from 'next/font/google';

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
  console.log(game);
  const router = useRouter();
  const pathname = usePathname();
  const backPath = pathname.split('/').slice(0, -1).join('/');

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col h-full p-4 space-y-2">
        <div className="flex items-center justify-between w-full pb-4 border-b border-primary/10">
          <div className="flex items-center gap-x-2">
            <MobileScoresTable lobby={lobby} />
            <Button onClick={() => router.push(backPath)} size="icon" variant="gradient1">
              <ChevronLeft className="w-8 h-8" />
            </Button>
            <div className="items-center hidden pl-3 sm:flex gap-x-3">
              <CountdownTimer textSize={'text-xl'} targetDate={new Date('2023-08-10T17:36:00Z')} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-y-1">
            <Logo />
            <span
              className={`${orbitronFont.className} font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent`}
            >
              {game.name} {lobby.name}
            </span>
          </div>
          <div className="flex items-center gap-x-3">
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
