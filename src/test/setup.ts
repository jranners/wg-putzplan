import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock scrollTo as it's not implemented in jsdom
Object.defineProperty(window, 'scrollTo', { value: () => { }, writable: true });
