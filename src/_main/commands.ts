export enum ServerCommandsEnum {
  listening = 'listening',
  info = 'info',
  tokenNew = 'token_new',
  error = 'error',
  notify = 'notify',
  close = 'close',
}

export enum IpcMainCommandsEnum {
  twoKeyList = '2key-list',
  twoKeyRemove = '2key-remove',
  loggingOpen = 'logging-open',
  loggingStatus = 'logging-status',
  loggingStatusChange = 'logging-status-change',
  languageChange = 'language-change',
  languageGet = 'language-get',
  error = 'error',
}
