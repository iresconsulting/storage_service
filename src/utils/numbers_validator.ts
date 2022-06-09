namespace NumbersValidator {
  export function isPositiveInteger(val: string | number) {
    return !isNaN(Number(val)) && Number(val) > 0 && !val.toString().includes('.')
  }

  export function isNormal(val: string | number) {
    return !isNaN(Number(val)) && Number(val) > 0
  }

  export function isLessThan100(val: string | number) {
    return !isNaN(Number(val)) && Number(val) < 100
  }

  export function isNatural(val: string | number) {
    return !isNaN(Number(val)) && Number(val) >= 0
  }

  export function isNormalInteger(val: string | number) {
    return !isNaN(Number(val)) && Number(val) > 0 && !val.toString().includes('.')
  }
}

export default NumbersValidator
