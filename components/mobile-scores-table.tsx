import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScoresTable } from '@/components/scores-table';
import { BarChart4 } from 'lucide-react';

export function MobileScoresTable() {
  return (
    <Sheet>
      <SheetTrigger className="pr-4 xl:hidden">
        <BarChart4 />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 pt-10 bg-secondary">
        <ScoresTable />
      </SheetContent>
    </Sheet>
  );
}
