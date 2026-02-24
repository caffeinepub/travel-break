export function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1000000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1000000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: bigint | number): string {
  const num = typeof amount === 'bigint' ? Number(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(num);
}

export function dateToNanoseconds(date: Date): bigint {
  return BigInt(date.getTime()) * BigInt(1000000);
}

export function nanosecondsToDate(ns: bigint): Date {
  return new Date(Number(ns) / 1000000);
}
