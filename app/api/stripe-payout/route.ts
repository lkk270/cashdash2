import { auth, currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';
import { stripe } from '@/lib/stripe';
import { absoluteUrl } from '@/lib/utils';

const settingsUrl = absoluteUrl('/money-settings');

const MAX_WITHDRAWAL = 500;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const bodyLength = Object.keys(body).length;
    const { withdrawalAmount } = body;
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if the user has a Stripe account associated.
    const userStripeAccount = await prismadb.userStripeAccount.findUnique({
      where: {
        userId,
      },
    });

    if (!userStripeAccount || !userStripeAccount.stripeAccountId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (bodyLength !== 1 || !withdrawalAmount) {
      return new NextResponse('Invalid body', { status: 401 });
    }

    // Check if the user has enough funds.
    const userCash = await prismadb.userCash.findUnique({ where: { userId } });
    if (!userCash || userCash.cash < withdrawalAmount) {
      return new NextResponse('Insufficient funds', { status: 400 });
    }
    if (withdrawalAmount > MAX_WITHDRAWAL) {
      return new NextResponse('Can only withdraw $500 at a time', { status: 400 });
    }

    if (
      !userStripeAccount ||
      !userStripeAccount.stripeAccountId ||
      !userStripeAccount.stripeBankAccountId
    ) {
      return new NextResponse(
        'No bank or debit card associated with your account! Click the "Manage Bank Details" button to connect your bank/debit card before you cashing out!',
        { status: 400 }
      );
    }

    const transfer = await stripe.transfers.create({
      amount: Math.round(1 * 100), // Convert to cents.
      currency: 'usd',
      destination: userStripeAccount.stripeAccountId, // The ID of the connected Stripe account.
      metadata: {
        userId: userId,
        note: 'Transfer for user withdrawal',
      },
    });
    // Initiate the Stripe Payout.

    const payout = await stripe.payouts.create(
      {
        amount: Math.round(1 * 100), // Convert to cents.
        currency: 'usd',
        destination: userStripeAccount.stripeBankAccountId, // The ID for the bank account or card.
        metadata: {
          userId: userId,
          note: 'User withdrawal',
        },
      },
      {
        stripeAccount: userStripeAccount.stripeAccountId,
      }
    );
    // The Stripe account ID

    // Double-check the user's balance before deduction.
    const latestUserCash = await prismadb.userCash.findUnique({ where: { userId } });
    if (!latestUserCash || latestUserCash.cash < withdrawalAmount) {
      return new NextResponse('Insufficient funds or balance changed', { status: 400 });
    }

    // If balance check passes, proceed with deduction and other operations
    await prismadb.$transaction([
      // Update the UserPayout table.
      prismadb.userPayout.create({
        data: {
          userId: userId,
          amount: withdrawalAmount,
          status: 'PENDING',
          stripePayoutId: payout.id,
          stripeAccountId: userStripeAccount.stripeAccountId,
        },
      }),
      // Deduct the amount from the UserCash balance.
      prismadb.userCash.update({
        where: { userId },
        data: {
          cash: latestUserCash.cash - withdrawalAmount,
        },
      }),
    ]);

    return new NextResponse(JSON.stringify({ status: 'Withdrawal initiated successfully' }));
  } catch (error) {
    console.log('[STRIPE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
