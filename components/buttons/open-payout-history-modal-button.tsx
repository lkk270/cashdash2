'use client';

import { Button } from '@/components/ui/button';
import { usePayoutHistoryModal } from '@/hooks/use-payout-history-modal';

export const OpenPayoutHistoryModal = () => {
  const payoutHistoryModal = usePayoutHistoryModal();

  return (
    <Button
      className="mb-3"
      onClick={() => payoutHistoryModal.onOpen()}
      variant="default"
      size="sm"
    >
      Payout History
    </Button>
  );
};
