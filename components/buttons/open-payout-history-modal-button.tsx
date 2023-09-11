'use client';

import { Button } from '@/components/ui/button';
import { usePayoutHistoryModal } from '@/hooks/use-payout-history-modal';

export const OpenPayoutHistoryModal = () => {
  const payoutHistoryModal = usePayoutHistoryModal();

  return (
    <Button
      onClick={() => payoutHistoryModal.onOpen()}
      variant="default"
      size="sm"
      className="hidden xs:flex"
    >
      Payout History
    </Button>
  );
};
