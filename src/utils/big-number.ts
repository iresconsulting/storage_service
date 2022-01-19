import BigNumber from "bignumber.js"

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_FLOOR })

export function bigNumber(amount: string | number, decimals: number) {
  if (isNaN(Number(amount))) {
    throw new Error('not a number')
  }

  return Number(new BigNumber(Number(amount)).decimalPlaces(decimals).valueOf())
}
