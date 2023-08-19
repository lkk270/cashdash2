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
      const account = await stripe.accounts.create({
        country: 'US',
        type: 'express',
        capabilities: {
          card_payments: {
            requested: true,
          },
          transfers: {
            requested: true,
          },
        },
        business_type: 'individual',
      });
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: settingsUrl,
        return_url: settingsUrl,
        type: 'account_onboarding',
      });
      return new NextResponse(JSON.stringify({ url: accountLink.url }));

      // const accountLink = await stripe.accountLinks.create({
      //   account: 'acct_1NeIh3HqGVW0nQyi', // Your platform's Stripe ID
      //   refresh_url: settingsUrl, // URL to redirect if the user's link has expired or they need to reauthenticate
      //   return_url: settingsUrl, // URL to redirect after they complete the onboarding
      //   type: 'account_onboarding',
      // });

      // Redirect the user to the account link for Stripe onboarding
      // return new NextResponse(JSON.stringify({ url: accountLink.url }));

      // return new NextResponse(
      //   'No bank or debit card associated with your account! Click the "Manage Bank Details" button to connect your bank/debit card before you cashing out!',
      //   { status: 400 }
      // );
    }

    // Check if the user has enough funds.
    const userCash = await prismadb.userCash.findUnique({ where: { userId } });

    if (!userCash || userCash.cash < withdrawalAmount) {
      return new NextResponse('Insufficient funds', { status: 400 });
    }
    if (withdrawalAmount > MAX_WITHDRAWAL) {
      return new NextResponse('Can only withdraw $500 at a time', { status: 400 });
    }

    if (!userStripeAccount || !userStripeAccount.stripeAccountId) {
      return new NextResponse(
        'No bank or debit card associated with your account! Click the "Manage Bank Details" button to connect your bank/debit card before you cashing out!',
        { status: 400 }
      );
    }

    // Initiate the Stripe Payout.
    const payout = await stripe.payouts.create({
      amount: Math.round(withdrawalAmount * 100), // Convert to cents.
      currency: 'usd',
      destination: userStripeAccount.stripeAccountId,
      metadata: {
        userId: userId,
        note: 'User withdrawal',
      },
    });

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
