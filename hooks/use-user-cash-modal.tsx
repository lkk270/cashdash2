import { create } from 'zustand';
import { UserStripeAccount } from '@prisma/client';

interface useUserCashModalStore {
  isOpen: boolean;
  // valueChanged: boolean;
  userCashString: string;
  setUserCashString?: (cashString: string) => void; // No function body here
  onOpen: (userCashString: string, setUserCashStringFunc: (cashString: string) => void) => void;
  onClose: () => void;
}

export const useUserCashModal = create<useUserCashModalStore>((set) => ({
  isOpen: false,
  // valueChanged: false,
  userCashString: '$0.00',
  setUserCashString: (userCashString: string) => {
    set({ userCashString: userCashString });
    // set({ userCashString: userCashString, valueChanged: true });
  },
  onOpen: (userCashString, setUserCashStringFunc) => {
    set({ isOpen: true, userCashString: userCashString, setUserCashString: setUserCashStringFunc });
  },
  onClose: () => set({ isOpen: false }),
  // onClose: () => set({ isOpen: false, valueChanged: false }),
}));
