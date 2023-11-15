import type { Metadata } from 'next';
import Head from 'next/head';
import { Inter } from 'next/font/google';
import { dark, neobrutalism } from '@clerk/themes';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/toaster';

import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ProModal } from '@/components/modals/pro-modal';
import { LobbyAboutModal } from '@/components/modals/lobby-about-modal';
import { UserCashModal } from '@/components/modals/user-cash-modal';
import { LinkStripeAboutModal } from '@/components/modals/link-stripe-about-modal';
import { UserPayoutHistoryModal } from '@/components/modals/payout-history-modal';
import { GamePlaygroundInfoModal } from '@/components/modals/game-playground-info-modal';
import { WelcomeMessagesModal } from '@/components/modals/welcome-messages-modal';
import { UserCashProvider } from '@/components/providers/user-cash-provider';
import { IsProProvider } from '@/components/providers/is-pro-provider';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CashDash',
  description:
    'IMAGINE A PLACE... where you can play games and make money by achieving high scores. A place that makes playing games a lot more fun and worth your time!',
  appleWebApp: false,
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        layout: {
          termsPageUrl: 'https://clerk.com/terms',
        },
      }}
    >
      <Head>
        <title>{metadata.title as string}</title>
        <meta name="description" content={metadata.description as string} />
        <meta name="robots" content="all" />
        <meta name="googlebot" content="all" />
        <meta
          name="google-site-verification"
          content="c1R3I5EHZrUwOwR6ECJkSTAF_6lc0mKYORwqkGad0iQ"
        />
        <meta name="monetag" content="816ed538b1021c1e81c0a381a39c7f2f" />
      </Head>
      <html lang="en" suppressHydrationWarning>
        <body className={cn('bg-secondary', inter.className)}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <LobbyAboutModal />
            <LinkStripeAboutModal />
            <UserPayoutHistoryModal />
            <GamePlaygroundInfoModal />
            <WelcomeMessagesModal />
            {/* <UserCashProvider initialCash={'$0.00'}> */}
            {/* <UserCashModal /> */}
            {/* <IsProProvider initialIsPro={true}> */}
            {/* <ProModal /> */}
            {children}
            <Toaster />
            {/* </IsProProvider> */}
            {/* </UserCashProvider> */}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
