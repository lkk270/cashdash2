'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Heading } from '@/components/heading';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  withBackButton?: boolean;
  title: string;
  subtitle: string;
}

export const EmptyState = ({ title, subtitle, withBackButton }: EmptyStateProps) => {
  const router = useRouter();
  return (
    <div
      className="
        flex 
        flex-col 
        gap-2 
        justify-center 
        items-center 
        mt-10
        px-32
        text-center 
        text-primary/50
      "
    >
      <h1 className="items-center text-4xl font-bold">{title}</h1>
      <div className="max-w-lg mt-4 text-left">
        <p>{subtitle}</p>
      </div>
      <div className="relative w-60 h-60">
        <Image draggable={false} height={600} width={600} src="/images/empty.png" alt="Empty" />
      </div>
      {withBackButton ? (
        <Button variant="default" size="lg" onClick={() => router.push('/dashboard')}>
          Go back to dashboard
        </Button>
      ) : null}
    </div>
  );
};
