import { auth, currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { stripe } from '@/lib/stripe';
import { PayoutStatus, Notification } from '@prisma/client';

import { getUserStripeAccount } from '@/lib/stripeAccount';
import { ModifiedPaymentType2 } from '@/app/types';

const acceptedTypesObj: { [key: string]: number } = { gusa: 1, guph: 3, ns: 3 };

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
          stripePayoutId: true,
          stripeAccountId: true,
        },
        orderBy: {
          createdAt: 'desc', // Order by createdAt in descending order to get the most recent
        },
        take: 5, // Take only 5 entries
        skip: body.loadedEntries,
      });
      if (body.needCount) {
        totalNumOfPayouts = await prismadb.userPayout.count({
          where: {
            userId: userId,
          },
        });
      }
      // Lists to track payouts that need updating
      const idsToUpdateCanceledOrFailed: string[] = [];
      const idsToUpdatePaid: string[] = [];

      for (const payoutObj of userPayouts) {
        if (
          payoutObj.stripePayoutId &&
          payoutObj.stripeAccountId &&
          payoutObj.status === PayoutStatus.PENDING
        ) {
          const payout = await stripe.payouts.retrieve(payoutObj.stripePayoutId, {
            stripeAccount: payoutObj.stripeAccountId,
          });
          const payoutStatus = payout.status;
          if (payoutStatus === 'canceled' || payoutStatus === 'failed') {
            idsToUpdateCanceledOrFailed.push(payoutObj.id);
            payoutObj.status = 'FAILED';
          } else if (payoutStatus === 'paid') {
            idsToUpdatePaid.push(payoutObj.id);
            payoutObj.status = 'COMPLETED';
          }
        }
      }

      // Now update the database in one batch for each status type
      if (idsToUpdateCanceledOrFailed.length > 0) {
        await prismadb.userPayout.updateMany({
          where: {
            id: {
              in: idsToUpdateCanceledOrFailed,
            },
          },
          data: {
            status: 'FAILED',
          },
        });
      }

      if (idsToUpdatePaid.length > 0) {
        await prismadb.userPayout.updateMany({
          where: {
            id: {
              in: idsToUpdatePaid,
            },
          },
          data: {
            status: 'COMPLETED',
          },
        });
      }

      const filteredUserPayouts = userPayouts.map((payout) => ({
        id: payout.id,
        createdAt: payout.createdAt,
        amount: payout.amount,
        status: payout.status,
      }));

      return new NextResponse(
        JSON.stringify({ userPayouts: filteredUserPayouts, totalNumOfPayouts: totalNumOfPayouts })
      );
    }

    if (receivedType === 'ns') {
      let totalNumOfNotifications;
      // Retrieve the notifications
      const notifications: Notification[] = await prismadb.notification.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          createdAt: 'desc', // Order by createdAt in descending order to get the most recent
        },
        take: 5, // Take only 5 entries
        skip: body.loadedEntries,
      });

      // Extract the IDs of the retrieved notifications
      const notificationIds = notifications.map((notification) => notification.id);

      // Update the 'read' field of the retrieved notifications to true
      // await prismadb.notification.updateMany({
      //   where: {
      //     id: {
      //       in: notificationIds,
      //     },
      //   },
      //   data: {
      //     read: true,
      //   },
      // });

      if (body.needCount) {
        totalNumOfNotifications = await prismadb.notification.count({
          where: {
            userId: userId,
          },
        });
      }

      return new NextResponse(
        JSON.stringify({
          notifications: notifications,
          totalNumOfNotifications: totalNumOfNotifications,
        })
      );
    }
  } catch (error: any) {
    console.log(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
