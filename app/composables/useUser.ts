export const useUser = () => {
  return useState<any>('user', () => null)
}
