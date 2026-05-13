import axios from 'axios';

const defaultApiUrl = `${window.location.protocol}//${window.location.hostname}:5000`;

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || defaultApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
