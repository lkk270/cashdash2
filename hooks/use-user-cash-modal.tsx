import { create } from 'zustand';
import { UserStripeAccount } from '@prisma/client';

interface useUserCashModalStore {
  isOpen: boolean;
  userCash: string;
  onOpen: (userCash: string) => void;
  onClose: () => void;
}

export const useUserCashModal = create<useUserCashModalStore>((set) => ({
  isOpen: false,
  userCash: '0.00',
  userStripeAccount: undefined,
  onOpen: (userCash) => set({ isOpen: true, userCash: userCash }),
  onClose: () => set({ isOpen: false }),
}));
