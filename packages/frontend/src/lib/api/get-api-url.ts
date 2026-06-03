export function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";
  return url.replace(/\/$/, "");
}
