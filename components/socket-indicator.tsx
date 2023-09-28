'use client';

import { useSocket } from '@/components/providers/socket-provider';
import { Badge } from '@/components/ui/badge';

export const SocketIndicator = () => {
  const { isConnected } = useSocket();

  if (!isConnected) {
    return <Badge variant="outline" className="h-3 text-white bg-yellow-600 border-none"></Badge>;
  }

  return <Badge variant="outline" className="h-3 text-white border-none bg-emerald-600"></Badge>;
};
