import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScoresTable } from '@/components/scores-table';
import { BarChart4 } from 'lucide-react';

import { Lobby, LobbySession, ScoreType } from '@prisma/client';
import { ModifiedScoreType } from '@/app/types';

interface MobileScoresTableProps {
  lobby: Lobby & {
    sessions: LobbySession[];
  };
  scoreType: ScoreType;
  scores: ModifiedScoreType[];
}

export const MobileScoresTable = ({ lobby, scoreType, scores }: MobileScoresTableProps) => {
  return (
    <Sheet>
      <SheetTrigger className="pr-4 xl:hidden">
        <BarChart4 />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 pt-10 bg-secondary">
        <ScoresTable scores={scores} scoreType={scoreType} showSessionTimer={true} lobby={lobby} />
      </SheetContent>
    </Sheet>
  );
};
