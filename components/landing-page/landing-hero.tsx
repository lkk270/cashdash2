'use client';

import Image from 'next/image';

import TypewriterComponent from 'typewriter-effect';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

import { Button } from '@/components/ui/button';

export const LandingHero = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="pt-12 pb-12 space-y-5 font-bold text-center text-white lg:pb-24 ">
      <div className="flex flex-col items-center space-y-5 text-4xl font-extrabold sm:text-5xl md:text-4xl lg:text-5xl">
        <h1>IMAGINE A PLACE...</h1>
        <div className="justify-center w-2/3 text-lg font-light text-center items-marker:center md:text-xl text-zinc-400">
          ...where you can play games and make money by achieving high scores. A place that makes
          playing games a lot more fun and worth your time!
        </div>
      </div>
      <div className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        <TypewriterComponent
          options={{
            strings: ['Play', 'Minesweeper', 'Blackjack', 'Flappy Birb', '& win big!'],
            autoStart: true,
            loop: true,
          }}
        />
      </div>
      <div className="flex items-center justify-center w-full">
        <Image
          draggable={false}
          height={500}
          width={500}
          alt="Left"
          src="/home/homeLeft.svg"
          className="z-20 hidden -mb-56 xl:block" // Adjust -mt-10 (negative margin-top) as required
        />
        <Link href={isSignedIn ? '/dashboard' : '/sign-up'}>
          <Button
            variant="premium"
            className="w-full p-6 font-semibold rounded-full md:text-lg md:p-6 xl:mt-20"
          >
            Start playing today!
          </Button>
        </Link>
        <Image
          draggable={false}
          height={500}
          width={500}
          alt="Right"
          src="/home/homeRight.svg"
          className="hidden -mb-48 lg:block lg:ml-[280px] xl:ml-0" // Adjust -mb-10 (negative margin-bottom) as required
        />
      </div>

      {/* <div className="text-xs font-normal text-zinc-400 md:text-sm">
        No credit card required.
      </div> */}
    </div>
  );
};
