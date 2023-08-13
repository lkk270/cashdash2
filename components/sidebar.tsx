'use client';

import { Home, Plus, Settings, Scale, HelpCircle, CreditCard, ShoppingCart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Logo from '@/components/logo';
import { usePathname, useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
// import { useProModal } from "@/hooks/use-pro-modal";

interface SidebarProps {
  isPro?: boolean;
}

export const Sidebar = ({ isPro }: SidebarProps) => {
  // const proModal = useProModal();
  const router = useRouter();
  const pathname = usePathname();

  const onNavigate = (url: string, pro: boolean) => {
    // if (pro && !isPro) {
    //   return proModal.onOpen();
    // }
    return router.push(url);
  };

  const routes = [
    {
      icon: Home,
      href: '/dashboard',
      label: 'Home',
      pro: false,
    },
    {
      icon: ShoppingCart,
      href: '/store',
      label: 'Store',
      pro: false,
    },
    {
      icon: Plus,
      href: '/companion/new',
      label: 'Create',
      pro: true,
    },
    {
      icon: CreditCard,
      href: '/settings',
      label: 'Money',
      pro: false,
    },
    {
      icon: Scale,
      href: '/legal',
      label: 'Legal',
      pro: false,
    },
    {
      icon: HelpCircle,
      href: '/about',
      label: 'About',
      pro: false,
    },
  ];

  return (
    <div className="flex flex-col h-full space-y-4 overflow-y-scroll text-primary bg-secondary">
      <div className="px-3 sm:hidden">
        <Logo />
      </div>
      <div className="flex justify-center flex-1 p-3">
        <div className="space-y-2">
          {routes.map((route, index) => (
            <div key={route.href}>
              <div
                onClick={() => onNavigate(route.href, route.pro)}
                className={cn(
                  'text-muted-foreground text-xs group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition',
                  pathname === route.href && 'bg-primary/10 text-primary'
                )}
              >
                <div className="flex flex-col items-center flex-1 gap-y-2">
                  <route.icon className="w-5 h-5" />
                  {route.label}
                </div>
              </div>
              {(index === 2 || index === 5) && <Separator className="bg-primary/10" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
