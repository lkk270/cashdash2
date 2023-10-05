'use client';

import axios from 'axios';

import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';

import { Button } from './ui/button';
import { Bell, Dot } from 'lucide-react';
import { Notification } from '@prisma/client';
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuContent,
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalNumOfNotifications, setTotalNumOfNotifications] = useState(0);
  const [numOfLoadedEntries, setNumOfLoadedEntries] = useState(0);

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
        .post('/api/info', {
          getFunc: 'ns',
          numOfLoadedEntries: 0,
          needCount: true,
          numOfRemainingUnreadNotifications: numOfUnreadNotifications,
        })
        .then((response) => {
          setNotifications(response.data.notifications);
          setTotalNumOfNotifications(response.data.totalNumOfNotifications);
          setNumOfLoadedEntries(response.data.notifications.length);
          setDataFetched(true); // Set dataFetched to true after fetching
          setNumOfUnreadNotifications(0);
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

  const onLoadMore = () => {
    setLoadingMore(true);
    axios
      .post('/api/info', {
        getFunc: 'ns',
        numOfLoadedEntries: numOfLoadedEntries,
        needCount: false,
        numOfRemainingUnreadNotifications: numOfUnreadNotifications,
      })
      .then((response) => {
        const newNotifications = notifications.concat(response.data.notifications);
        setNotifications(newNotifications);
        setNumOfLoadedEntries(newNotifications.length);
      })
      .catch((error) => {
        toast({
          description: error.response ? error.response.data : 'Network Error',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setLoadingMore(false);
      });
  };
  if (typeof numOfUnreadNotifications !== 'number') {
    return <div></div>;
  }
  return (
    <DropdownMenu onOpenChange={onBellClick}>
      <DropdownMenuTrigger asChild>
        <Button className="px-0 py-0" variant="ghost2">
          <div className="relative">
            <Bell />
            {numOfUnreadNotifications > 0 && (
              <Badge className="absolute bottom-0 justify-center w-6 h-6 text-white bg-red-500 mb-[10px] left-100">
                {numOfUnreadNotifications > 9 ? '9+' : numOfUnreadNotifications.toString()}
              </Badge>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="overflow-y-scroll w-96 max-h-[550px]">
        <DropdownMenuGroup>
          {loading ? (
            <NotificationsSkeleton />
          ) : (
            notifications.map((item, index) => {
              return (
                <div key={index}>
                  <DropdownMenuItem className="flex flex-col items-start">
                    <span className="flex items-center mb-1 text-primary/40">
                      {new Date(item.createdAt).toLocaleString().split(',')[0]}
                      {!item.read && (
                        <Dot size={10} strokeWidth={24} className="ml-2 text-sky-500" />
                      )}
                    </span>
                    <span className="text-primary/80">{item.text}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>
              );
            })
          )}
        </DropdownMenuGroup>
        {!loading && notifications.length < totalNumOfNotifications && (
          <div className="flex items-center justify-between py-4 space-x-2">
            <div className="text-sm text-muted-foreground">
              Showing {notifications.length.toString()}/{totalNumOfNotifications.toString()} rows
            </div>
            <Button disabled={loadingMore} variant="outline" size="sm" onClick={onLoadMore}>
              {loadingMore ? 'Loading more...' : 'Load more'}
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
