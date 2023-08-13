'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

export const LobbyHeader = () => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between w-full px-10 pb-4">
      <div className="items-center hidden sm:flex gap-x-2">
        <Button onClick={() => router.push('/dashboard')} size="icon" variant="ghost">
          <ChevronLeft className="w-8 h-8" />
        </Button>
      </div>

      <div className="text-sm text-center text-zinc-400">
        <h1 className="items-center text-4xl font-bold">Choose a tier</h1>
        <p className="mt-4">
          To maintain an even playing field, better players are restricted to higher tiers
        </p>

        <p className="flex justify-center mt-1 gap-x-1">
          Click <Info /> for more details & prize info
        </p>
      </div>
      <div className="flex items-center gap-x-2">{/* <Button>TIME LEFT</Button> */}</div>
    </div>
  );
};
