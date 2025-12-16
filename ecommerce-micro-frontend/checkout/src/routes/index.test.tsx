import { Route } from './index';
import '@testing-library/jest-dom';

describe('Checkout Index Route', () => {
  it('should export Route from file-based route', () => {
    expect(Route).toBeDefined();
  });

  it('should have correct route options', () => {
    expect(Route.options).toBeDefined();
    expect(Route.options.component).toBeDefined();
  });
});
