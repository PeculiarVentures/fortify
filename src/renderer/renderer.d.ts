import type { IpcRendererEvent } from 'electron';
import { ISO_LANGS } from '../renderer/conts';

export type LanguageChangeListenerType = (event: IpcRendererEvent) => void;
export type ThemeChangeListenerType = (event: IpcRendererEvent, theme: ThemeType) => void;
export type TelemetryStatusChangeListenerType = (event: IpcRendererEvent, status: boolean) => void;
export type LoggingStatusChangeListenerType = (event: IpcRendererEvent, status: boolean) => void;
export type IdentitiesChangeListenerType = (event: IpcRendererEvent) => void;
export type UpdateAvailableListenerType = (event: IpcRendererEvent, info: UpdateInfoType) => void;
export type UpdateNotAvailableListenerType = (event: IpcRendererEvent) => void;
export type UpdateErrorListenerType = (event: IpcRendererEvent) => void;
export type UpdateCheckingListenerType = (event: IpcRendererEvent) => void;
export type WindowParamsChangeListenerType = (
  event: IpcRendererEvent,
  params: Record<string, any>,
) => void;

export interface IElectronAPI {
  version: string;
  // Language.
  getLanguage: () => {
    lang: string;
    data: Assoc<string>;
    list: (keyof typeof ISO_LANGS)[];
  };
  updateLanguage: (lang: string) => void;
  onLanguageChange: (listener: LanguageChangeListenerType) => void;
  // Logging.
  openLoggingFile: () => void;
  toggleLoggingStatus: () => void;
  getLoggingStatus: () => boolean;
  onLoggingStatusChange: (listener: LoggingStatusChangeListenerType) => void;
  // Telementry.
  toggleTelemetryStatus: () => void;
  getTelemetryStatus: () => boolean;
  onTelemetryStatusChange: (listener: TelemetryStatusChangeListenerType) => void;
  // Theme.
  getTheme: () => ThemeType;
  updateTheme: (theme: ThemeType) => void;
  onThemeChange: (listener: ThemeChangeListenerType) => void;
  // Identities.
  removeIdentities: (origin: string) => void;
  getIdentities: () => IKey[];
  onIdentitiesChange: (listener: IdentitiesChangeListenerType) => void;
  // Updates.
  checkUpdates: () => void;
  onUpdateAvailable: (listener: UpdateAvailableListenerType) => void;
  onUpdateNotAvailable: (listener: UpdateNotAvailableListenerType) => void;
  onUpdateError: (listener: UpdateErrorListenerType) => void;
  onUpdateChecking: (listener: UpdateCheckingListenerType) => void;
  // Window params.
  onWindowParamsChange: (listener: WindowParamsChangeListenerType) => void;
  closeWindow: () => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
