import { create } from "zustand";

interface AnnouncementStore {
  visible: boolean;
  dismiss: () => void;
}

export const useAnnouncementStore = create<AnnouncementStore>((set) => ({
  visible: true,
  dismiss: () => set({ visible: false }),
}));
