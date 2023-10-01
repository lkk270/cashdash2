'use client';

import { GameNavbarPlayground } from '@/components/headers/game-navbar-playground';
import { Blackjack } from '@/components/blackjack/blackjack-playground';
import { Sidebar } from '@/components/headers/sidebar';
import { useGamePlaygroundInfoModal } from '@/hooks/use-game-playground-info-modal';
import { useEffect } from 'react';

export const LobbyClient = () => {
  const infoModal = useGamePlaygroundInfoModal();
  useEffect(() => {
    infoModal.onOpen();
  }, []);
  return (
    <div className="flex flex-col h-screen">
      <GameNavbarPlayground gameName={'Blackjack Playground'} />

      <div className="flex flex-grow">
        {/* Sidebar on the left */}
        <div className="hidden w-20 mt-16 lg:flex">
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-grow">
          <div className="h-full">
            <div className="flex justify-center h-full lg:mr-20">
              <Blackjack />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
