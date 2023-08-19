import { create } from 'zustand';
import { UserStripeAccount } from '@prisma/client';

interface useUserCashModalStore {
  isOpen: boolean;
  userCash: string;
  userStripeAccount?: UserStripeAccount;
  onOpen: (userCash: string, userStripeAccount?: UserStripeAccount) => void;
  onClose: () => void;
}

export const useUserCashModal = create<useUserCashModalStore>((set) => ({
  isOpen: false,
  userCash: '0.00',
  userStripeAccount: undefined,
  onOpen: (userCash, userStripeAccount) =>
    set({ isOpen: true, userCash: userCash, userStripeAccount: userStripeAccount }),
  onClose: () => set({ isOpen: false }),
}));
