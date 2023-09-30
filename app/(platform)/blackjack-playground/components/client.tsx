'use client';

import { GameNavbarPlayground } from '@/components/headers/game-navbar-playground';
import { Blackjack } from '@/components/blackjack/blackjack-playground';
import { Info } from 'lucide-react';

export const LobbyClient = () => {
  return (
    // <TimerProvider>
    <div className="flex flex-col">
      <GameNavbarPlayground gameName={'Blackjack Playground'} />
      <div className="fixed inset-y-0 flex-col hidden pt-2 mt-20 ml-5 w-72 xl:flex">
        <div className="text-left text-md text-primary/50">
          <p className="justify-center mt-2 font-bold gap-x-1">
            <Info className="w-5 h-5 mb-3" /> If you've run out of your balance and still would like
            to play blackjack, you can do so here. Playing here doesn't count for anything, so once
            a new blackjack session starts, you will want to play there.Please note, your balance
            will not be saved
          </p>
        </div>
      </div>
      <main className="flex-grow">
        <div className="h-full p-2 space-y-2 ">
          <div className="flex justify-center h-full">
            <Blackjack />
          </div>
        </div>
      </main>
    </div>
  );
};
