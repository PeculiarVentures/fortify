/* eslint-disable class-methods-use-this */
import * as React from 'react';
import type { IpcRendererEvent } from 'electron';
import WindowProvider from '../../components/window_provider';
import Container from './container';

interface IPreferencesState {
  activeTab: TabType;
  keys: {
    list: IKey[];
    isFetching: IsFetchingType;
  };
  logging: boolean;
  telemetry: boolean;
  theme: ThemeType;
  update: {
    isFetching: IsFetchingType;
    info?: UpdateInfoType;
  };
}

export class Preferences extends WindowProvider<{}, IPreferencesState> {
  version: string;

  constructor(props: {}) {
    super(props);

    this.state = {
      activeTab: this.params.defaultTab || 'settings',
      keys: {
        list: [],
        isFetching: 'pending',
      },
      logging: false,
      telemetry: false,
      theme: 'system',
      update: {
        isFetching: 'pending',
      },
    };

    this.version = window.electronAPI.version;
  }

  componentWillMount() {
    /**
     * Keys section.
     */
    this.keysListGet();
    window.electronAPI.onIdentitiesChange(this.keysListGet);

    /**
     * Logging section.
     */
    this.loggingGet();
    window.electronAPI.onLoggingStatusChange(this.onLoggingChangedListener);

    /**
     * Telemetry section.
     */
    this.telemetryGet();
    window.electronAPI.onTelemetryStatusChange(this.onTelemetryChangedListener);

    /**
     * Theme section.
     */
    this.themeGet();
    window.electronAPI.onThemeChange(this.onThemeChangedListener);

    /**
     * Update section.
     */
    window.electronAPI.checkUpdates();
    window.electronAPI.onUpdateChecking(this.onUpdateChekingListener);
    window.electronAPI.onUpdateAvailable(this.onUpdateAvailableListener);
    window.electronAPI.onUpdateNotAvailable(this.onUpdateNotAvailableListener);
    window.electronAPI.onUpdateError(this.onUpdateErrorListener);

    /**
     * Window section.
     */
    window.electronAPI.onWindowParamsChange(this.onWindowParamsChangeListener);
  }

  /**
   * Keys section.
   */
  private handleKeyRemove = (origin: string) => {
    window.electronAPI.removeIdentities(origin);
  };

  private keysListGet = () => {
    const list = window.electronAPI.getIdentities();

    this.setState({
      keys: {
        list,
        isFetching: 'resolved',
      },
    });
  };

  /**
   * Logging section.
   */
  private loggingGet() {
    const status = window.electronAPI.getLoggingStatus();

    this.setState({
      logging: status,
    });
  }

  private handleLoggingStatusChange = () => {
    window.electronAPI.toggleLoggingStatus();
  };

  private handleLoggingOpen = () => {
    window.electronAPI.openLoggingFile();
  };

  private onLoggingChangedListener = (_: IpcRendererEvent, status: boolean) => {
    this.setState({
      logging: status,
    });
  };

  /**
   * Language section.
   */
  private handleLanguageChange = (lang: string) => {
    window.electronAPI.updateLanguage(lang);
  };

  /**
   * Telemetry section.
   */
  private telemetryGet() {
    const status = window.electronAPI.getTelemetryStatus();

    this.setState({
      telemetry: status,
    });
  }

  private onTelemetryChangedListener = (_: IpcRendererEvent, status: boolean) => {
    this.setState({
      telemetry: status,
    });
  };

  private handleTelemetryStatusChange = () => {
    window.electronAPI.toggleTelemetryStatus();
  };

  /**
   * Theme section.
   */
  private themeGet() {
    const theme = window.electronAPI.getTheme();

    this.setState({
      theme,
    });
  }

  private onThemeChangedListener = (_: IpcRendererEvent, theme: ThemeType) => {
    this.setState({
      theme,
    });
  };

  private handleThemeChange = (theme: ThemeType) => {
    window.electronAPI.updateTheme(theme);
  };

  /**
   * Update section.
   */
  private onUpdateChekingListener = () => {
    this.setState({
      update: {
        isFetching: 'pending',
      },
    });
  };

  private onUpdateAvailableListener = (_: IpcRendererEvent, info: UpdateInfoType) => {
    this.setState({
      update: {
        isFetching: 'resolved',
        info,
      },
    });
  };

  private onUpdateNotAvailableListener = () => {
    this.setState({
      update: {
        isFetching: 'resolved',
      },
    });
  };

  private onUpdateErrorListener = () => {
    this.setState({
      update: {
        isFetching: 'rejected',
      },
    });
  };

  /**
   * UI section.
   */
  private handleChangeTab = (value: TabType) => {
    this.setState({
      activeTab: value,
    });
  };

  /**
   * Window section.
   */
  private onWindowParamsChangeListener = (_: IpcRendererEvent, params: Record<string, any>) => {
    const { defaultTab } = params;
    const { activeTab } = this.state;

    if (defaultTab !== activeTab) {
      this.handleChangeTab(defaultTab);
    }
  };

  renderChildrens() {
    const {
      activeTab,
      keys,
      logging,
      telemetry,
      theme,
      update,
    } = this.state;

    return (
      <Container
        logging={{
          onLoggingOpen: this.handleLoggingOpen,
          onLoggingStatusChange: this.handleLoggingStatusChange,
          status: logging,
        }}
        telemetry={{
          onTelemetryStatusChange: this.handleTelemetryStatusChange,
          status: telemetry,
        }}
        language={{
          onLanguageChange: this.handleLanguageChange,
        }}
        keys={{
          ...keys,
          onKeyRemove: this.handleKeyRemove,
        }}
        theme={{
          value: theme,
          onThemeChange: this.handleThemeChange,
        }}
        update={update}
        version={this.version}
        tab={{
          value: activeTab,
          onChange: this.handleChangeTab,
        }}
      />
    );
  }
}
