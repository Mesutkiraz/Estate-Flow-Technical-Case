import { useToastsStore } from '~/stores/toasts';

export function useApi() {
  const config = useRuntimeConfig();
  const base = config.public.apiBase as string;

  async function api<T = any>(
    path: string,
    opts: Parameters<typeof $fetch>[1] = {},
  ): Promise<T> {
    try {
      return await $fetch<T>(`${base}${path}`, {
        ...opts,
        headers: {
          'Content-Type': 'application/json',
          ...(opts.headers || {}),
        },
      });
    } catch (err: any) {
      const message =
        err?.data?.message ||
        err?.statusMessage ||
        err?.message ||
        'An unexpected error occurred';

      const toasts = useToastsStore();
      toasts.error(typeof message === 'string' ? message : JSON.stringify(message));

      throw err;
    }
  }

  return { api };
}
