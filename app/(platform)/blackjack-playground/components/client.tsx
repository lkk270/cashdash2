'use client';

import { useState } from 'react';

import { GameNavbarPlayground } from '@/components/headers/game-navbar-playground';
import { Blackjack } from '@/components/blackjack/blackjack-playground';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { Sidebar } from '@/components/headers/sidebar';

export const LobbyClient = () => {
  const [showInfo, setShowInfo] = useState(true);

  return (
    <div className="flex flex-col h-screen">
      <GameNavbarPlayground gameName={'Blackjack Playground'} />

      <div className="flex flex-grow">
        {/* Sidebar on the left */}
        <div className="hidden w-20 mt-16 md:flex">
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-grow">
          <div className="h-full p-2 space-y-2">
            <div className="flex justify-center h-full">
              <Blackjack />
            </div>
          </div>
        </main>

        {/* Info div on the right */}
        <div
          className={`hidden pr-3 fixed inset-y-0 right-0 flex-col xxl:${
            showInfo ? 'flex' : 'hidden'
          } pt-2 mt-20 w-72`}
        >
          <div className="text-left text-md text-primary/50">
            <p className="justify-center mt-2 font-bold gap-x-1">
              <Info className="w-5 h-5 mb-3" /> If you've run out of your balance and still would
              like to play blackjack, you can do so here. However, since playing here doesn't count
              for anything, your balance will not be saved and once a new blackjack session starts,
              you will want to play there instead.
            </p>
            <Button className="mt-2" onClick={() => setShowInfo(false)}>
              Hide
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
