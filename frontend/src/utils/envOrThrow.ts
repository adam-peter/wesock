export function envOrThrow(key: string): string {
  const value = import.meta.env[key];
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
}