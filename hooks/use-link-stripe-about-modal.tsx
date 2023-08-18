import { create } from 'zustand';

interface useLinkStripeAboutModalStore {
  isOpen: boolean;
  data?: any;
  onOpen: (data: any) => void;
  onClose: () => void;
}

export const useLinkStripeAboutModal = create<useLinkStripeAboutModalStore>((set) => ({
  isOpen: false,
  data: {},
  onOpen: (data) => set({ isOpen: true, data: data }),
  onClose: () => set({ isOpen: false }),
}));
