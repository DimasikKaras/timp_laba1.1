import { render, screen } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios');

test('renders dispatcher home page', async () => {
  axios.create.mockReturnValue(axios);
  axios.get.mockResolvedValue({ data: [] });

  render(<App />);

  expect(await screen.findByText('Система диспетчерской ПБ')).toBeInTheDocument();
  expect(screen.getByText('Объекты')).toBeInTheDocument();
  expect(screen.getByText('Персонал')).toBeInTheDocument();
  expect(screen.getByText('События')).toBeInTheDocument();
});
