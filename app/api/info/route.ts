import { auth, currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

import { getUserStripeAccount } from '@/lib/stripeAccount';
import { ModifiedPaymentType2 } from '@/app/types';

const acceptedTypesObj: { [key: string]: number } = { gusa: 1, guph: 3 };

export async function POST(req: Request) {
  const body = await req.json();
  const bodyLength = Object.keys(body).length;
  try {
    const receivedType: string = body.getFunc;
    const validType = acceptedTypesObj[receivedType];
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (
      bodyLength === 0 ||
      !receivedType ||
      !validType ||
      acceptedTypesObj[receivedType] != bodyLength
    ) {
      return new NextResponse('Invalid body', { status: 400 });
    }
    if (receivedType === 'gusa') {
      const userStripeAccount = await getUserStripeAccount(userId);
      return new NextResponse(JSON.stringify({ userStripeAccount: !!userStripeAccount }));
    }
    if (receivedType === 'guph') {
      let totalNumOfPayouts;
      const userPayouts: ModifiedPaymentType2[] = await prismadb.userPayout.findMany({
        where: {
          userId: userId,
        },
        select: {
          id: true,
          createdAt: true,
          amount: true,
          status: true,
        },
        orderBy: {
          createdAt: 'desc', // Order by createdAt in descending order to get the most recent
        },
        take: 1, // Take only 5 entries
        skip: body.loadedEntries,
      });
      if (body.needCount) {
        totalNumOfPayouts = await prismadb.userPayout.count({
          where: {
            userId: userId,
          },
        });
      }

      return new NextResponse(
        JSON.stringify({ userPayouts: userPayouts, totalNumOfPayouts: totalNumOfPayouts })
      );
    }
  } catch (error: any) {
    console.log(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
