import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.clear();
});

test('renders login screen', () => {
  render(<App />);
  const headerElement = screen.getByText(/Вход в систему/i);
  expect(headerElement).toBeInTheDocument();
});
