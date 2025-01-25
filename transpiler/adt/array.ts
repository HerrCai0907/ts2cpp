export function zip<T, E>(arr1: ReadonlyArray<T>, arr2: ReadonlyArray<E>): Array<[T, E]> {
  return Array.from(Array(Math.max(arr1.length, arr2.length)), (_, i) => [arr1[i], arr2[i]]);
}
