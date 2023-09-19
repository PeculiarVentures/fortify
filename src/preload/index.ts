import { contextBridge, ipcRenderer } from 'electron';
import { version } from '../../package.json';
import type {
  IElectronAPI,
  ThemeChangeListenerType,
  TelemetryStatusChangeListenerType,
  LoggingStatusChangeListenerType,
  IdentitiesChangeListenerType,
  UpdateAvailableListenerType,
  UpdateNotAvailableListenerType,
  UpdateErrorListenerType,
  UpdateCheckingListenerType,
  WindowParamsChangeListenerType,
  LanguageChangeListenerType,
} from '../renderer/renderer';

contextBridge.exposeInMainWorld('electronAPI', {
  version,
  // Language.
  getLanguage: () => ipcRenderer.sendSync('ipc-language-get'),
  updateLanguage: (lang: string) => ipcRenderer.send('ipc-language-set', lang),
  onLanguageChange: (listener: LanguageChangeListenerType) => ipcRenderer.on('ipc-language-changed', listener),
  // Logging.
  openLoggingFile: () => ipcRenderer.send('ipc-logging-open'),
  toggleLoggingStatus: () => ipcRenderer.send('ipc-logging-status-change'),
  getLoggingStatus: () => ipcRenderer.sendSync('ipc-logging-status-get'),
  onLoggingStatusChange: (listener: LoggingStatusChangeListenerType) => ipcRenderer.on('ipc-logging-status-changed', listener),
  // Telementry.
  getTelemetryStatus: () => ipcRenderer.sendSync('ipc-telemetry-status-get'),
  toggleTelemetryStatus: () => ipcRenderer.send('ipc-telemetry-status-change'),
  onTelemetryStatusChange: (listener: TelemetryStatusChangeListenerType) => ipcRenderer.on('ipc-telemetry-status-changed', listener),
  // Theme.
  getTheme: () => ipcRenderer.sendSync('ipc-theme-get'),
  updateTheme: (theme: ThemeType) => ipcRenderer.send('ipc-theme-set', theme),
  onThemeChange: (listener: ThemeChangeListenerType) => ipcRenderer.on('ipc-theme-changed', listener),
  // Identities.
  removeIdentities: (origin: string) => ipcRenderer.send('ipc-2key-remove', origin),
  getIdentities: () => ipcRenderer.sendSync('ipc-2key-list-get'),
  onIdentitiesChange: (listener: IdentitiesChangeListenerType) => ipcRenderer.on('ipc-2key-changed', listener),
  // Updates.s
  checkUpdates: () => ipcRenderer.send('ipc-update-check'),
  onUpdateAvailable: (listener: UpdateAvailableListenerType) => ipcRenderer.on('ipc-update-available', listener),
  onUpdateNotAvailable: (listener: UpdateNotAvailableListenerType) => ipcRenderer.on('ipc-update-not-available', listener),
  onUpdateError: (listener: UpdateErrorListenerType) => ipcRenderer.on('ipc-update-error', listener),
  onUpdateChecking: (listener: UpdateCheckingListenerType) => ipcRenderer.on('ipc-checking-for-update', listener),
  // Window params.
  onWindowParamsChange: (listener: WindowParamsChangeListenerType) => ipcRenderer.on('window-params-changed', listener),
  closeWindow: () => ipcRenderer.sendSync('window-close'),
} as IElectronAPI);
