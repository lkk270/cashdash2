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
      <SheetTrigger className="xl:hidden">
        <BarChart4 />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 pt-10 w-72 bg-secondary">
        <ScoresTable scores={scores} scoreType={scoreType} showSessionTimer={true} lobby={lobby} />
      </SheetContent>
    </Sheet>
  );
};
