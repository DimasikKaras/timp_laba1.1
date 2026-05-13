import axios from 'axios';

const resolveDefaultApiUrl = () => {
  if (typeof window === 'undefined') {
    throw new Error(
      'Environment variable REACT_APP_API_URL must be set for SSR/Node environments where window is unavailable.'
    );
  }

  const { protocol, hostname } = window.location;

  if (protocol !== 'http:' && protocol !== 'https:') {
    throw new Error(
      `Unsupported protocol "${protocol}" for API requests. Set REACT_APP_API_URL explicitly.`
    );
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
