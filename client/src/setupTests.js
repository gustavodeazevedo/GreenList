// jest-dom adds custom jest matchers for asserting on DOM nodes
import '@testing-library/jest-dom';

// Add TextEncoder/TextDecoder polyfill for Node.js environment
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
  global.TextDecoder = require('util').TextDecoder;
}