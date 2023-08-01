import { auth, redirectToSignIn } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";
import { GameClient } from "./components/client";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

interface GameIdPageProps {
  params: {
    gameId: string;
  };
}

const GameIdPage = async ({ params }: GameIdPageProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirectToSignIn;
  }

  const game = await prismadb.game.findUnique({
    where: {
      id: params.gameId,
    },
    include: {
      scores: {
        orderBy: {
          createdAt: "asc",
        },
        where: {
          userId,
        },
      },
      _count: {
        select: {
          scores: true,
        },
      },
    },
  });

  if (!game) {
    return redirect("/dashboard");
  }

  return (
    <div className="h-full">
      <Navbar />
      <div className="fixed inset-y-0 flex-col hidden w-20 mt-16 md:flex">
        <Sidebar />
      </div>
    </div>
  );

  // <GameClient game={game} />;
};

export default GameIdPage;
