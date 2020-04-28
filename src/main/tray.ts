import {
  app,
  Menu,
  MenuItem,
  shell,
  Tray,
} from 'electron';

import * as application from './application';
import { LoggingSwitch } from './application';
import { ConfigureWrite } from './config';
import { APP_CONFIG_FILE, APP_LOG_FILE, icons } from './const';
import { Locale, locale, intl } from './locale';
import { CreateAboutWindow, CreateKeysWindow } from './windows';

let tray: Electron.Tray;

export function create() {
  tray = new Tray(icons.tray);

  const contextMenu = new Menu();

  const menuAbout = new MenuItem({
    label: intl('about'),
  });
  menuAbout.click = () => {
    CreateAboutWindow();
  };

  const menuKeys = new MenuItem({
    label: intl('sites'),
  });
  menuKeys.click = () => {
    CreateKeysWindow();
  };

  const menuLogSubMenu = new Menu();
  const menuLogView = new MenuItem({
    label: intl('view.log'),
    enabled: !!application.configure.logging,
  });
  menuLogView.click = () => {
    shell.openItem(APP_LOG_FILE);
  };
  const menuLogDisable = new MenuItem({
    label: intl('enable.disable'),
    type: 'checkbox',
    checked: !!application.configure.logging,
  });

  menuLogDisable.click = () => {
    application.configure.logging = !application.configure.logging;
    menuLogDisable.checked = application.configure.logging;
    menuLogView.enabled = application.configure.logging;
    ConfigureWrite(APP_CONFIG_FILE, application.configure);
    LoggingSwitch(application.configure.logging);
  };
  menuLogSubMenu.append(menuLogView);
  menuLogSubMenu.append(menuLogDisable);
  const menuLog = new MenuItem({
    label: intl('logging'),
    submenu: menuLogSubMenu,
  });

  const menuTools = new MenuItem({
    label: intl('tools'),
  });
  menuTools.click = () => {
    shell.openExternal('https://tools.fortifyapp.com/');
  };

  const menuSeparator = new MenuItem({
    type: 'separator',
  });

  const menuExit = new MenuItem({
    label: intl('exit'),
  });

  menuExit.click = () => {
    app.exit(0);
  };

  const menuLanguageSubmenu = new Menu();
  Locale.getLangList().forEach((lang) => {
    const menuItem = new MenuItem({
      label: lang,
      type: 'checkbox',
      checked: lang === locale.lang,
      click: () => {
        locale.setLang(lang);
        reset();
      },
    });
    menuLanguageSubmenu.append(menuItem);
  });
  const menuLanguage = new MenuItem({
    label: intl('language'),
    submenu: menuLanguageSubmenu,
  });
  locale.on('change', () => {
    menuLanguage.label = intl('language');
  });

  contextMenu.append(menuAbout);
  contextMenu.append(menuKeys);
  contextMenu.append(menuLog);
  contextMenu.append(menuLanguage);
  contextMenu.append(menuTools);
  contextMenu.append(menuSeparator);
  contextMenu.append(menuExit);

  tray.setToolTip('Fortify');
  tray.setContextMenu(contextMenu);
}

function reset() {
  tray.destroy();
  create();
}
