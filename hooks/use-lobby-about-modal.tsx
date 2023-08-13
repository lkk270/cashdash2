import { create } from 'zustand';
import { Game, Lobby } from '@prisma/client';

interface useLobbyAboutModalStore {
  isOpen: boolean;
  data: {
    lobby: Lobby;
    gameName: string;
  } | null;
  onOpen: (data: any) => void; // adjust the type if you used a more specific type above
  onClose: () => void;
}

export const useLobbyAboutModal = create<useLobbyAboutModalStore>((set) => ({
  isOpen: false,
  data: null,
  onOpen: (data) => set({ isOpen: true, data: data }),
  onClose: () => set({ isOpen: false, data: null }),
}));
