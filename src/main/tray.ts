import {
  Menu,
  shell,
  Tray,
  MenuItemConstructorOptions,
} from 'electron';

import { icons } from './const';
import { intl } from './locale';
import {
  CreateErrorWindow,
  CreateQuestionWindow,
  CreateWarningWindow,
  CreateKeyPinWindow,
  CreateP11PinWindow,
  CreateAboutWindow,
  CreateSettingsWindow,
  CreateTokenWindow,
} from './windows';

let tray: Electron.Tray;

export function create() {
  if (!tray) {
    tray = new Tray(icons.tray);
  }

  const menuTemplate: MenuItemConstructorOptions[] = [
    {
      label: intl('about'),
      click: () => {
        CreateAboutWindow();
      },
    },
    {
      label: intl('settings'),
      click: () => {
        CreateSettingsWindow();
      },
    },
    {
      type: 'separator',
    },
    {
      label: intl('tools'),
      click: () => {
        shell.openExternal('https://tools.fortifyapp.com/');
      },
    },
    {
      label: intl('exit'),
      role: 'quit',
    },
  ];

  if (process.env.NODE_ENV === 'development') {
    menuTemplate.push(
      {
        type: 'separator',
      },
      {
        label: 'Develop',
        submenu: [
          {
            label: 'Token new',
            click: () => {
              CreateTokenWindow(
                intl('question.new.token'),
                { id: 'question.new.token', showAgain: true },
                () => {},
              );
            },
          },
          {
            type: 'separator',
          },
          {
            label: 'Error SSL install',
            click: () => {
              CreateErrorWindow(
                intl('error.ssl.install'),
                () => {},
              );
            },
          },
          {
            label: 'Error critical update',
            click: () => {
              CreateErrorWindow(
                intl('error.critical.update'),
                () => {},
              );
            },
          },
          {
            type: 'separator',
          },
          {
            label: 'Question 2key remove',
            click: () => {
              CreateQuestionWindow(
                intl('question.2key.remove', 'TEST'),
                {},
                () => {},
              );
            },
          },
          {
            label: 'Question update new',
            click: () => {
              CreateQuestionWindow(
                intl('question.update.new', 'test'),
                { id: 'question.update.new', showAgain: true },
                () => {},
              );
            },
          },
          {
            type: 'separator',
          },
          {
            label: 'Warning SSL install',
            click: () => {
              CreateWarningWindow(
                intl('warn.ssl.install'),
                {
                  alwaysOnTop: true,
                  buttonLabel: intl('i_understand'),
                },
                () => {},
              );
            },
          },
          {
            label: 'Warning cannot start',
            click: () => {
              CreateWarningWindow(
                intl('warn.pcsc.cannot_start'),
                {
                  alwaysOnTop: true,
                  title: intl('warning.title.oh_no'),
                  buttonLabel: intl('i_understand'),
                  id: 'warn.pcsc.cannot_start',
                  showAgain: true,
                },
                () => {},
              );
            },
          },
          {
            label: 'Warning crypto not found',
            click: () => {
              CreateWarningWindow(
                intl('warn.token.crypto_not_found', 'TEST'),
                {
                  alwaysOnTop: true,
                  title: intl('warning.title.oh_no'),
                  id: 'warn.token.crypto_not_found',
                  showAgain: true,
                },
              );
            },
          },
          {
            label: 'Warning crypto wrong',
            click: () => {
              CreateWarningWindow(
                intl('warn.token.crypto_wrong', 'TEST'),
                {
                  alwaysOnTop: true,
                  title: intl('warning.title.oh_no'),
                  id: 'warn.token.crypto_wrong',
                  showAgain: true,
                },
              );
            },
          },
          {
            type: 'separator',
          },
          {
            label: 'Key PIN',
            click: () => {
              CreateKeyPinWindow({
                width: 2000,
                height: 2000,
                p: {
                  pin: '123456',
                  origin: 'https://TEST.com/',
                },
              });
            },
          },
          {
            label: 'P11 PIN',
            click: () => {
              CreateP11PinWindow({
                p: {
                  origin: 'https://TEST.com/',
                },
              });
            },
          },
        ],
      },
    );
  }

  const menu = Menu.buildFromTemplate(menuTemplate);

  tray.setToolTip('Fortify');
  tray.setContextMenu(menu);
}
