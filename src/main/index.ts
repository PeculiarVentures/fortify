import 'reflect-metadata';
import { Application } from './application';
import container from './container';

require('@electron/remote/main').initialize();

const application = container.resolve(Application);

application.start();
