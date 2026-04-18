export function useFormat() {
  function currency(n: number | undefined | null): string {
    if (n == null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  }

  function datetime(d: string | Date | undefined | null): string {
    if (!d) return '—';
    return new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(d));
  }

  function date(d: string | Date | undefined | null): string {
    if (!d) return '—';
    return new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'medium',
    }).format(new Date(d));
  }

  return { currency, datetime, date };
}
