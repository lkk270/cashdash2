import { create } from 'zustand';

interface useLinkStripeAboutModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useLinkStripeAboutModal = create<useLinkStripeAboutModalStore>((set) => ({
  isOpen: false,
  data: {},
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
