import { defineStore } from 'pinia';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

let nextId = 0;

export const useToastsStore = defineStore('toasts', {
  state: () => ({
    items: [] as Toast[],
  }),

  actions: {
    add(type: Toast['type'], message: string, duration = 4000) {
      const id = ++nextId;
      this.items.push({ id, type, message });
      setTimeout(() => this.dismiss(id), duration);
    },

    success(message: string) {
      this.add('success', message);
    },

    error(message: string) {
      this.add('error', message, 6000);
    },

    info(message: string) {
      this.add('info', message);
    },

    dismiss(id: number) {
      this.items = this.items.filter((t) => t.id !== id);
    },
  },
});
