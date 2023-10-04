import { create } from 'zustand';

interface useWelcomeMessagesModalStore {
  isOpen: boolean;
  onOpen: () => void; // adjust the type if you used a more specific type above
  onClose: () => void;
}

export const useWelcomeMessagesModal = create<useWelcomeMessagesModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
