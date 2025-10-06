export function formatAddress(address: string, prefix = 6, suffix = 4): string {
  if (!address || address.length < prefix + suffix) return address
  return `${address.slice(0, prefix)}...${address.slice(-suffix)}`
}
