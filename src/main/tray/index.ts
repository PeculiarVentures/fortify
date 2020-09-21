import { Menu, Tray } from 'electron';
import { icons } from '../const';
import { baseTemplate } from './base_template';
import { developmentTemplate } from './development_template';

const isDev = process.env.NODE_ENV === 'development';

class TrayCreator {
  static tray: Electron.Tray;

  static getTemplate() {
    return baseTemplate().concat(isDev ? developmentTemplate() : []);
  }

  static create() {
    if (!TrayCreator.tray) {
      TrayCreator.tray = new Tray(icons.tray);
    }

    const menu = Menu.buildFromTemplate(TrayCreator.getTemplate());

    TrayCreator.tray.setToolTip('Fortify');
    TrayCreator.tray.setContextMenu(menu);
  }
}

export const tray = TrayCreator;
