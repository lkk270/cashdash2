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
    if (userStripeAccount && userStripeAccount.stripeAccountId) {
      const account = await stripe.accounts.update(userStripeAccount.stripeAccountId);
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: settingsUrl,
        return_url: settingsUrl,
        type: 'account_onboarding',
      });
      return new NextResponse(JSON.stringify({ url: accountLink.url }));
    }
    const account = await stripe.accounts.create({
      email: user.emailAddresses[0].emailAddress,
      country: 'US',
      type: 'standard',

      individual: {
        email: user.emailAddresses[0].emailAddress,
      },
      business_type: 'individual',
      metadata: {
        userId,
      },
    });
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: settingsUrl,
      return_url: settingsUrl,
      type: 'account_onboarding',
    });

    return new NextResponse(JSON.stringify({ url: accountLink.url }));
  } catch (error) {
    console.log('[STRIPE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
