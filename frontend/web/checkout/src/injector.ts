import { createAppInjector, AppInjectorProps } from '@ecommerce-platform/app-injector';
import App from './App';
import { setupMocks } from './services/mocks';

setupMocks();

const CheckoutAppInjector = createAppInjector(App);

export const inject = (elementId: string, props?: AppInjectorProps) => {
  CheckoutAppInjector.inject(elementId, props);
};

export const unmount = (elementId: string) => {
  CheckoutAppInjector.unmount(elementId);
};

export default {
  inject,
  unmount,
};
