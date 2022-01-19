export function ensureParamsValid(params: any[]): boolean {
  const arr = params.filter((p: any) => {
    if (typeof p === 'string') {
      return p === undefined || p === null || p.includes('<script>') || p.includes('</script>')
    } else if (p instanceof Array) {
      p.forEach((item: any) => {
        if (typeof item === 'string' && (item.includes('<script>') || item.includes('</script>'))) {
          throw new Error('params invalid')
        }
      })
    }
    return p === undefined || p === null
  })
  if (arr.length !== 0) {
    throw new Error('params invalid')
  }
  return arr.length === 0
}

export function ensureIsPositiveInteger(params: number[]): boolean {
  const arr = params.filter((p: any) => {
    return parseInt(p.toString()) !== p || p <= 0
  })
  if (arr.length !== 0) {
    throw new Error('input error: is not positive int')
  }
  return arr.length === 0
}
