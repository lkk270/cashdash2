import { auth, redirectToSignIn } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";
import { GameClient } from "./components/client";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Suspense } from "react";

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
      lobbies: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!game) {
    return redirect("/dashboard");
  }

  return <DashboardLayout children={<GameClient data={game.lobbies} />} />;
};

export default GameIdPage;
