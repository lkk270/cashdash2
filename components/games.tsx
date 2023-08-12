'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Game } from '@prisma/client';
import { Play } from 'lucide-react';

import { Card, CardFooter, CardHeader } from '@/components/ui/card';

interface GamesProps {
  data: Game[];
}

export const Games = ({ data }: GamesProps) => {
  return (
    <div className="grid justify-center grid-cols-1 gap-2 px-10 pb-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((item) => (
        <Card
          key={item.name}
          className="transition border-0 cursor-pointer bg-primary/10 rounded-xl hover:opacity-75"
        >
          <Link href={`/game/${item.id}`}>
            <CardHeader className="flex items-center justify-center text-center text-muted-foreground">
              <div className="relative w-48 h-48">
                <Image
                  src={item.imageSrc}
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
  );
};
