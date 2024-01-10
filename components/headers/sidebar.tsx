'use client';

import { LineChart, MessageSquarePlus, HelpCircle, CreditCard, Gamepad2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Logo from '@/components/logo';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import Link from 'next/link';
// import { useProModal } from "@/hooks/use-pro-modal";

interface SidebarProps {
  isPro?: boolean;
}

export const Sidebar = ({ isPro }: SidebarProps) => {
  // const proModal = useProModal();
  // const router = useRouter();
  const pathname = usePathname();

  // const onNavigate = (url: string, pro: boolean) => {
  //   // if (pro && !isPro) {
  //   //   return proModal.onOpen();
  //   // }
  //   return router.push(url);
  // };

  const routes = [
    {
      icon: Gamepad2,
      href: '/dashboard',
      label: 'Home',
      pro: false,
    },
    // {
    //   icon: CreditCard,
    //   href: '/money-settings',
    //   label: 'Money',
    //   pro: false,
    // },
    {
      icon: LineChart,
      href: '/stats',
      label: 'Stats',
      pro: false,
    },
    {
      icon: MessageSquarePlus,
      href: '/feedback',
      label: 'Feedback',
      pro: false,
    },
    // {
    //   icon: HelpCircle,
    //   href: '/about',
    //   label: 'About',
    //   pro: false,
    // },
    // {
    //   icon: ShoppingCart,
    //   href: '/store',
    //   label: 'Store',
    //   pro: false,
    // },
  ];

  return (
    <div className="flex flex-col h-full space-y-4 overflow-y-scroll border-r border-primary/10 text-primary bg-secondary">
      <div className="px-3 md:hidden">
        <Logo />
      </div>
      <div className="flex justify-center flex-1 p-3">
        <div className="space-y-2">
          {routes.map((route, index) => (
            <Link key={route.href} href={route.href}>
              <div
                className={cn(
                  'text-muted-foreground text-xs group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition',
                  pathname === route.href && 'bg-primary/10 text-primary'
                )}
              >
                <div className="flex flex-col items-center justify-center flex-1 gap-y-2">
                  <route.icon className="w-5 h-5" />
                  {route.label}
                </div>
              </div>
              {(index === 2 || index === 5) && <Separator className="bg-primary/10" />}
            </Link>
          ))}
          <div className="text-xs text-center text-primary/10">cashdash © 2024</div>
        </div>
      </div>
    </div>
  );
};
