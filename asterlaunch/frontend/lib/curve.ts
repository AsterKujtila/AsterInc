// Client-side mirror of bonding curve math for quick quotes
export function priceAt(base: number, slope: number, sold: number): number {
  return base + slope * sold
}

export function costForBuy(base: number, slope: number, sold: number, n: number): number {
  const nBig = n
  const series = nBig * (2 * sold + nBig - 1)
  const kTerm = slope * (series / 2)
  return nBig * base + kTerm
}

export function refundForSell(base: number, slope: number, sold: number, n: number): number {
  if (n > sold) return 0
  const s1 = sold - 1
  const series = n * (2 * s1 - (n - 1))
  const kTerm = slope * (series / 2)
  return n * base + kTerm
}
