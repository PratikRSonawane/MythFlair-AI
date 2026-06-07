export function getPollinationsAppKey(): string {
  const appKey =
    process.env.pollination_key ??
    process.env.POLLINATION_KEY ??
    process.env.NEXT_PUBLIC_POLLINATIONS_APP_KEY ??
    "";

  return appKey.startsWith("pk_") ? appKey : "";
}
