import { auth, currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import { getUserStripeAccount } from '@/lib/stripeAccount';

export async function POST(req: Request) {
  const body = await req.json();
  const { getFunc } = body;
  const bodyLength = Object.keys(body).length;
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (bodyLength !== 1 || !getFunc) {
      return new NextResponse('Invalid body', { status: 400 });
    }
    if (getFunc === 'gusa') {
      const userStripeAccount = await getUserStripeAccount(userId);
      return new NextResponse(JSON.stringify({ userStripeAccount: userStripeAccount }));
    }
  } catch (error: any) {
    console.log(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
