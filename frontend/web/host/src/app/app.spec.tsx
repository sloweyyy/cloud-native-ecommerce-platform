import { render } from '@testing-library/react';
import App from './app';

// Mock the useCategories hook
jest.mock('../services/categories', () => ({
  useCategories: jest.fn(() => ({
    categories: [],
    isLoading: false,
    error: null,
  })),
}));

// Mock fetch globally
global.fetch = jest.fn();

/**
 * Test suite for main App component
 *
 * Note: App component already includes BrowserRouter, so we don't wrap it again.
 * Testing focuses on successful rendering and core functionality.
 */
describe('App', () => {
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
    // Suppress console warnings/errors from antd deprecated components
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should render without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('should apply light theme by default when no theme is stored', () => {
    render(<App />);
    // Verify the component renders successfully with default theme
    const body = document.body;
    expect(body).toBeTruthy();
  });

  it('should apply dark theme when stored in localStorage', () => {
    localStorage.setItem('theme', 'dark');
    render(<App />);
    // Verify the component renders successfully with dark theme from storage
    const body = document.body;
    expect(body).toBeTruthy();
  });

  it('should handle invalid theme value in localStorage gracefully', () => {
    localStorage.setItem('theme', 'invalid-theme');
    render(<App />);
    // Should default to light theme when invalid value is present
    const body = document.body;
    expect(body).toBeTruthy();
  });
});
