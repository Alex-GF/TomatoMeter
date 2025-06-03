import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { container } from '../config/container';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: container.spaceClient?.httpUrl,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': container.spaceClient?.apiKey!,
  },
});

export default axiosInstance;