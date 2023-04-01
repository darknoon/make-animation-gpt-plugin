export function getPlaygroundZipKey(name: string, requestId: string): string {
  return `playgrounds/${name}-${requestId}.swiftpm.zip`
}

export function getPlaygroundFileKey(
  name: string,
  requestId: string,
  key: string,
): string {
  return `playgrounds/${name}-${requestId}/${key}`
}
