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
          CreateWarningWindow({
            params: {
              type: 'warning',
              text: intl('warn.ssl.install'),
              buttonLabel: intl('i_understand'),
              id: 'ssl.install',
            },
            onClosed: () => {
              // nothing
            },
          });
        },
      },
      {
        label: 'Warning cannot start',
        click: () => {
          CreateWarningWindow({
            params: {
              type: 'warning',
              text: intl('warn.pcsc.cannot_start'),
              title: intl('warning.title.oh_no'),
              buttonLabel: intl('i_understand'),
              id: 'warn.pcsc.cannot_start',
              showAgain: true,
              showAgainValue: false,
            },
            onClosed: () => {
              // nothing
            },
          });
        },
      },
      {
        label: 'Warning crypto not found',
        click: () => {
          CreateWarningWindow({
            params: {
              type: 'warning',
              text: intl('warn.token.crypto_not_found', 'TEST'),
              title: intl('warning.title.oh_no'),
              buttonLabel: intl('close'),
              id: 'warn.token.crypto_not_found',
              showAgain: true,
              showAgainValue: false,
            },
            onClosed: () => {
              // nothing
            },
          });
        },
      },
      {
        label: 'Warning crypto wrong',
        click: () => {
          CreateWarningWindow({
            params: {
              type: 'warning',
              text: intl('warn.token.crypto_wrong', 'TEST'),
              title: intl('warning.title.oh_no'),
              buttonLabel: intl('close'),
              id: 'warn.token.crypto_wrong',
              showAgain: true,
              showAgainValue: false,
            },
            onClosed: () => {
              // nothing
            },
          });
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
