import { redirect } from "next/navigation";
import { auth, redirectToSignIn } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { LobbyClient } from "./components/client";

interface LobbyIdPageProps {
  params: {
    gameId: string;
    lobbyId: string;
  };
}

const LobbyIdPage = async ({ params }: LobbyIdPageProps) => {
  const { userId } = auth();
  const gameId = params.gameId;

  if (!userId) {
    return redirectToSignIn;
  }

  const lobby = await prismadb.lobby.findUnique({
    where: {
      id: params.lobbyId,
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

  if (!lobby) {
    redirect(`/dashboard/${gameId}`);
  }

  return <LobbyClient lobby={lobby} />;
};

export default LobbyIdPage;
