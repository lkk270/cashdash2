'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Game, Lobby, GameAverageScore } from '@prisma/client';
import { ArrowUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { isValidLobbyAccess } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';

interface LobbiesProps {
  data: Game & {
    lobbies: Lobby[];
    averageScores: GameAverageScore[];
  };
}
export const Lobbies = ({ data }: LobbiesProps) => {
  const pathname = usePathname();
  const averageScore = data.averageScores.length > 0 ? data.averageScores[0].averageScore : null;
  const scoreType = data.scoreType;
  const beatTitle = scoreType === 'time' ? 'Time' : 'Score';

  return (
    <div className="flex justify-center">
      <div className="grid justify-center grid-cols-1 gap-2 px-10 pb-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
        {data.lobbies.map((item) => {
          let disableCard = !isValidLobbyAccess({
            scoreType: scoreType,
            averageScore: averageScore,
            scoreRestriction: item.scoreRestriction,
          });

          return (
            <React.Fragment key={item.name}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card
                      key={item.name}
                      className={`max-w-lg transition border-0 bg-primary/10 rounded-xl ${
                        disableCard ? 'opacity-40' : 'hover:opacity-75 cursor-pointer'
                      }`}
                    >
                      <Link
                        href={disableCard ? pathname : `${pathname}/${item.id}`}
                        onClick={disableCard ? (event) => event.preventDefault() : undefined}
                        className={`${disableCard ? 'cursor-not-allowed' : ''}`}
                      >
                        <CardHeader className="flex items-center justify-center text-center text-muted-foreground">
                          <div className="relative w-48 h-48">
                            <Image
                              src={`/images/${item.name.toLowerCase()}.png`}
                              fill
                              className="object-cover rounded-xl"
                              alt="Character"
                            />
                          </div>
                          <p className="font-bold">{item.name}</p>
                          <p className="text-xs text-left">{item.description}</p>
                        </CardHeader>
                        <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            {beatTitle} to beat:
                            {item.scoreRestriction}
                          </div>
                        </CardFooter>
                      </Link>
                      {/* <Button>Score</Button> */}
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {disableCard ? "You're too good of a player for this tier 👾" : item.name}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
