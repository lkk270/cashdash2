'use client';

import axios from 'axios';

import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';

import { Button } from './ui/button';
import { Bell, Dot } from 'lucide-react';
import { Notification } from '@prisma/client';
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { NotificationsSkeleton } from '@/components/skeletons/notifications-skeleton';

type NotificationProps = {
  numOfUnreadNotificationsParam?: number;
};

export const Notifications = ({ numOfUnreadNotificationsParam }: NotificationProps) => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [numOfUnreadNotifications, setNumOfUnreadNotifications] = useState(
    numOfUnreadNotificationsParam
  );
  const { toast } = useToast();

  const onBellClick = () => {
    if (!dataFetched) {
      setLoading(true);
      // Call the necessary API endpoint to get userCash and userStripeAccount here
      axios
        .post('/api/info', { getFunc: 'ns', loadedEntries: 0, needCount: true })
        .then((response) => {
          setNotifications(response.data.notifications);
          setDataFetched(true); // Set dataFetched to true after fetching
          setNumOfUnreadNotifications(Math.max(0, (numOfUnreadNotifications || 0) - 5));
        })
        .catch((error) => {
          toast({
            description: error.response ? error.response.data : 'Network Error',
            variant: 'destructive',
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };
  if (!numOfUnreadNotifications) {
    return <div></div>;
  }
  return (
    <DropdownMenu onOpenChange={onBellClick}>
      <DropdownMenuTrigger asChild>
        <Button className="px-0 py-0" variant="ghost">
          <div className="relative">
            <Bell />
            {numOfUnreadNotifications > 0 && (
              <Badge className="absolute bottom-0 justify-center w-6 h-6 text-white bg-red-500 mb-[12px] left-100">
                {numOfUnreadNotifications > 9 ? '9+' : numOfUnreadNotifications.toString()}
              </Badge>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-96">
        <DropdownMenuGroup>
          {loading ? (
            <NotificationsSkeleton />
          ) : (
            notifications.map((item) => {
              return (
                <div>
                  <DropdownMenuItem>
                    {!item.read && <Dot size={40} strokeWidth={3} className="text-sky-500" />}
                    {item.read && <Dot size={40} strokeWidth={3} className="text-transparent" />}
                    <span>{item.text}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>
              );
            })
          )}
        </DropdownMenuGroup>
        {!loading && <DropdownMenuLabel>Panel Position</DropdownMenuLabel>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
