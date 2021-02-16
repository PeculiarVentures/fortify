import { Menu, Tray } from 'electron';
import { isDevelopment, icons } from '../constants';
import { baseTemplate } from './base_template';
import { developmentTemplate } from './development_template';

let trayElectron: Electron.Tray;

const getTemplate = () => (
  baseTemplate().concat(isDevelopment ? developmentTemplate() : [])
);

const setIcon = (hasNotifications?: boolean) => {
  const icon = hasNotifications ? icons.trayNotification : icons.tray;

  trayElectron.setImage(icon);
};

const create = () => {
  if (!trayElectron) {
    trayElectron = new Tray(icons.tray);
  }

  const menu = Menu.buildFromTemplate(getTemplate());

  trayElectron.setToolTip('Fortify');
  trayElectron.setContextMenu(menu);
};

const refresh = () => {
  create();
};

export const tray = {
  create,
  refresh,
  setIcon,
};
