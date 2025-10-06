import axios, { AxiosInstance } from 'axios';
import { useTokenService } from 'space-react-client';

export default function useAxios() {
  const tokenService = useTokenService();

  const axiosInstance: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL ?? 'http://localhost:8080/api',
    headers: {
      'Content-Type': 'application/json',
      'user-id': 'test-user-id',
    },
  });

  // Response interceptor to handle the Pricing-Token header
  axiosInstance.interceptors.response.use(
    response => {
      const token = response.headers['pricing-token']; // This must be in lowercase
      
      if (token) {
        tokenService.update(token);
      }
      return response;
    },
    error => {
      return Promise.reject(error);
    }
  );

  return axiosInstance;
}
