export function* iterator(len: number) {
  let i = 0
  while (i < len) {
    yield i += 1
  }
}
