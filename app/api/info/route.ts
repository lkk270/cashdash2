import { auth, currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { stripe } from '@/lib/stripe';
import { PayoutStatus, Notification } from '@prisma/client';

import { getUserStripeAccount } from '@/lib/stripeAccount';
import { ModifiedPaymentType2 } from '@/app/types';

const acceptedTypesObj: { [key: string]: number } = { gusa: 1, guph: 3, ns: 4 };

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
        skip: body.numOfLoadedEntries,
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
      let unreadNotifications: Notification[] = [];
      // Fetch the most recent unread notifications if there are unread notifications left
      if (body.numOfRemainingUnreadNotifications > 0) {
        unreadNotifications = await prismadb.notification.findMany({
          where: {
            userId: userId,
            read: false,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
      }
      let readNotifications: Notification[] = [];
      const unreadNotificationsLength = unreadNotifications.length;
      // If we have fewer than 5 unread notifications, fetch the remaining from the read ones
      if (unreadNotificationsLength < 5) {
        readNotifications = await prismadb.notification.findMany({
          where: {
            userId: userId,
            read: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip: body.numOfLoadedEntries + unreadNotificationsLength,
          take: unreadNotificationsLength === 0 ? 5 : 5 - unreadNotificationsLength,
        });
      }

      // Combine both lists
      const notifications = [...unreadNotifications, ...readNotifications];

      // Extract the IDs of the retrieved notifications
      const unreadNotificationsIds = unreadNotifications.map((notification) => notification.id);

      // Update the 'read' field of the retrieved notifications to true
      await prismadb.notification.updateMany({
        where: {
          id: {
            in: unreadNotificationsIds,
          },
        },
        data: {
          read: true,
        },
      });

      if (body.needCount) {
        const totalNumOfNotifications = await prismadb.notification.count({
          where: {
            userId: userId,
          },
        });
        return new NextResponse(
          JSON.stringify({
            notifications: notifications,
            totalNumOfNotifications: totalNumOfNotifications,
          })
        );
      }
      return new NextResponse(
        JSON.stringify({
          notifications: notifications,
        })
      );
    }
  } catch (error: any) {
    console.log(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
