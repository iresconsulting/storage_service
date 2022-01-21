export function nTrimmed(val: string | number, decimals: number) {
  return Number(Number(val).toFixed(decimals))
}
