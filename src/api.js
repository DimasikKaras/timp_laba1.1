import axios from 'axios';

const resolveDefaultApiUrl = () => {
  if (typeof window === 'undefined') {
    throw new Error('REACT_APP_API_URL must be set when window is unavailable.');
  }

  const { protocol, hostname } = window.location;

  if (protocol !== 'http:' && protocol !== 'https:') {
    return '';
  }

  return `${protocol}//${hostname}:5000`;
};

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || resolveDefaultApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
