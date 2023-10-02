'use client';

import axios from 'axios';

import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';

import { Button } from './ui/button';
import { Bell } from 'lucide-react';
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
import { NotificationsSkeleton } from '@/components/skeletons/notifications-skeleton';
import { set } from 'react-hook-form';

export const Notifications = () => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dataFetched, setDataFetched] = useState(false);
  const { toast } = useToast();

  const onBellClick = () => {
    if (!dataFetched) {
      console.log('HELLOW ');
      setLoading(true);
      // Call the necessary API endpoint to get userCash and userStripeAccount here
      axios
        .post('/api/info', { getFunc: 'ns', loadedEntries: 0, needCount: true })
        .then((response) => {
          setNotifications(response.data.notifications);
          setDataFetched(true); // Set dataFetched to true after fetching
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
  return (
    <DropdownMenu onOpenChange={onBellClick}>
      <DropdownMenuTrigger asChild>
        <Button className="px-0 py-0" variant="ghost">
          <Bell />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          {loading ? (
            <NotificationsSkeleton />
          ) : (
            notifications.map((item) => {
              return (
                <div>
                  <DropdownMenuItem>
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
