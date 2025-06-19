import { contextBridge } from 'electron'

// Expose any APIs to the renderer process here if needed
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any electron-specific APIs here
}) 