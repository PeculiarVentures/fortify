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
          windowsController.showTokenWindow(
            {
              type: 'token',
              text: l10n.get('question.new.token'),
              id: 'question.new.token',
              showAgain: true,
              showAgainValue: false,
              result: 0,
            },
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
          windowsController.showErrorWindow(
            {
              type: 'error',
              text: l10n.get('error.ssl.install'),
            },
            () => {},
          );
        },
      },
      {
        label: 'Error critical update',
        click: () => {
          windowsController.showErrorWindow(
            {
              type: 'error',
              text: l10n.get('error.critical.update'),
            },
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
          windowsController.showQuestionWindow(
            {
              type: 'question',
              text: l10n.get('question.2key.remove', 'TEST'),
              id: 'question.2key.remove',
              result: 0,
            },
            () => {},
          );
        },
      },
      {
        label: 'Question update new',
        click: () => {
          windowsController.showQuestionWindow(
            {
              type: 'question',
              text: l10n.get('question.update.new', 'TEST'),
              id: 'question.update.new',
              result: 0,
              showAgain: true,
              showAgainValue: false,
            },
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
          windowsController.showWarningWindow(
            {
              type: 'warning',
              text: l10n.get('warn.ssl.install'),
              buttonLabel: l10n.get('i_understand'),
              id: 'ssl.install',
            },
            () => {},
          );
        },
      },
      {
        label: 'Warning cannot start',
        click: () => {
          windowsController.showWarningWindow(
            {
              type: 'warning',
              text: l10n.get('warn.pcsc.cannot_start'),
              title: l10n.get('warning.title.oh_no'),
              buttonLabel: l10n.get('i_understand'),
              id: 'warn.pcsc.cannot_start',
              showAgain: true,
              showAgainValue: false,
            },
            () => {},
          );
        },
      },
      {
        label: 'Warning crypto not found',
        click: () => {
          windowsController.showWarningWindow(
            {
              type: 'warning',
              text: l10n.get('warn.token.crypto_not_found', 'TEST'),
              title: l10n.get('warning.title.oh_no'),
              buttonLabel: l10n.get('close'),
              id: 'warn.token.crypto_not_found',
              showAgain: true,
              showAgainValue: false,
            },
            () => {},
          );
        },
      },
      {
        label: 'Warning crypto wrong',
        click: () => {
          windowsController.showWarningWindow(
            {
              type: 'warning',
              text: l10n.get('warn.token.crypto_wrong', 'TEST'),
              title: l10n.get('warning.title.oh_no'),
              buttonLabel: l10n.get('close'),
              id: 'warn.token.crypto_wrong',
              showAgain: true,
              showAgainValue: false,
            },
            () => {},
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
              resolve: () => undefined,
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
              resolve: () => undefined,
              reject: () => undefined,
            },
          );
        },
      },
    ],
  },
]);
