import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // console.log(event.type);

  const session = event.data.object as Stripe.Checkout.Session;
  if (event.type === 'checkout.session.completed') {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    if (!session?.metadata?.userId) {
      return new NextResponse('User id is required', { status: 400 });
    }

    await prismadb.userStripeSubscription.create({
      data: {
        userId: session?.metadata?.userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  }

  if (event.type === 'invoice.payment_succeeded') {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    await prismadb.userStripeSubscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  }

  if (event.type === 'account.updated') {
    let account = event.data.object as Stripe.Account;
    const externalAccounts = await stripe.accounts.listExternalAccounts(account.id, {
      object: 'bank_account',
      limit: 1,
    });
    const externalAccountId =
      externalAccounts.data.length > 0 ? externalAccounts.data[0].id : undefined;
    console.log(externalAccounts);
    console.log(externalAccountId);
    const userId = session?.metadata?.userId;
    if (!userId) {
      return new NextResponse('User id is required', { status: 400 });
    }

    const userStripeAccount = await prismadb.userStripeAccount.findUnique({
      where: {
        userId: userId,
      },
    });
    if (!userStripeAccount && externalAccountId) {
      await prismadb.userStripeAccount.create({
        data: {
          userId: userId,
          stripeAccountId: account.id,
          stripeBankAccountId: externalAccountId,
        },
      });
    }

    return new NextResponse(null, { status: 200 });
  }
}
