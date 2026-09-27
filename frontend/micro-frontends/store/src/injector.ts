import {
  createAppInjector,
  AppInjectorProps,
} from '@ecommerce-platform/app-injector';
import App from './App';
import './services/mocks';

const StoreAppInjector = createAppInjector(App);

export const inject = (elementId: string, props?: AppInjectorProps) => {
  StoreAppInjector.inject(elementId, props);
};

export const unmount = (elementId: string) => {
  StoreAppInjector.unmount(elementId);
};

export default {
  inject,
  unmount,
};
