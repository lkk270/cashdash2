import { auth, currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { generateChallengeHash, generateResponseHash } from '@/lib/hash';
import prismadb from '@/lib/prismadb';

const acceptedTypes = ['0', '2', '3'];

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const acceptedType = body.at;
    const validType = acceptedTypes.includes(acceptedType);
    const { userId } = auth();
    const user = await currentUser();
    if (!userId || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (body.length === 0 || body.length > 5 || !validType) {
      return new NextResponse('Invalid body', { status: 400 });
    }

    if (acceptedType === '0') {
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + 3599); // 59 minutes 59 seconds from now

      const gameSession = await prismadb.gameSession.create({
        data: {
          userId: userId,
          gameId: body.gameId,
          lobbySessionId: body.lobbySessionId,
          isValid: true,
          expiresAt: expiresAt,
        },
      });

      return new NextResponse(JSON.stringify({ gameSessionId: gameSession.id }));
    }
    // else if (acceptedType === '1') {
    //   console.log('IN TRIGGERED');
    //   await prismadb.gameSession.update({
    //     where: {
    //       id: body.gameSessionId,
    //       isValid: true,
    //       expiresAt: {
    //         gt: new Date(),
    //       },
    //     },
    //     data: { startedAt: Date.now() },
    //   });

    //   return new NextResponse('', { status: 200 });
    // }
    else if (acceptedType === '2') {
      const gameSession = await prismadb.gameSession.findFirst({
        where: {
          id: body.gameSessionId,
          isValid: true,
          expiresAt: {
            gt: new Date(),
          },
        },
      });
      if (!gameSession) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      const challengedHash = generateChallengeHash(gameSession.id, process.env.GAME_SESSION_SECRET);
      return new NextResponse(JSON.stringify({ hash: challengedHash }));
    } else if (acceptedType === '3') {
      const responseHashToCompare = generateResponseHash(body.cHash, body.score);
      if (responseHashToCompare !== body.rHash) {
        return new NextResponse('Unauthorized', { status: 401 });
      } else {
       
        return new NextResponse('YAYYY', { status: 200 });
      }
    }
  } catch (error: any) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
