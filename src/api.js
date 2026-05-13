import axios from 'axios';

const resolveDefaultApiUrl = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return `${window.location.protocol}//${window.location.hostname}:5000`;
};

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || resolveDefaultApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
