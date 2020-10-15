import 'reflect-metadata';
import { Application } from './application';
import container from './container';

const application = container.resolve(Application);

application.start();
