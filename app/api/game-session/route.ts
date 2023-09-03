import { auth, currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { generateChallengeHash, generateResponseHash } from '@/lib/hash';
import prismadb from '@/lib/prismadb';

const acceptedTypesObj: { [key: string]: number } = { '0': 3, '2': 2, '3': 5 };

export async function POST(req: Request) {
  const body = await req.json();
  const bodyLength = Object.keys(body).length;

  try {
    const receivedType: string = body.at;
    const validType = acceptedTypesObj[receivedType];
    const { userId } = auth();
    const user = await currentUser();
    if (!userId || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (
      bodyLength === 0 ||
      bodyLength > 5 ||
      !validType ||
      acceptedTypesObj[receivedType] != bodyLength
    ) {
      return new NextResponse('Invalid body', { status: 400 });
    }

    if (receivedType === '0' && bodyLength === 3) {
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
    else if (receivedType === '2' || receivedType === '3') {
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
      if (receivedType === '2' && bodyLength === 2) {
        const challengedHash = generateChallengeHash(
          gameSession.id,
          process.env.GAME_SESSION_SECRET
        );
        return new NextResponse(JSON.stringify({ hash: challengedHash }));
      } else if (receivedType === '3' && bodyLength === 6) {
        const responseHashToCompare = generateResponseHash(body.cHash, body.score);
        if (responseHashToCompare !== body.rHash) {
          return new NextResponse('Unauthorized', { status: 401 });
        } else {
          await prismadb.score.create({
            data: {
              userId: userId,
              lobbySessionId: gameSession.lobbySessionId,
              score: body.score,
            },
          });
          return new NextResponse('YAYYY', { status: 200 });
        }
      }
    }
  } catch (error: any) {
    console.log('error');
    return new NextResponse('Internal Error', { status: 500 });
  }
}
