import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  getPhotosDir: () => ipcRenderer.invoke('get-photos-dir'),
  getSessionsDir: () => ipcRenderer.invoke('get-sessions-dir'),
});
