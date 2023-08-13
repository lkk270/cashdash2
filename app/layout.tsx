import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { dark, neobrutalism } from '@clerk/themes';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/toaster';

import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { ProModal } from '@/components/pro-modal';
import { LobbyAboutModal } from '@/components/lobby-about-modal';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cash Dash',
  description: 'Cash Dash - Have fun, make cash',
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
            <ProModal />
            <LobbyAboutModal />
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
