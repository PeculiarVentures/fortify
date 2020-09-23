import { MenuItemConstructorOptions } from 'electron';
import { intl } from '../locale';
import {
  ErrorWindow,
  QuestionWindow,
  WarningWindow,
  P11PinWindow,
  TokenWindow,
  KeyPinWindow,
} from '../windows';

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
          TokenWindow.create({
            params: {
              type: 'token',
              text: intl('question.new.token'),
              id: 'question.new.token',
              showAgain: true,
              showAgainValue: false,
              result: 0,
            },
            onClosed: () => {},
          });
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Error SSL install',
        click: () => {
          ErrorWindow.create({
            params: {
              type: 'error',
              text: intl('error.ssl.install'),
            },
            onClosed: () => {},
          });
        },
      },
      {
        label: 'Error critical update',
        click: () => {
          ErrorWindow.create({
            params: {
              type: 'error',
              text: intl('error.critical.update'),
            },
            onClosed: () => {},
          });
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Question 2key remove',
        click: () => {
          QuestionWindow.create({
            params: {
              type: 'question',
              text: intl('question.2key.remove', 'TEST'),
              id: 'question.2key.remove',
              result: 0,
            },
            onClosed: () => {},
          });
        },
      },
      {
        label: 'Question update new',
        click: () => {
          QuestionWindow.create({
            params: {
              type: 'question',
              text: intl('question.update.new', 'TEST'),
              id: 'question.update.new',
              result: 0,
              showAgain: true,
              showAgainValue: false,
            },
            onClosed: () => {},
          });
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Warning SSL install',
        click: () => {
          WarningWindow.create({
            params: {
              type: 'warning',
              text: intl('warn.ssl.install'),
              buttonLabel: intl('i_understand'),
              id: 'ssl.install',
            },
            onClosed: () => {},
          });
        },
      },
      {
        label: 'Warning cannot start',
        click: () => {
          WarningWindow.create({
            params: {
              type: 'warning',
              text: intl('warn.pcsc.cannot_start'),
              title: intl('warning.title.oh_no'),
              buttonLabel: intl('i_understand'),
              id: 'warn.pcsc.cannot_start',
              showAgain: true,
              showAgainValue: false,
            },
            onClosed: () => {},
          });
        },
      },
      {
        label: 'Warning crypto not found',
        click: () => {
          WarningWindow.create({
            params: {
              type: 'warning',
              text: intl('warn.token.crypto_not_found', 'TEST'),
              title: intl('warning.title.oh_no'),
              buttonLabel: intl('close'),
              id: 'warn.token.crypto_not_found',
              showAgain: true,
              showAgainValue: false,
            },
            onClosed: () => {},
          });
        },
      },
      {
        label: 'Warning crypto wrong',
        click: () => {
          WarningWindow.create({
            params: {
              type: 'warning',
              text: intl('warn.token.crypto_wrong', 'TEST'),
              title: intl('warning.title.oh_no'),
              buttonLabel: intl('close'),
              id: 'warn.token.crypto_wrong',
              showAgain: true,
              showAgainValue: false,
            },
            onClosed: () => {},
          });
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Key PIN',
        click: () => {
          KeyPinWindow.create({
            params: {
              pin: '123456',
              origin: 'https://TEST.com/',
              accept: true,
              resolve: () => undefined,
            },
          });
        },
      },
      {
        label: 'P11 PIN',
        click: () => {
          P11PinWindow.create({
            params: {
              pin: '',
              origin: 'https://TEST.com/',
              resolve: () => undefined,
              reject: () => undefined,
            },
          });
        },
      },
    ],
  },
]);
