'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Game, Lobby, GameAverageScore, LobbySession } from '@prisma/client';
import { Info, Crown } from 'lucide-react';

import { useToast } from '@/components/ui/use-toast';
import { useLobbyAboutModal } from '@/hooks/use-lobby-about-modal';
import { Button } from '@/components/ui/button';
import { isValidLobbyAccess } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { CountdownTimer } from '@/components/countdown-timer';
// ce
interface LobbiesProps {
  data: Game & {
    lobbies: (Lobby & {
      sessions: (LobbySession & {
        gameSession: {
          id: string;
        }[];
      })[];
    })[];
    averageScores: GameAverageScore[];
  };
}

export const Lobbies = ({ data }: LobbiesProps) => {
  const lobbyAboutModal = useLobbyAboutModal();
  const pathname = usePathname();
  const { toast } = useToast();
  const averageScore = data.averageScores.length > 0 ? data.averageScores[0].averageScore : null;
  const scoreType = data.scoreType;
  // const beatTitle = scoreType === 'time' ? 'Time' : 'Score';

  return (
    <div className="flex justify-center">
      <div className="grid justify-center grid-cols-1 gap-2 pb-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {data.lobbies.map((item) => {
          if (!item.sessions[0]) {
            return <div></div>;
          }
          const userPlayedInSession = item.sessions[0].gameSession?.length > 0 ? true : false;
          let accessResult = isValidLobbyAccess({
            userPlayedInSession: userPlayedInSession,
            scoreType: scoreType,
            averageScore: averageScore,
            scoreRestriction: item.scoreRestriction,
            expiredDateTime: item.sessions[0].expiredDateTime,
            startDateTime: item.sessions[0].startDateTime,
          });
          let disableCard = !accessResult.isValid;
          const countdownData = {
            textSize: 'text-sm',
            expiredDateTime: item.sessions[0].expiredDateTime,
            startDateTime: item.sessions[0].startDateTime,
          };

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
                      onClick={(e) => {
                        if (disableCard) {
                          e.preventDefault();
                          toast({
                            title: 'Lobby restricted',
                            description: accessResult.message,
                            duration: 3000,
                          });
                        }
                      }}
                    >
                      <div className="relative flex items-center justify-center pt-4 text-primary/50">
                        <div className="absolute top-0 left-0 flex pt-3 pl-2 text-sm gap-x-1">
                          <Crown size={20} />${item.firstPlacePrize}
                        </div>
                        <Button
                          title="Details"
                          onClick={() =>
                            lobbyAboutModal.onOpen({ gameName: data.name, lobby: item })
                          }
                          size="icon"
                          variant="ghost"
                          className="absolute top-0 right-0"
                        >
                          <Info className="w-6 h-6" />
                        </Button>
                        <div className="mt-3">
                          <CountdownTimer data={countdownData} />
                        </div>
                      </div>

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
                          {/* <div className="flex items-center">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            Current best {beatTitle.toLowerCase()}:{' '}
                            {convertMillisecondsToMinSec(item.scoreRestriction)}
                          </div> */}
                          <div>$ Top {item.numRewards} scores</div>
                        </CardFooter>
                      </Link>
                      {/* <Button>Score</Button> */}
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs break-words">
                    <p>{disableCard ? accessResult.message : item.name}</p>
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
