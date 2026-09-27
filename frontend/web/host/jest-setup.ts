import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// react-router v7 relies on TextEncoder/TextDecoder, which jsdom does not provide.
Object.assign(globalThis, { TextEncoder, TextDecoder });

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

process.env.NX_API_BASE_URL = 'http://localhost:3000/api';
