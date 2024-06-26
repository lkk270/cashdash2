'use client';

import React, { useEffect, useState } from 'react';
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
import { CardSkeleton } from '@/components/skeletons/card-skeleton';
import { EmptyState } from '@/components/empty-state';

interface LobbiesProps {
  data: Game & {
    lobbies: (Lobby & {
      sessions: (LobbySession & {
        scores: {
          id: string;
        }[];
      })[];
    })[];
    averageScores: GameAverageScore[];
  };
}

type AccessResultsType = {
  [key: string]: ReturnType<typeof isValidLobbyAccess>;
};

export const Lobbies = ({ data }: LobbiesProps) => {
  const lobbyAboutModal = useLobbyAboutModal();
  const pathname = usePathname();
  const { toast } = useToast();
  const { weightedAverageScore, timesPlayed = 0 } = data.averageScores?.[0] ?? {};
  const scoreType = data.scoreType;
  const lobbyWithScores = data.lobbies.find(
    (lobby) =>
      lobby.sessions &&
      lobby.sessions.some((session) => session.scores && session.scores.length > 0)
  );

  const [accessResults, setAccessResults] = useState<AccessResultsType | null>(null);

  useEffect(() => {
    const results: AccessResultsType = {};

    data.lobbies.forEach((item) => {
      if (!item.sessions[0]) return;

      const userPlayedInSession = item.sessions[0].scores?.length > 0;

      results[item.id] = isValidLobbyAccess({
        lobbyId: item.id,
        lobbyWithScoresName: lobbyWithScores?.name,
        lobbyWithScoresId: lobbyWithScores?.id,
        userPlayedInSession: userPlayedInSession,
        scoreType: scoreType,
        weightedAverageScore: weightedAverageScore,
        timesPlayed: timesPlayed,
        numScoresToAccess: item.numScoresToAccess,
        scoreRestriction: item.scoreRestriction,
        expiredDateTime: item.sessions[0].expiredDateTime,
        startDateTime: item.sessions[0].startDateTime,
      });
    });

    setAccessResults(results);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.lobbies]);

  if (!accessResults) {
    return (
      <div className="flex justify-center">
        <div className="grid justify-center grid-cols-1 gap-2 pb-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="p-4 w-[300px] h-[425px] bg-primary/10 rounded-xl">
              <CardSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="grid justify-center grid-cols-1 gap-2 pb-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.lobbies.map((item, index) => {
          if (!item.sessions[0]) {
            return <EmptyState key={index} title="Uh Oh" subtitle="Something went wrong!" />;
          }
          const accessResult = accessResults[item.id];
          let disableCard = accessResult ? !accessResult.isValid : true;
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
                      className={`w-[295px] transition border-0 bg-primary/10 rounded-xl ${
                        disableCard ? 'opacity-40' : 'hover:opacity-75 cursor-pointer'
                      }`}
                      onClick={(e) => {
                        if (disableCard) {
                          e.preventDefault();
                          toast({
                            title: 'Lobby restricted',
                            description: 'Reasons:',
                            reasons: accessResult?.message.split('&'),
                            duration: 6000,
                          });
                        }
                      }}
                    >
                      <Link
                        href={
                          !pathname
                            ? '/dashboard'
                            : disableCard
                            ? pathname
                            : `${pathname}/${item.id}`
                        }
                        onClick={disableCard ? (event) => event.preventDefault() : undefined}
                        className={`${disableCard ? 'cursor-not-allowed' : ''}`}
                      >
                        <div className="relative flex items-center justify-center pt-4 text-primary/50">
                          <div className="absolute top-0 left-0 flex pt-3 pl-2 text-sm gap-x-1">
                            <Crown size={20} />${item.firstPlacePrize}
                          </div>
                          <Button
                            title="Details"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              lobbyAboutModal.onOpen({ gameName: data.name, lobby: item });
                            }}
                            size="icon"
                            variant="ghost"
                            className="absolute top-0 right-0"
                          >
                            <Info className="w-6 h-6" />
                          </Button>
                          <div className="mt-5">
                            <CountdownTimer data={countdownData} />
                          </div>
                        </div>

                        <CardHeader className="flex items-center justify-center text-center text-muted-foreground">
                          <div className="relative w-56 h-56">
                            <Image
                              src={`/images/${
                                item.name.toLowerCase().split(' or new player')[0]
                              }.png`}
                              fill
                              className="object-cover rounded-xl"
                              alt="Character"
                              draggable={false}
                            />
                          </div>
                          <p className="font-bold">{item.name}</p>
                          <p className="text-xs text-left">{item.description}</p>
                        </CardHeader>
                        <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                          <div>$ Top {item.numRewards} scores</div>
                        </CardFooter>
                      </Link>
                      {/* <Button>Score</Button> */}
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs break-words">
                    <p>{item.name}</p>
                    {/* <p>{disableCard ? accessResult.message.split('&')[0] : item.name}</p> */}
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
