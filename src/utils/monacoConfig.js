// Monaco Editor configuration to handle tracking prevention warnings
// These warnings occur because Monaco Editor workers try to access storage
// from CDN context, which browsers block for security reasons.
// These warnings are harmless and don't affect Monaco Editor functionality.

/**
 * Suppresses tracking prevention warnings from Monaco Editor
 * These warnings are expected when using Monaco Editor from CDN
 * and don't affect the editor's functionality
 */
export function suppressMonacoStorageWarnings() {
  if (typeof window === 'undefined') return

  // Store original console methods
  const originalError = console.error
  const originalWarn = console.warn

  // Filter out tracking prevention warnings related to Monaco Editor
  const filterMonacoWarnings = (args, originalMethod) => {
    const message = args.join(' ')
    
    // Check if this is a Monaco Editor tracking prevention warning
    const isMonacoTrackingWarning = 
      (message.includes('Tracking Prevention blocked') ||
       message.includes('tracking prevention')) &&
      (message.includes('monaco-editor') ||
       message.includes('jsdelivr') ||
       message.includes('cdn.jsdelivr.net'))

    // Suppress Monaco tracking prevention warnings only
    if (isMonacoTrackingWarning) {
      // Optionally, you can log a single message explaining this is expected
      // console.info('Monaco Editor: Tracking prevention warnings are expected and harmless when using CDN')
      return
    }

    // Pass through all other messages
    originalMethod.apply(console, args)
  }

  // Override console.error
  console.error = (...args) => {
    filterMonacoWarnings(args, originalError)
  }

  // Override console.warn (some browsers use warn instead of error)
  console.warn = (...args) => {
    filterMonacoWarnings(args, originalWarn)
  }

  // Return cleanup function
  return () => {
    console.error = originalError
    console.warn = originalWarn
  }
}

