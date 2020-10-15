import { container, Lifecycle } from 'tsyringe';
import { Server } from './server';

container.register('server', Server, {
  lifecycle: Lifecycle.ContainerScoped,
});

export default container;
