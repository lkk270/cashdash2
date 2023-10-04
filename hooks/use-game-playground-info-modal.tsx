import { create } from 'zustand';

interface useGamePlaygroundInfoModalStore {
  isOpen: boolean;
  onOpen: () => void; // adjust the type if you used a more specific type above
  onClose: () => void;
}

export const useGamePlaygroundInfoModal = create<useGamePlaygroundInfoModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
