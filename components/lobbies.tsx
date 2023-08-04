"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Lobby, GameAverageScore } from "@prisma/client";
import { Play } from "lucide-react";

import { Card, CardFooter, CardHeader } from "@/components/ui/card";

interface LobbiesProps {
  data: {
    lobbies: Lobby[];
    averageScores: GameAverageScore[];
  };
}

export const Lobbies = ({ data }: LobbiesProps) => {
  const pathname = usePathname();
  const averageScore = (data.averageScores.length > 0 ? data.averageScores[0] : null);
  return (
    <div className="flex justify-center">
      <div className="grid justify-center grid-cols-1 gap-2 px-10 pb-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {data.lobbies.map((item) => (
          <Card
            key={item.name}
            className="max-w-lg transition border-0 cursor-pointer bg-primary/10 rounded-xl hover:opacity-75"
          >
            <Link href={`${pathname}/${item.id}`}>
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
                <Play className="w-3 h-3 mr-1" />
                {item._count.scores}
              </div> */}
              </CardFooter>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};
