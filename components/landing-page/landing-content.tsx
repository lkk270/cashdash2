'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const howItWorks = [
  {
    name: 'Games',
    bg: 'bg-gradient-to-r from-indigo-800 to-violet-700',
    description:
      'At the moment, we feature games like "Flappy Birb", "Blackjack", and three variations of "Minesweeper". Stay tuned as we are excited to expand our game selection soon!',
  },
  {
    name: 'Tiers',
    bg: 'bg-gradient-to-r from-violet-600 to-blue-700',
    description:
      'To ensure a fair competition, each game provides a minimum of three difficulty tiers.',
  },
  {
    name: 'Sessions',
    bg: 'bg-gradient-to-r from-blue-600 to-emerald-500',
    description:
      'Each gaming session corresponds to a specific tier and has a duration of up to three days. Once a session concludes, we declare the winners and kick off a new session.',
  },
  {
    name: 'Win',
    bg: 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-600',
    description:
      "The best part! Achieve one of the top scores in a session and you'll earn cash rewards! Cashing out is a breeze - simply link your bank account via Stripe to withdraw your earnings.",
  },
];

export const LandingContent = () => {
  return (
    <div className="px-10 pb-10">
      <h2 className="mb-10 text-4xl font-extrabold text-center text-white lg:mr-[500px] xl:mr-0">
        How it works
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {howItWorks.map((item) => (
          <Card key={item.description} className={`text-white border-none ${item.bg}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-x-2">
                <div>
                  <p className="text-lg">{item.name}</p>
                  {/* <p className="text-sm text-zinc-400">{item.title}</p> */}
                </div>
              </CardTitle>
              <CardContent className="px-0 pt-4">{item.description}</CardContent>
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="pt-10 text-xs text-center text-primary/20">cashdash © 2023</div>
    </div>
  );
};
