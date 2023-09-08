'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

export const LobbyHeader = () => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between w-full pb-4">
      <div className="items-center hidden sm:flex gap-x-2">
        <Button onClick={() => router.push('/dashboard')} size="icon" variant="ghost">
          <ChevronLeft className="w-8 h-8" />
        </Button>
      </div>

      <div className="text-sm text-center text-primary/50">
        <h1 className="items-center text-4xl font-bold">Choose a Tier</h1>
        <div className="max-w-lg mt-4 text-left">
          <p>
            To maintain an even playing field, better players are restricted to more advanced tiers.
            We use a combination of your average score & individual scores to determine tier
            eligibility. Additionally, only one tier can be played in at a time
          </p>
        </div>
        <p className="flex justify-center mt-2 font-bold gap-x-1">
          {/* Click <Info /> for more details & prize info */}
          Click <Info size={18} strokeWidth={3} /> for prize info
        </p>
      </div>
      <div className="flex items-center gap-x-2">{/* <Button>TIME LEFT</Button> */}</div>
    </div>
  );
};
