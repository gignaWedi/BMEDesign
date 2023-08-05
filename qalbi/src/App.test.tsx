import React from 'react';
import { render } from '@testing-library/react';
import AppRoute from './App';

test('renders without crashing', () => {
  const { baseElement } = render(<AppRoute />);
  expect(baseElement).toBeDefined();
});
