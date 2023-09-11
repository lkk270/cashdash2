'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  withBackButton?: boolean;
  title: string;
  subtitle: string;
  reasons?: string[];
}

export const EmptyState = ({ title, subtitle, reasons, withBackButton }: EmptyStateProps) => {
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
      <div className="max-w-lg mt-4 text-xl text-left">
        <p className="pb-3 font-bold">{subtitle}</p>
        <ol className="pl-3 text-sm list-decimal">
          {reasons &&
            reasons.map((reason) => (
              <li className="flex">
                <span className="w-5">{reasons.indexOf(reason) + 1}.</span>
                <span className="flex-1 pl-1">{reason}</span>
              </li>
            ))}
        </ol>
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
