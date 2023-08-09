'use client';

import { UserButton } from '@clerk/nextjs';
import { Lobby, Score } from '@prisma/client';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { MobileScoresTable } from './mobile-scores-table';
interface LobbyHeaderProps {
  lobby: Lobby & {
    scores: Score[];
    _count: {
      scores: number;
    };
  };
}

export const GameNavbar = ({ lobby }: LobbyHeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const backPath = pathname.split('/').slice(0, -1).join('/');

  return (
    <div className="w-full h-full max-w-4xl mx-auto">
      <div className="flex flex-col h-full p-4 space-y-2">
        <div className="flex items-center justify-between w-full pb-4 border-b border-primary/10">
          <div className="flex items-center gap-x-2">
            <MobileScoresTable />
            <Button onClick={() => router.push(backPath)} size="icon" variant="ghost">
              <ChevronLeft className="w-8 h-8" />
            </Button>
            <Logo />
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
