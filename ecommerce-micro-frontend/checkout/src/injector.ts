import { createAppInjector, AppInjectorProps } from '@ecommerce-platform/app-injector';
import CheckoutModule from './app/Module';
import { setupMocks } from './services/mocks';

setupMocks();

const CheckoutAppInjector = createAppInjector(CheckoutModule);

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
