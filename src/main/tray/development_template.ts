import { MenuItemConstructorOptions } from 'electron';
import { intl } from '../locale';
import {
  CreateErrorWindow,
  CreateQuestionWindow,
  CreateWarningWindow,
  CreateP11PinWindow,
  CreateTokenWindow,
  CreateKeyPinWindow,
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
          CreateErrorWindow({
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
          CreateErrorWindow({
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
          CreateP11PinWindow({
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
