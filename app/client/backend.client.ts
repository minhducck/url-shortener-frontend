import { Axios } from 'axios';

export const client = new Axios({
  baseURL: import.meta.env.VITE_API_ENDPOINT,
  timeout: 3000,
  timeoutErrorMessage: 'API timeout',
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
  },
  transformRequest: data => JSON.stringify(data),
  transformResponse: data => JSON.parse(data),
  validateStatus: status => status >= 200 && status < 300
});
