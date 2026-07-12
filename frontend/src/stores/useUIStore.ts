import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  isDark: boolean;
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  toggleDark: () => void;
  toggleSidebar: () => void;
  setCommandOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isDark: false,
      sidebarCollapsed: false,
      commandOpen: false,
      toggleDark: () => set((s) => {
        const next = !s.isDark;
        document.documentElement.classList.toggle('dark', next);
        return { isDark: next };
      }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCommandOpen: (open) => set({ commandOpen: open }),
    }),
    {
      name: 'transitops-ui',
      partialize: (s) => ({ isDark: s.isDark }),
    }
  )
);
