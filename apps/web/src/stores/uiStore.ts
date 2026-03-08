import { create } from 'zustand';

type ThemeMode = 'dark' | 'light' | 'system';

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarWidth: number;

  // Modals
  activeModal: string | null;
  modalData: Record<string, any>;

  // Theme
  theme: ThemeMode;

  // Inspector
  inspectorOpen: boolean;

  // Notifications
  toastQueue: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
  }>;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarWidth: (width: number) => void;
  openModal: (name: string, data?: Record<string, any>) => void;
  closeModal: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleInspector: () => void;
  addToast: (type: 'success' | 'error' | 'info' | 'warning', message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  sidebarWidth: 280,
  activeModal: null,
  modalData: {},
  theme: 'dark',
  inspectorOpen: true,
  toastQueue: [],

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
  openModal: (name, data = {}) => set({ activeModal: name, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: {} }),
  setTheme: (theme) => set({ theme }),
  toggleInspector: () => set((s) => ({ inspectorOpen: !s.inspectorOpen })),
  addToast: (type, message, duration = 5000) =>
    set((s) => ({
      toastQueue: [
        ...s.toastQueue,
        { id: `toast_${Date.now()}_${Math.random()}`, type, message, duration },
      ],
    })),
  removeToast: (id) =>
    set((s) => ({
      toastQueue: s.toastQueue.filter((t) => t.id !== id),
    })),
}));
