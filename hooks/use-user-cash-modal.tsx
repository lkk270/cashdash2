import { create } from 'zustand';

interface useUserCashModalStore {
  isOpen: boolean;
  userCash: string;
  onOpen: (data: string) => void;
  onClose: () => void;
}

export const useUserCashModal = create<useUserCashModalStore>((set) => ({
  isOpen: false,
  userCash: '0.00',
  onOpen: (userCash) => set({ isOpen: true, userCash: userCash }),
  onClose: () => set({ isOpen: false }),
}));
