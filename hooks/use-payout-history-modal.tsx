import { create } from 'zustand';

interface usePayoutHistoryModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const usePayoutHistoryModal = create<usePayoutHistoryModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
