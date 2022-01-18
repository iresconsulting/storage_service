
export enum OS {
  WINDOWS = 'WINDOWS',
  macOS = 'macOS',
  Linux = 'Linux',
  unknown = 'unknown'
}

export function getOs() {
  switch (process.platform) {
    case 'win32':
      return OS.WINDOWS
    case 'linux':
      return OS.Linux
    case 'darwin':
      return OS.macOS
    default:
      return OS.unknown
  }
}
