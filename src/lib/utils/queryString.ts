export function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      usp.append(key, String(value));
    }
  });
  return usp.toString();
} 