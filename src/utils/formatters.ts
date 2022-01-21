namespace Formatter {
  export function getFloatTrimmed(val: string | number, decimals: number) {
    return Number(Number(val).toFixed(decimals))
  }
}

export default Formatter
