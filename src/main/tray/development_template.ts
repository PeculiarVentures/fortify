import { MenuItemConstructorOptions } from 'electron';
import { l10n } from '../l10n';
import { windowsController } from '../windows';

export const developmentTemplate = (): MenuItemConstructorOptions[] => ([
  {
    type: 'separator',
  },
  {
    label: 'Develop',
    submenu: [
      {
        label: 'Token new',
        click: () => {
          windowsController.showTokenWindow();
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Error SSL install',
        click: () => {
          windowsController.showErrorWindow(
            {
              text: l10n.get('error.ssl.install'),
            },
          );
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Question 2key remove',
        click: () => {
          windowsController.showQuestionWindow(
            {
              text: l10n.get('question.2key.remove', 'TEST'),
              id: 'question.2key.remove',
              result: 0,
            },
          );
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Warning SSL install',
        click: () => {
          windowsController.showWarningWindow(
            {
              text: l10n.get('warn.ssl.install'),
              buttonRejectLabel: 'i_understand',
              id: 'ssl.install',
            },
          );
        },
      },
      {
        label: 'Warning cannot start',
        click: () => {
          windowsController.showWarningWindow(
            {
              text: l10n.get('warn.pcsc.cannot_start'),
              title: 'warning.title.oh_no',
              buttonRejectLabel: 'i_understand',
              id: 'warn.pcsc.cannot_start',
              showAgain: true,
              showAgainValue: false,
            },
          );
        },
      },
      {
        label: 'Warning crypto not found',
        click: () => {
          windowsController.showWarningWindow(
            {
              text: l10n.get('warn.token.crypto_not_found', 'TEST'),
              title: 'warning.title.oh_no',
              buttonRejectLabel: 'close',
              id: 'warn.token.crypto_not_found',
              showAgain: true,
              showAgainValue: false,
            },
          );
        },
      },
      {
        label: 'Warning crypto wrong',
        click: () => {
          windowsController.showWarningWindow(
            {
              text: l10n.get('warn.token.crypto_wrong', 'TEST'),
              title: 'warning.title.oh_no',
              buttonRejectLabel: 'close',
              id: 'warn.token.crypto_wrong',
              showAgain: true,
              showAgainValue: false,
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
          windowsController.showKeyPinWindow(
            {
              pin: '123456',
              origin: 'https://TEST.com/',
              accept: true,
            },
          );
        },
      },
      {
        label: 'P11 PIN',
        click: () => {
          windowsController.showP11PinWindow(
            {
              pin: '',
              origin: 'https://TEST.com/',
            },
          );
        },
      },
    ],
  },
]);
