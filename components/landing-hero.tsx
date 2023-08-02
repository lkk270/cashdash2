"use client";

import TypewriterComponent from "typewriter-effect";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

export const LandingHero = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="py-24 space-y-5 font-bold text-center text-white">
      <div className="space-y-5 text-4xl font-extrabold sm:text-5xl md:text-4xl lg:text-5xl">
        <h1>Want to play fun games & win cash risk free?</h1>
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          <TypewriterComponent
            options={{
              strings: [
                "Minesweeper",
                "Trivia",
                "Hang Man",
                "Snake",
                "& much more",
              ],
              autoStart: true,
              loop: true,
            }}
          />
        </div>
      </div>
      <div className="text-sm font-light md:text-xl text-zinc-400">
        <p>It's as simple as playing the games you already love</p>{" "}
        <p>while now also having a chance to win cash completely risk free.</p>
      </div>
      <div>
        <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
          <Button
            variant="premium"
            className="p-4 font-semibold rounded-full md:text-lg md:p-6"
          >
            Start playing today!
          </Button>
        </Link>
      </div>
      {/* <div className="text-xs font-normal text-zinc-400 md:text-sm">
        No credit card required.
      </div> */}
    </div>
  );
};
