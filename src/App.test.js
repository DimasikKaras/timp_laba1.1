import { render, screen } from '@testing-library/react';
import Login from './pages/Login';

test('renders login form', () => {
  render(<Login onLogin={() => {}} />);
  const heading = screen.getByText(/Вход в систему/i);
  expect(heading).toBeInTheDocument();
});
