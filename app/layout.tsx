import type { Metadata } from 'next';
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

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cash Dash',
  description: 'Cash Dash - Have fun, make cash',
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
      <html lang="en" suppressHydrationWarning>
        <body className={cn('bg-secondary', inter.className)}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <LobbyAboutModal />
            <UserCashModal />
            <LinkStripeAboutModal />
            <ProModal />
            <UserPayoutHistoryModal />
            <GamePlaygroundInfoModal />
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
